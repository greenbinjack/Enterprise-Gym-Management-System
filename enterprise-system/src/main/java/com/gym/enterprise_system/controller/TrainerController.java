package com.gym.enterprise_system.controller;

import com.gym.enterprise_system.entity.User;
import com.gym.enterprise_system.repository.NotificationRepository;
import com.gym.enterprise_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trainer")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TrainerController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // Fetch Notifications for Dashboard
    @GetMapping("/{userId}/notifications")
    public ResponseEntity<?> getNotifications(@PathVariable UUID userId) {
        List<Map<String, Object>> notifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(n -> Map.<String, Object>of(
                        "id", n.getId(),
                        "message", n.getMessage(),
                        "isRead", n.getIsRead(),
                        "date", n.getCreatedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(notifs);
    }

    // Account Activation (Set Password)
    @PostMapping("/activate")
    public ResponseEntity<?> activateAccount(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.getPasswordHash().startsWith("[TEMP_HASH]")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Account is already activated. Please login normally."));
        }

        // In a real app, use BCryptPasswordEncoder here
        user.setPasswordHash("[BCRYPT_HASH_SIMULATION]_" + newPassword);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Account activated successfully! You can now log in."));
    }
}