package com.gym.enterprise_system.controller;

import com.gym.enterprise_system.entity.Role;
import com.gym.enterprise_system.entity.User;
import com.gym.enterprise_system.repository.UserRepository;
import com.gym.enterprise_system.service.EmailService;
import com.gym.enterprise_system.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StaffManagementController {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final FileStorageService fileStorageService;

    // ============================================================
    // ADMIN ENDPOINTS - Managing Staff accounts
    // ============================================================

    /**
     * Admin creates a brand new staff member.
     * Sends an email with a temp password and activation link.
     */
    @PostMapping("/api/admin/staff/create")
    public ResponseEntity<?> createStaff(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required."));
        }
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "A user with this email already exists."));
        }

        String tempPassword = UUID.randomUUID().toString().substring(0, 8);
        String encodedPassword = "[BCRYPT_HASH_SIMULATION]_" + tempPassword;

        User newStaff = User.builder()
                .firstName(request.getOrDefault("firstName", "Staff"))
                .lastName(request.getOrDefault("lastName", "Member"))
                .email(email)
                .passwordHash(encodedPassword)
                .role(Role.STAFF)
                .phone(request.getOrDefault("phone", ""))
                .build();

        userRepository.save(newStaff);

        // Simulate sending email
        System.out.println("======================================================");
        System.out.println("SIMULATED STAFF WELCOME EMAIL TO: " + email);
        System.out.println("SUBJECT: Your Staff Account is Ready");
        System.out.println("BODY: Your temporary password is: " + tempPassword);
        System.out.println("      Log in at: http://localhost:5173/staff/login");
        System.out.println("======================================================");

        try {
            emailService.sendStaffWelcomeEmail(email, request.getOrDefault("firstName", "Staff"), tempPassword);
        } catch (Exception e) {
            System.out.println("Could not send email: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of(
                "message", "Staff account created successfully. A welcome email has been sent.",
                "tempPassword", tempPassword));
    }

    // ============================================================
    // STAFF ENDPOINTS - Staff operations
    // ============================================================

    /**
     * Read-only user directory for Staff.
     * Returns: id, firstName, lastName, role, photoUrl (no private data).
     */
    @GetMapping("/api/staff/directory")
    public ResponseEntity<?> getUserDirectory(
            @RequestParam(value = "search", required = false, defaultValue = "") String search) {
        List<User> users = userRepository.findAll();

        return ResponseEntity.ok(
                users.stream()
                        .filter(u -> {
                            if (search.isBlank())
                                return true;
                            String lc = search.toLowerCase();
                            return (u.getFirstName() + " " + u.getLastName()).toLowerCase().contains(lc);
                        })
                        .map(u -> Map.of(
                                "id", u.getId().toString(),
                                "firstName", u.getFirstName(),
                                "lastName", u.getLastName(),
                                "role", u.getRole().toString(),
                                "photoUrl", u.getProfilePhotoPath() != null
                                        ? "http://localhost:8080" + u.getProfilePhotoPath()
                                        : ""))
                        .collect(Collectors.toList()));
    }

    // ============================================================
    // STAFF PROFILE ENDPOINTS
    // ============================================================

    @GetMapping("/api/staff/profile/{userId}")
    public ResponseEntity<?> getStaffProfile(@PathVariable UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return ResponseEntity.ok(Map.of(
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "email", user.getEmail(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "address", user.getAddress() != null ? user.getAddress() : "",
                "isProfileComplete", user.isProfileComplete(),
                "photoUrl", user.getProfilePhotoPath() != null
                        ? "http://localhost:8080" + user.getProfilePhotoPath()
                        : ""));
    }

    @PutMapping("/api/staff/profile/{userId}")
    public ResponseEntity<?> updateStaffProfile(
            @PathVariable UUID userId,
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("phone") String phone,
            @RequestParam("address") String address,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        User user = userRepository.findById(userId).orElseThrow();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhone(phone);
        user.setAddress(address);

        if (photo != null && !photo.isEmpty()) {
            String photoPath = fileStorageService.storeFile(photo, userId);
            user.setProfilePhotoPath(photoPath);
        }

        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully.",
                "isProfileComplete", user.isProfileComplete(),
                "photoUrl", user.getProfilePhotoPath() != null
                        ? "http://localhost:8080" + user.getProfilePhotoPath()
                        : ""));
    }
}
