package com.gym.enterprise_system.dto;

import java.util.UUID;

public record PaymentRequestDto(UUID userId, UUID planId, String billingCycle, String creditCardToken) {
}