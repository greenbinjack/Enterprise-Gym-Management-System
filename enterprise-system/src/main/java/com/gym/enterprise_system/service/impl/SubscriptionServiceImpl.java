package com.gym.enterprise_system.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gym.enterprise_system.dto.PaymentRequestDto;
import com.gym.enterprise_system.dto.PlanResponseDto;
import com.gym.enterprise_system.dto.SubscriptionStatusResponseDto;
import com.gym.enterprise_system.entity.InvoicePayment;
import com.gym.enterprise_system.entity.MembershipPlan;
import com.gym.enterprise_system.entity.Subscription;
import com.gym.enterprise_system.entity.User;
import com.gym.enterprise_system.repository.InvoicePaymentRepository;
import com.gym.enterprise_system.repository.MembershipPlanRepository;
import com.gym.enterprise_system.repository.SubscriptionRepository;
import com.gym.enterprise_system.repository.UserRepository;
import com.gym.enterprise_system.service.SubscriptionService; // ADD IMPORT

import lombok.RequiredArgsConstructor;

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
            return new SubscriptionStatusResponseDto(null, null, null, "NONE", null);
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
        return new SubscriptionStatusResponseDto(sub.getPlan().getId(), sub.getPlan().getName(),
                sub.getPlan().getCategory(), currentStatus, sub.getEndDate());
    }

    @Override
    public List<PlanResponseDto> getAvailablePlansForUser(UUID userId) {
        return planRepository.findByIsActiveTrue().stream()
                .map(p -> {
                    BigDecimal yearlyPrice = p.getMonthlyPrice().multiply(new BigDecimal(12));
                    if (p.getDiscountLevel() != null && p.getDiscountLevel() > 0) {
                        BigDecimal multiplier = new BigDecimal(100 - p.getDiscountLevel()).divide(new BigDecimal(100));
                        yearlyPrice = yearlyPrice.multiply(multiplier);
                    }
                    return new PlanResponseDto(p.getId(), p.getName(), 1, p.getMonthlyPrice(),
                            yearlyPrice, -1, 0, p.getCategory());
                })
                .collect(Collectors.toList());
    }

    // 1. INITIATE PAYMENT (Called by React)
    @Override
    @Transactional
    public String initiateSslCommerzPayment(PaymentRequestDto request) {
        // THE FIX: Add "sub.getPlan() != null" before checking the ID!
        boolean alreadyHasActivePlan = subscriptionRepository.findAllByUserId(request.userId()).stream()
                .anyMatch(sub -> sub.getPlan() != null &&
                        sub.getPlan().getId().equals(request.planId()) &&
                        sub.getEndDate() != null &&
                        LocalDateTime.now().isBefore(sub.getEndDate()));

        if (alreadyHasActivePlan) {
            throw new IllegalArgumentException("You already have an active subscription for this plan.");
        }

        MembershipPlan plan = planRepository.findById(request.planId()).orElseThrow();
        User user = userRepository.findById(request.userId()).orElseThrow();

        BigDecimal yearlyPriceTarget = plan.getMonthlyPrice().multiply(new BigDecimal(12));
        if (plan.getDiscountLevel() != null && plan.getDiscountLevel() > 0) {
            BigDecimal multiplier = new BigDecimal(100 - plan.getDiscountLevel()).divide(new BigDecimal(100));
            yearlyPriceTarget = yearlyPriceTarget.multiply(multiplier);
        }

        BigDecimal amount = request.billingCycle().equals("YEARLY") ? yearlyPriceTarget : plan.getMonthlyPrice();

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

        Map<String, Object> response = restTemplate.postForObject(baseUrl + "/gwprocess/v4/api.php", requestEntity,
                Map.class);

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

    public List<SubscriptionStatusResponseDto> getUserSubscriptions(UUID userId) {
        return subscriptionRepository.findAllByUserId(userId).stream()
                .filter(sub -> sub.getPlan() != null) // THE FIX: Ignore empty dummy rows
                .map(sub -> {
                    String currentStatus = "NONE";
                    if (sub.getEndDate() != null) {
                        if (LocalDateTime.now().isBefore(sub.getEndDate())) {
                            currentStatus = "ACTIVE";
                        } else if (LocalDateTime.now().isBefore(sub.getEndDate().plusDays(5))) {
                            currentStatus = "GRACE_PERIOD";
                        }
                    }
                    return new SubscriptionStatusResponseDto(
                            sub.getPlan().getId(),
                            sub.getPlan().getName(),
                            sub.getPlan().getCategory(),
                            currentStatus,
                            sub.getEndDate());
                })
                .collect(Collectors.toList());
    }
}