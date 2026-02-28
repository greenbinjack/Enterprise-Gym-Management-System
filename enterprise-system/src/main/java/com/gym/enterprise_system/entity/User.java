package com.gym.enterprise_system.entity;

import jakarta.persistence.*;
import lombok.*;

import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder // Helps create objects easily
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; // We will create this Enum next

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    // Add these under your existing fields:
    @Column(name = "phone")
    private String phone;

    @Column(name = "address")
    private String address;

    @Column(name = "profile_photo_path")
    private String profilePhotoPath;

    // THE GATEKEEPER CHECK: Returns true only if ALL required fields are filled
    public boolean isProfileComplete() {
        return phone != null && !phone.trim().isEmpty() &&
                address != null && !address.trim().isEmpty() &&
                profilePhotoPath != null && !profilePhotoPath.trim().isEmpty();
    }
}