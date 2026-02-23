package com.gym.enterprise_system.service.impl;

import com.gym.enterprise_system.dto.*;
import com.gym.enterprise_system.entity.*;
import com.gym.enterprise_system.repository.*;
import com.gym.enterprise_system.service.SubscriptionService; // ADD IMPORT
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService { // ADD IMPLEMENTS

    @Value("${sslcommerz.store-id}")
    private String storeId;
    @Value("${sslcommerz.store-password}")
    private String storePassword;
    @Value("${sslcommerz.base-url}")
    private String baseUrl;
    @Value("${sslcommerz.success-url}")
    private String successUrl;
    @Value("${sslcommerz.fail-url}")
    private String failUrl;
    @Value("${sslcommerz.cancel-url}")
    private String cancelUrl;

    // We need RestTemplate to call external APIs
    private final org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

    private final MembershipPlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final InvoicePaymentRepository invoiceRepository;
    private final UserRepository userRepository;

    @Override
    public SubscriptionStatusResponseDto checkUserSubscriptionStatus(UUID userId) {
        Subscription sub = subscriptionRepository.findByUserId(userId).orElse(null);

        if (sub == null || sub.getPlan() == null || sub.getEndDate() == null) {
            return new SubscriptionStatusResponseDto("NONE", null, null);
        }

        LocalDateTime now = LocalDateTime.now();
        String currentStatus;
        if (now.isBefore(sub.getEndDate())) {
            currentStatus = "ACTIVE";
        } else if (now.isBefore(sub.getEndDate().plusDays(5))) {
            currentStatus = "GRACE_PERIOD";
        } else {
            currentStatus = "NONE";
        }

        // Return the full object including the Plan Name!
        return new SubscriptionStatusResponseDto(currentStatus, sub.getPlan().getName(), sub.getEndDate());
    }

    @Override
    public List<PlanResponseDto> getAvailablePlansForUser(UUID userId) {
        Subscription currentSub = subscriptionRepository.findByUserId(userId).orElse(null);
        SubscriptionStatusResponseDto statusResponse = checkUserSubscriptionStatus(userId); // Get the new DTO

        int currentTier = (currentSub != null && currentSub.getPlan() != null
                && "ACTIVE".equals(statusResponse.status())) // Extract the status string from DTO
                        ? currentSub.getPlan().getTierLevel()
                        : 0;

        return planRepository.findByIsActiveTrue().stream()
                .filter(plan -> plan.getTierLevel() >= currentTier)
                .map(p -> new PlanResponseDto(p.getId(), p.getName(), p.getTierLevel(), p.getMonthlyPrice(),
                        p.getYearlyPrice(), p.getClassLimitPerMonth(), p.getPtSessionsPerMonth()))
                .collect(Collectors.toList());
    }

    // 1. INITIATE PAYMENT (Called by React)
    @Override
    @Transactional
    public String initiateSslCommerzPayment(PaymentRequestDto request) {
        MembershipPlan plan = planRepository.findById(request.planId()).orElseThrow();
        User user = userRepository.findById(request.userId()).orElseThrow();
        BigDecimal amount = request.billingCycle().equals("YEARLY") ? plan.getYearlyPrice() : plan.getMonthlyPrice();

        // Generate a unique transaction ID
        String tranId = "GYM_" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();

        // Save a PENDING invoice
        InvoicePayment invoice = InvoicePayment.builder()
                .user(user)
                .plan(plan)
                .amount(amount)
                .billingCycle(request.billingCycle())
                .paymentMethod("SSLCOMMERZ")
                .paymentStatus("PENDING")
                .transactionId(tranId)
                .build();
        invoiceRepository.save(invoice);

        // Prepare SSLCommerz API parameters
        org.springframework.util.MultiValueMap<String, String> body = new org.springframework.util.LinkedMultiValueMap<>();
        body.add("store_id", storeId);
        body.add("store_passwd", storePassword);
        body.add("total_amount", amount.toString());
        body.add("currency", "BDT");
        body.add("tran_id", tranId);
        body.add("success_url", successUrl);
        body.add("fail_url", failUrl);
        body.add("cancel_url", cancelUrl);
        body.add("cus_name", user.getFirstName() + " " + user.getLastName());
        body.add("cus_email", user.getEmail());
        body.add("cus_phone", "01700000000"); // Add phone to user entity later
        body.add("cus_add1", "Dhaka");
        body.add("cus_city", "Dhaka");
        body.add("cus_country", "Bangladesh");
        body.add("shipping_method", "NO");
        body.add("product_name", plan.getName() + " Subscription");
        body.add("product_category", "Gym Membership");
        body.add("product_profile", "non-physical-goods");

        // Send request to SSLCommerz
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);
        org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, String>> requestEntity = new org.springframework.http.HttpEntity<>(
                body, headers);

        java.util.Map<String, Object> response = restTemplate.postForObject(baseUrl + "/gwprocess/v4/api.php",
                requestEntity, java.util.Map.class);

        if (response != null && "SUCCESS".equals(response.get("status"))) {
            return (String) response.get("GatewayPageURL"); // Return the URL to redirect the user to
        } else {
            throw new RuntimeException("Failed to initiate SSLCommerz payment");
        }
    }

    // 2. VALIDATE PAYMENT (Called by SSLCommerz Callback)
    @Override
    @Transactional
    public void handlePaymentCallback(String tranId, String status) {
        InvoicePayment invoice = invoiceRepository.findByTransactionId(tranId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        if ("VALID".equals(status) || "VALIDATED".equals(status)) {
            // Update to SUCCESS. The PostgreSQL trigger will now fire and activate the
            // subscription!
            invoice.setPaymentStatus("SUCCESS");
        } else {
            invoice.setPaymentStatus("FAILED");
        }
        invoiceRepository.save(invoice);
    }
}