package com.gym.enterprise_system.controller;

import com.gym.enterprise_system.entity.User;
import com.gym.enterprise_system.repository.UserRepository;
import com.gym.enterprise_system.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/member/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MemberProfileController {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    // GET the profile data to populate the React form
    @GetMapping("/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();

        return ResponseEntity.ok(Map.of(
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "email", user.getEmail(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "address", user.getAddress() != null ? user.getAddress() : "",
                "isProfileComplete", user.isProfileComplete(),
                // Prepend the server URL so React can display the image
                "photoUrl",
                user.getProfilePhotoPath() != null ? "http://localhost:8080" + user.getProfilePhotoPath() : ""));
    }

    // PUT request handling MULTIPART form data (Text + File)
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateProfile(
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

        // Only process the file if a new one was actually uploaded
        if (photo != null && !photo.isEmpty()) {
            String photoPath = fileStorageService.storeFile(photo, userId);
            user.setProfilePhotoPath(photoPath);
        }

        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully.",
                "isProfileComplete", user.isProfileComplete(),
                "photoUrl",
                user.getProfilePhotoPath() != null ? "http://localhost:8080" + user.getProfilePhotoPath() : ""));
    }
}