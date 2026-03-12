package com.gym.enterprise_system.controller;

import com.gym.enterprise_system.entity.Role;
import com.gym.enterprise_system.entity.User;
import com.gym.enterprise_system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

  @Autowired
  private UserRepository userRepository;

  /**
   * Get all active trainers
   */
  @GetMapping("/trainers")
  public ResponseEntity<List<Map<String, Object>>> getAllTrainers() {
    try {
      List<Map<String, Object>> trainers = userRepository.findActiveTrainers().stream()
          .map(trainer -> Map.<String, Object>of(
              "id", trainer.getId(),
              "firstName", trainer.getFirstName(),
              "lastName", trainer.getLastName(),
              "email", trainer.getEmail(),
              "phone", trainer.getPhone() != null ? trainer.getPhone() : ""))
          .collect(Collectors.toList());
      return ResponseEntity.ok(trainers);
    } catch (Exception e) {
      return ResponseEntity.badRequest().build();
    }
  }

  /**
     * Get a specific user by ID - returns basic user info with currentStatus
     */
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable UUID userId) {
        try {
            Optional<User> optUser = userRepository.findById(userId);
            if (optUser.isPresent()) {
                User u = optUser.get();
                Map<String, Object> response = new java.util.LinkedHashMap<>();
                response.put("id", u.getId());
                response.put("firstName", u.getFirstName());
                response.put("lastName", u.getLastName());
                response.put("email", u.getEmail());
                response.put("phone", u.getPhone() != null ? u.getPhone() : "");
                response.put("address", u.getAddress() != null ? u.getAddress() : "");
                response.put("profilePhotoPath", u.getProfilePhotoPath() != null ? u.getProfilePhotoPath() : "");
                response.put("role", u.getRole().toString());
                response.put("currentStatus", u.getCurrentStatus() != null ? u.getCurrentStatus() : "INACTIVE");
                response.put("isActive", u.getIsActive());
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

/**
     * Get all active users (basic info)
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllActiveUsers() {
        try {
            List<Map<String, Object>> users = userRepository.findByIsActiveTrue().stream()
                    .map(user -> Map.<String, Object>of(
                            "id", user.getId(),
                            "firstName", user.getFirstName(),
                            "lastName", user.getLastName(),
                            "email", user.getEmail(),
                            "role", user.getRole().toString()
                    ))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
