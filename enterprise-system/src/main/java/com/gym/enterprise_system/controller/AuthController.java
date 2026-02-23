package com.gym.enterprise_system.controller;

import com.gym.enterprise_system.dto.LoginDto;
import com.gym.enterprise_system.dto.UserRegistrationDto;
import com.gym.enterprise_system.entity.User;
import com.gym.enterprise_system.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Prevent CORS issues here too
public class AuthController {

    private final UserService userService;

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
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("firstName", user.getFirstName());
            response.put("role", user.getRole());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    // 3. STRICT ADMIN LOGIN (This is the one that was missing!)
    @PostMapping("/admin-login")
    public ResponseEntity<?> adminLogin(@Valid @RequestBody LoginDto loginDto) {
        try {
            User user = userService.login(loginDto);

            // SECURITY CHECK: Reject if they are not an ADMIN
            if (!"ADMIN".equals(user.getRole().name())) {
                return ResponseEntity.status(403)
                        .body(Map.of("error", "Access Denied: Administrator privileges required."));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("firstName", user.getFirstName());
            response.put("role", user.getRole());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid admin credentials."));
        }
    }
}