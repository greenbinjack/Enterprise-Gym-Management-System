package com.gym.enterprise_system.dto;

import java.time.LocalDateTime;
import java.util.UUID;

// Changed to a Record that holds specific plan details
public record SubscriptionStatusResponseDto(
        UUID planId,
        String planName,
        String category,
        String status,
        LocalDateTime endDate) {
}