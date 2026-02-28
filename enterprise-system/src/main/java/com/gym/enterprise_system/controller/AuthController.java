package com.gym.enterprise_system.controller;

import com.gym.enterprise_system.dto.LoginDto;
import com.gym.enterprise_system.dto.UserRegistrationDto;
import com.gym.enterprise_system.entity.PasswordResetToken;
import com.gym.enterprise_system.entity.User;
import com.gym.enterprise_system.repository.PasswordResetTokenRepository;
import com.gym.enterprise_system.repository.UserRepository;
import com.gym.enterprise_system.service.EmailService;
import com.gym.enterprise_system.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    // ALL REQUIRED DEPENDENCIES INJECTED HERE
    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;

    // 1. Standard Member Registration
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegistrationDto registrationDto) {
        try {
            User registeredUser = userService.registerUser(registrationDto);
            return ResponseEntity
                    .ok(Map.of("message", "User registered successfully!", "userId", registeredUser.getId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 2. Standard Member Login
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginDto loginDto) {
        try {
            User user = userService.login(loginDto);

            // THE FIX: Intercept banned/inactive members right here!
            if (user.getIsActive() != null && !user.getIsActive()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Your account has been suspended. Please contact administration."));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("firstName", user.getFirstName());
            response.put("role", user.getRole());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    // 3. STRICT ADMIN LOGIN
    @PostMapping("/admin-login")
    public ResponseEntity<?> adminLogin(@Valid @RequestBody LoginDto loginDto) {
        try {
            User user = userService.login(loginDto);

            if (!"ADMIN".equals(user.getRole().name())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access Denied: Administrator privileges required."));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("firstName", user.getFirstName());
            response.put("role", user.getRole());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid admin credentials."));
        }
    }

    // 4. FORGOT PASSWORD (Request Reset Link)
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // Generate a secure random token
            String token = UUID.randomUUID().toString();

            // Delete any existing tokens for this user so they don't pile up
            tokenRepository.deleteByUser_Id(user.getId());

            // Save the new token with a 15-minute expiration
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(token)
                    .user(user)
                    .expiryDate(LocalDateTime.now().plusMinutes(15))
                    .build();
            tokenRepository.save(resetToken);

            // Send the email
            emailService.sendPasswordResetEmail(user.getEmail(), token);
        }

        // Always return success to prevent email enumeration attacks
        return ResponseEntity
                .ok(Map.of("message", "If an account with that email exists, a password reset link has been sent."));
    }

    // 5. RESET PASSWORD (Submit New Password)
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        Optional<PasswordResetToken> tokenOptional = tokenRepository.findByToken(token);

        if (tokenOptional.isEmpty() || tokenOptional.get().getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired password reset token."));
        }

        User user = tokenOptional.get().getUser();

        // Update password (using simulation hash for now)
        user.setPasswordHash("[BCRYPT_HASH_SIMULATION]_" + newPassword);
        userRepository.save(user);

        // Delete the token so it can't be used again
        tokenRepository.delete(tokenOptional.get());

        return ResponseEntity.ok(Map.of("message", "Password successfully reset. You can now log in."));
    }
}