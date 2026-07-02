package com.interviewai.controller;

import com.interviewai.entity.Interview;
import com.interviewai.entity.SystemSettings;
import com.interviewai.entity.User;
import com.interviewai.repository.InterviewRepository;
import com.interviewai.repository.SystemSettingsRepository;
import com.interviewai.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final InterviewRepository interviewRepository;
    private final SystemSettingsRepository settingsRepository;

    public AdminController(UserRepository userRepository, 
                           InterviewRepository interviewRepository, 
                           SystemSettingsRepository settingsRepository) {
        this.userRepository = userRepository;
        this.interviewRepository = interviewRepository;
        this.settingsRepository = settingsRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        // Clear passwords for response safety
        users.forEach(u -> u.setPassword("[PROTECTED]"));
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String role = request.get("role");
        if (role == null || (!"ROLE_USER".equals(role) && !"ROLE_ADMIN".equals(role))) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role specified"));
        }

        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        user.setRole(role);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User role updated successfully"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long totalUsers = userRepository.count();
        long totalInterviews = interviewRepository.count();

        // Calculate average score
        List<Interview> allInterviews = interviewRepository.findAll();
        double sum = 0;
        int completedCount = 0;
        Map<String, Integer> categoryDistribution = new HashMap<>();

        for (Interview i : allInterviews) {
            if ("COMPLETED".equals(i.getStatus()) && i.getScore() != null) {
                sum += i.getScore();
                completedCount++;
            }
            categoryDistribution.put(i.getCategory(), categoryDistribution.getOrDefault(i.getCategory(), 0) + 1);
        }

        double averageScore = completedCount == 0 ? 0.0 : sum / completedCount;

        // Get 5 recent interviews
        List<Interview> sortedInterviews = new ArrayList<>(allInterviews);
        sortedInterviews.sort((i1, i2) -> i2.getCreatedAt().compareTo(i1.getCreatedAt()));
        List<Map<String, Object>> recentInterviews = new ArrayList<>();
        int limit = Math.min(sortedInterviews.size(), 5);
        for (int index = 0; index < limit; index++) {
            Interview i = sortedInterviews.get(index);
            recentInterviews.add(Map.of(
                    "id", i.getId(),
                    "userEmail", i.getUser().getEmail(),
                    "userFullName", i.getUser().getFullName(),
                    "category", i.getCategory(),
                    "score", i.getScore() != null ? i.getScore() : 0,
                    "createdAt", i.getCreatedAt()
            ));
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalInterviews", totalInterviews);
        stats.put("averageScore", averageScore);
        stats.put("categoryDistribution", categoryDistribution);
        stats.put("recentInterviews", recentInterviews);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings() {
        SystemSettings settings = settingsRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> settingsRepository.save(SystemSettings.builder().build()));
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody SystemSettings request) {
        SystemSettings settings = settingsRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> SystemSettings.builder().build());

        settings.setAiProvider(request.getAiProvider());
        settings.setApiKey(request.getApiKey());
        settings.setModelName(request.getModelName());
        settings.setTemperature(request.getTemperature());
        settings.setSystemPrompt(request.getSystemPrompt());

        SystemSettings saved = settingsRepository.save(settings);
        return ResponseEntity.ok(saved);
    }
}
