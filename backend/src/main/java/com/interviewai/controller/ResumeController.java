package com.interviewai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewai.entity.Resume;
import com.interviewai.entity.User;
import com.interviewai.repository.ResumeRepository;
import com.interviewai.repository.UserRepository;
import com.interviewai.service.AiService;
import com.interviewai.service.ResumeParserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeParserService resumeParserService;
    private final AiService aiService;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public ResumeController(ResumeParserService resumeParserService, 
                            AiService aiService, 
                            ResumeRepository resumeRepository, 
                            UserRepository userRepository) {
        this.resumeParserService = resumeParserService;
        this.aiService = aiService;
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.objectMapper = new ObjectMapper();
    }

    @PostMapping("/upload")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> uploadResume(Principal principal, @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File is empty. Please upload a valid PDF."));
        }
        
        if (!"application/pdf".equalsIgnoreCase(file.getContentType())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Only PDF resumes are supported."));
        }

        try {
            Optional<User> userOpt = userRepository.findByEmail(principal.getName());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
            }
            User user = userOpt.get();

            // 1. Extract text from PDF
            String resumeText = resumeParserService.parsePdf(file.getBytes());

            // 2. Perform AI ATS analysis
            Map<String, Object> analysis = aiService.analyzeResume(resumeText);

            // 3. Serialize lists to JSON string
            Integer atsScore = (Integer) analysis.get("atsScore");
            String strengths = objectMapper.writeValueAsString(analysis.get("strengths"));
            String weaknesses = objectMapper.writeValueAsString(analysis.get("weaknesses"));
            String recommendedSkills = objectMapper.writeValueAsString(analysis.get("recommendedSkills"));
            String improvements = objectMapper.writeValueAsString(analysis.get("improvements"));

            // 4. Save to Database
            Resume resume = Resume.builder()
                    .user(user)
                    .fileName(file.getOriginalFilename())
                    .atsScore(atsScore)
                    .strengths(strengths)
                    .weaknesses(weaknesses)
                    .recommendedSkills(recommendedSkills)
                    .improvements(improvements)
                    .rawText(resumeText)
                    .build();

            Resume savedResume = resumeRepository.save(resume);

            return ResponseEntity.ok(Map.of(
                    "id", savedResume.getId(),
                    "fileName", savedResume.getFileName(),
                    "atsScore", atsScore,
                    "strengths", analysis.get("strengths"),
                    "weaknesses", analysis.get("weaknesses"),
                    "recommendedSkills", analysis.get("recommendedSkills"),
                    "improvements", analysis.get("improvements"),
                    "createdAt", savedResume.getCreatedAt()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to analyze resume: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserResumes(Principal principal) {
        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
        }

        List<Resume> resumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(userOpt.get().getId());
        return ResponseEntity.ok(resumes);
    }

    @GetMapping("/{id}")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> getResumeById(Principal principal, @PathVariable Long id) {
        Optional<Resume> resumeOpt = resumeRepository.findById(id);
        if (resumeOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Resume resume = resumeOpt.get();
        // Access control: Ensure user owns this resume
        if (!resume.getUser().getEmail().equals(principal.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
        }

        try {
            // Unpack JSON strings back to lists for client response
            List<String> strengths = objectMapper.readValue(resume.getStrengths(), List.class);
            List<String> weaknesses = objectMapper.readValue(resume.getWeaknesses(), List.class);
            List<String> recommendedSkills = objectMapper.readValue(resume.getRecommendedSkills(), List.class);
            List<String> improvements = objectMapper.readValue(resume.getImprovements(), List.class);

            return ResponseEntity.ok(Map.of(
                    "id", resume.getId(),
                    "fileName", resume.getFileName(),
                    "atsScore", resume.getAtsScore(),
                    "strengths", strengths,
                    "weaknesses", weaknesses,
                    "recommendedSkills", recommendedSkills,
                    "improvements", improvements,
                    "createdAt", resume.getCreatedAt()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error unpacking resume data: " + e.getMessage()));
        }
    }
}
