package com.gym.enterprise_system.dto;

import java.time.LocalDateTime;

public record SubscriptionStatusResponseDto(String status, String planName, LocalDateTime endDate) {
}