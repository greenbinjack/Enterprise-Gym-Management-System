package com.gym.enterprise_system.dto;

import java.util.UUID;

public record ApplicationResponseDto(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String specialties,
        String cvUrl,
        String status) {
}