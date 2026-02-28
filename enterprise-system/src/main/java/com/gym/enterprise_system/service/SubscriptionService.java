package com.gym.enterprise_system.service;

import com.gym.enterprise_system.dto.PaymentRequestDto;
import com.gym.enterprise_system.dto.PlanResponseDto;
import com.gym.enterprise_system.dto.SubscriptionStatusResponseDto;

import java.util.List;
import java.util.UUID;

public interface SubscriptionService {

    SubscriptionStatusResponseDto checkUserSubscriptionStatus(UUID userId);

    List<PlanResponseDto> getAvailablePlansForUser(UUID userId);

    // REMOVED old processPayment method
    // ADDED the two new SSLCommerz methods:
    String initiateSslCommerzPayment(PaymentRequestDto request);

    void handlePaymentCallback(String tranId, String status);

    List<SubscriptionStatusResponseDto> getUserSubscriptions(UUID userId);
}