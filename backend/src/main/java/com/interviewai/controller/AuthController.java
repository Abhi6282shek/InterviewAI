package com.interviewai.controller;

import com.interviewai.dto.AuthResponse;
import com.interviewai.dto.LoginRequest;
import com.interviewai.dto.RegisterRequest;
import com.interviewai.entity.User;
import com.interviewai.entity.UserProgress;
import com.interviewai.repository.UserProgressRepository;
import com.interviewai.repository.UserRepository;
import com.interviewai.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final UserProgressRepository userProgressRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    // Static map to hold reset tokens in memory for portfolio demonstration
    private static final Map<String, String> resetTokenToEmailMap = new HashMap<>();

    public AuthController(UserRepository userRepository, 
                          UserProgressRepository userProgressRepository, 
                          PasswordEncoder passwordEncoder, 
                          JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.userProgressRepository = userProgressRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use"));
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role("ROLE_USER")
                .build();

        User savedUser = userRepository.save(user);

        // Initialize User Progress record
        UserProgress progress = UserProgress.builder()
                .user(savedUser)
                .totalInterviews(0)
                .averageScore(0.0)
                .highestScore(0)
                .completedCategories("{}")
                .build();
        userProgressRepository.save(progress);

        String token = tokenProvider.generateToken(savedUser.getEmail(), savedUser.getRole());

        return ResponseEntity.status(HttpStatus.CREATED).body(AuthResponse.builder()
                .token(token)
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole())
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
        }

        User user = userOpt.get();
        String token = tokenProvider.generateToken(user.getEmail(), user.getRole());

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || !userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "User with this email does not exist"));
        }

        // Generate dynamic token for demonstration
        String token = "RESET-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        resetTokenToEmailMap.put(token, email);

        // Return token directly for simple user testing (no real mailer is needed)
        return ResponseEntity.ok(Map.of(
                "message", "Password reset token generated. Complete reset using this token.",
                "token", token
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || newPassword == null || !resetTokenToEmailMap.containsKey(token)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired reset token"));
        }

        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters long"));
        }

        String email = resetTokenToEmailMap.get(token);
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            resetTokenToEmailMap.remove(token);
            return ResponseEntity.ok(Map.of("message", "Password has been reset successfully"));
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error updating password"));
    }
}
