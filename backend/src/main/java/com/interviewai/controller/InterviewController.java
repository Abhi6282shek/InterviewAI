package com.interviewai.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewai.dto.AnswerSubmissionRequest;
import com.interviewai.dto.InterviewSetupRequest;
import com.interviewai.entity.*;
import com.interviewai.repository.*;
import com.interviewai.service.AiService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final UserRepository userRepository;
    private final InterviewRepository interviewRepository;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewAnswerRepository answerRepository;
    private final InterviewResultRepository resultRepository;
    private final UserProgressRepository progressRepository;
    private final AiService aiService;
    private final ObjectMapper objectMapper;

    public InterviewController(UserRepository userRepository,
                               InterviewRepository interviewRepository,
                               InterviewQuestionRepository questionRepository,
                               InterviewAnswerRepository answerRepository,
                               InterviewResultRepository resultRepository,
                               UserProgressRepository progressRepository,
                               AiService aiService) {
        this.userRepository = userRepository;
        this.interviewRepository = interviewRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.resultRepository = resultRepository;
        this.progressRepository = progressRepository;
        this.aiService = aiService;
        this.objectMapper = new ObjectMapper();
    }

    @PostMapping("/setup")
    public ResponseEntity<?> setupInterview(Principal principal, @Valid @RequestBody InterviewSetupRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
        }
        User user = userOpt.get();

        try {
            // 1. Generate Questions via AI service
            List<Map<String, String>> generatedQuestions = aiService.generateQuestions(
                    request.getCategory(), request.getDifficulty(), request.getType()
            );

            if (generatedQuestions == null || generatedQuestions.isEmpty()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Failed to generate interview questions"));
            }

            // 2. Create and Save Interview Session
            Interview interview = Interview.builder()
                    .user(user)
                    .category(request.getCategory())
                    .difficulty(request.getDifficulty())
                    .type(request.getType())
                    .status("IN_PROGRESS")
                    .score(0)
                    .durationSeconds(0)
                    .build();
            Interview savedInterview = interviewRepository.save(interview);

            // 3. Save Questions
            List<Map<String, Object>> clientQuestions = new ArrayList<>();
            for (int i = 0; i < generatedQuestions.size(); i++) {
                Map<String, String> qMap = generatedQuestions.get(i);
                InterviewQuestion question = InterviewQuestion.builder()
                        .interview(savedInterview)
                        .questionText(qMap.get("questionText"))
                        .idealAnswer(qMap.get("idealAnswer"))
                        .displayOrder(i + 1)
                        .bookmarked(false)
                        .build();
                InterviewQuestion savedQuestion = questionRepository.save(question);

                // Build question payload for the client (excluding idealAnswer)
                clientQuestions.add(Map.of(
                        "id", savedQuestion.getId(),
                        "questionText", savedQuestion.getQuestionText(),
                        "displayOrder", savedQuestion.getDisplayOrder(),
                        "bookmarked", savedQuestion.getBookmarked()
                ));
            }

            return ResponseEntity.ok(Map.of(
                    "interviewId", savedInterview.getId(),
                    "category", savedInterview.getCategory(),
                    "difficulty", savedInterview.getDifficulty(),
                    "type", savedInterview.getType(),
                    "questions", clientQuestions
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error initializing interview session: " + e.getMessage()));
        }
    }

    @PostMapping("/submit-answer")
    public ResponseEntity<?> submitAnswer(Principal principal, @Valid @RequestBody AnswerSubmissionRequest request) {
        Optional<InterviewQuestion> questionOpt = questionRepository.findById(request.getQuestionId());
        if (questionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Question not found"));
        }
        InterviewQuestion question = questionOpt.get();

        // Security: Ensure applicant owns this interview
        if (!question.getInterview().getUser().getEmail().equals(principal.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
        }

        try {
            // 1. Grade the user answer using AI
            Map<String, Object> evaluation = aiService.evaluateAnswer(
                    question.getQuestionText(), request.getUserAnswer()
            );

            Integer score = (Integer) evaluation.get("score");
            String feedback = (String) evaluation.get("feedback");

            // 2. Save Answer
            Optional<InterviewAnswer> existingAnswerOpt = answerRepository.findByQuestionId(question.getId());
            InterviewAnswer answer;
            if (existingAnswerOpt.isPresent()) {
                answer = existingAnswerOpt.get();
                answer.setUserAnswer(request.getUserAnswer());
                answer.setAiFeedback(feedback);
                answer.setScore(score);
                answer.setTimeTakenSeconds(request.getTimeTakenSeconds());
            } else {
                answer = InterviewAnswer.builder()
                        .question(question)
                        .userAnswer(request.getUserAnswer())
                        .aiFeedback(feedback)
                        .score(score)
                        .timeTakenSeconds(request.getTimeTakenSeconds())
                        .build();
            }

            InterviewAnswer savedAnswer = answerRepository.save(answer);

            return ResponseEntity.ok(Map.of(
                    "answerId", savedAnswer.getId(),
                    "score", score,
                    "feedback", feedback,
                    "idealAnswer", question.getIdealAnswer()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error submitting answer: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> completeInterview(Principal principal, @PathVariable Long id) {
        Optional<Interview> interviewOpt = interviewRepository.findById(id);
        if (interviewOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Interview session not found"));
        }
        Interview interview = interviewOpt.get();

        // Access check
        if (!interview.getUser().getEmail().equals(principal.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
        }

        if (!"IN_PROGRESS".equals(interview.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Interview session is already finalized"));
        }

        try {
            List<InterviewQuestion> questions = questionRepository.findByInterviewIdOrderByDisplayOrderAsc(interview.getId());
            
            // Compile scores and answers
            int totalScore = 0;
            int totalDuration = 0;
            int answeredCount = 0;

            List<Map<String, Object>> answersSummary = new ArrayList<>();

            for (InterviewQuestion q : questions) {
                Optional<InterviewAnswer> answerOpt = answerRepository.findByQuestionId(q.getId());
                int score = 0;
                String userAns = "[No Answer Provided]";
                if (answerOpt.isPresent()) {
                    InterviewAnswer ans = answerOpt.get();
                    score = ans.getScore() != null ? ans.getScore() : 0;
                    userAns = ans.getUserAnswer();
                    totalDuration += ans.getTimeTakenSeconds();
                    answeredCount++;
                }
                totalScore += score;
                answersSummary.add(Map.of("question", q.getQuestionText(), "answer", userAns, "score", score));
            }

            int finalScore = questions.isEmpty() ? 0 : totalScore / questions.size();

            // 1. Generate Overall Feedback and Analytics using Heuristics or Mock Fallback
            // (Creates a professional summary without blocking on extensive LLM prompts)
            String overallFeedback = String.format(
                    "Completed practicing %s (%s). You answered %d of %d questions. Your composite interview score is %d%%.",
                    interview.getCategory(), interview.getDifficulty(), answeredCount, questions.size(), finalScore
            );

            List<String> strengths = new ArrayList<>();
            List<String> weaknesses = new ArrayList<>();
            List<String> recommendations = new ArrayList<>();

            if (finalScore >= 80) {
                strengths.add("Strong technical comprehension");
                strengths.add("Good speed and conceptual articulation");
                recommendations.add("Explore Advanced category scenarios next");
                recommendations.add("Practice mock system design challenges");
            } else if (finalScore >= 60) {
                strengths.add("Foundational knowledge is clear");
                weaknesses.add("Lacks granular syntax or lifecycle insights");
                recommendations.add("Review core documentation on lower-scoring questions");
                recommendations.add("Re-take Intermediate mock tests");
            } else {
                weaknesses.add("Struggles with basic concepts under time pressure");
                weaknesses.add("Answers are too short or missing key architectural keywords");
                recommendations.add("Go through beginner concepts and study ideal answers closely");
            }

            // Always add a category recommendation
            recommendations.add(String.format("Study the official roadmap for %s development", interview.getCategory()));

            String certificateId = finalScore >= 70 ? "CERT-" + interview.getCategory().toUpperCase().substring(0, 3) + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase() : null;

            // 2. Create Interview Result
            InterviewResult result = InterviewResult.builder()
                    .interview(interview)
                    .overallFeedback(overallFeedback)
                    .strengths(objectMapper.writeValueAsString(strengths))
                    .weaknesses(objectMapper.writeValueAsString(weaknesses))
                    .careerRecommendations(objectMapper.writeValueAsString(recommendations))
                    .certificateId(certificateId)
                    .build();

            // 3. Finalize Interview
            interview.setStatus("COMPLETED");
            interview.setScore(finalScore);
            interview.setDurationSeconds(totalDuration);
            interview.setCompletedAt(LocalDateTime.now());

            interviewRepository.save(interview);
            resultRepository.save(result);

            // 4. Update User Progress
            updateUserProgress(interview.getUser(), finalScore, interview.getCategory());

            return ResponseEntity.ok(Map.of(
                    "interviewId", interview.getId(),
                    "score", finalScore,
                    "durationSeconds", totalDuration,
                    "overallFeedback", overallFeedback,
                    "strengths", strengths,
                    "weaknesses", weaknesses,
                    "careerRecommendations", recommendations,
                    "certificateId", certificateId != null ? certificateId : ""
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error finalizing interview session: " + e.getMessage()));
        }
    }

    private void updateUserProgress(User user, int newScore, String category) throws Exception {
        Optional<UserProgress> progressOpt = progressRepository.findByUserId(user.getId());
        UserProgress progress = progressOpt.orElseGet(() -> UserProgress.builder().user(user).build());

        // Increment count
        int total = progress.getTotalInterviews() != null ? progress.getTotalInterviews() : 0;
        double currentAvg = progress.getAverageScore() != null ? progress.getAverageScore() : 0.0;
        int highest = progress.getHighestScore() != null ? progress.getHighestScore() : 0;

        double newAvg = ((currentAvg * total) + newScore) / (total + 1);
        int newHighest = Math.max(highest, newScore);

        progress.setTotalInterviews(total + 1);
        progress.setAverageScore(newAvg);
        progress.setHighestScore(newHighest);

        // Update categories maps
        Map<String, Integer> catMap = new HashMap<>();
        String currentCatJson = progress.getCompletedCategories();
        if (currentCatJson != null && !currentCatJson.trim().isEmpty() && !currentCatJson.equals("{}")) {
            try {
                catMap = objectMapper.readValue(currentCatJson, new TypeReference<Map<String, Integer>>() {});
            } catch (Exception ignored) {}
        }
        catMap.put(category, catMap.getOrDefault(category, 0) + 1);
        progress.setCompletedCategories(objectMapper.writeValueAsString(catMap));

        progress.setLastActivity(LocalDateTime.now());
        progressRepository.save(progress);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(Principal principal) {
        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
        }

        List<Interview> interviews = interviewRepository.findByUserIdOrderByCreatedAtDesc(userOpt.get().getId());
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/{id}/results")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> getResults(Principal principal, @PathVariable Long id) {
        Optional<Interview> interviewOpt = interviewRepository.findById(id);
        if (interviewOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Interview session not found"));
        }
        Interview interview = interviewOpt.get();

        // Security check
        if (!interview.getUser().getEmail().equals(principal.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
        }

        try {
            Optional<InterviewResult> resultOpt = resultRepository.findByInterviewId(interview.getId());
            List<InterviewQuestion> questions = questionRepository.findByInterviewIdOrderByDisplayOrderAsc(interview.getId());

            List<Map<String, Object>> qHistory = new ArrayList<>();
            for (InterviewQuestion q : questions) {
                Optional<InterviewAnswer> ansOpt = answerRepository.findByQuestionId(q.getId());
                qHistory.add(Map.of(
                        "id", q.getId(),
                        "questionText", q.getQuestionText(),
                        "idealAnswer", q.getIdealAnswer(),
                        "bookmarked", q.getBookmarked(),
                        "userAnswer", ansOpt.map(InterviewAnswer::getUserAnswer).orElse("[No Answer]"),
                        "aiFeedback", ansOpt.map(InterviewAnswer::getAiFeedback).orElse(""),
                        "score", ansOpt.map(InterviewAnswer::getScore).orElse(0),
                        "timeTakenSeconds", ansOpt.map(InterviewAnswer::getTimeTakenSeconds).orElse(0)
                ));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("interviewId", interview.getId());
            response.put("category", interview.getCategory());
            response.put("difficulty", interview.getDifficulty());
            response.put("type", interview.getType());
            response.put("status", interview.getStatus());
            response.put("score", interview.getScore());
            response.put("durationSeconds", interview.getDurationSeconds());
            response.put("createdAt", interview.getCreatedAt());
            response.put("completedAt", interview.getCompletedAt());
            response.put("questions", qHistory);

            if (resultOpt.isPresent()) {
                InterviewResult result = resultOpt.get();
                response.put("overallFeedback", result.getOverallFeedback());
                response.put("strengths", objectMapper.readValue(result.getStrengths(), List.class));
                response.put("weaknesses", objectMapper.readValue(result.getWeaknesses(), List.class));
                response.put("careerRecommendations", objectMapper.readValue(result.getCareerRecommendations(), List.class));
                response.put("certificateId", result.getCertificateId() != null ? result.getCertificateId() : "");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error packaging result: " + e.getMessage()));
        }
    }

    @PostMapping("/bookmark-question/{questionId}")
    public ResponseEntity<?> bookmarkQuestion(Principal principal, @PathVariable Long questionId) {
        Optional<InterviewQuestion> questionOpt = questionRepository.findById(questionId);
        if (questionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Question not found"));
        }
        InterviewQuestion question = questionOpt.get();

        if (!question.getInterview().getUser().getEmail().equals(principal.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
        }

        question.setBookmarked(!question.getBookmarked());
        InterviewQuestion saved = questionRepository.save(question);
        return ResponseEntity.ok(Map.of("bookmarked", saved.getBookmarked()));
    }

    @GetMapping("/progress")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> getProgress(Principal principal) {
        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
        }
        User user = userOpt.get();

        Optional<UserProgress> progressOpt = progressRepository.findByUserId(user.getId());
        if (progressOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "totalInterviews", 0,
                    "averageScore", 0.0,
                    "highestScore", 0,
                    "completedCategories", Map.of()
            ));
        }

        UserProgress progress = progressOpt.get();
        Map<String, Integer> catMap = new HashMap<>();
        try {
            if (progress.getCompletedCategories() != null && !progress.getCompletedCategories().isEmpty()) {
                catMap = objectMapper.readValue(progress.getCompletedCategories(), Map.class);
            }
        } catch (Exception ignored) {}

        return ResponseEntity.ok(Map.of(
                "totalInterviews", progress.getTotalInterviews(),
                "averageScore", progress.getAverageScore(),
                "highestScore", progress.getHighestScore(),
                "completedCategories", catMap,
                "lastActivity", progress.getLastActivity()
        ));
    }
}
