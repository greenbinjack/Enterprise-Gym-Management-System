package com.gym.enterprise_system.controller;

import com.gym.enterprise_system.dto.PaymentRequestDto;
import com.gym.enterprise_system.dto.SubscriptionStatusResponseDto;
import com.gym.enterprise_system.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping("/initiate-payment")
    public ResponseEntity<?> initiatePayment(@RequestBody PaymentRequestDto request) {
        try {
            String gatewayUrl = subscriptionService.initiateSslCommerzPayment(request);
            return ResponseEntity.ok(Map.of("gatewayUrl", gatewayUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/payment/success")
    public RedirectView paymentSuccess(@RequestParam Map<String, String> requestParams) {
        String tranId = requestParams.get("tran_id");
        String status = requestParams.get("status");

        subscriptionService.handlePaymentCallback(tranId, status);
        return new RedirectView("http://localhost:5173/member/dashboard?payment=success");
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/payment/fail")
    public RedirectView paymentFail(@RequestParam Map<String, String> requestParams) {
        String tranId = requestParams.get("tran_id");
        subscriptionService.handlePaymentCallback(tranId, "FAILED");
        return new RedirectView("http://localhost:5173/member/dashboard?payment=failed");
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/payment/cancel")
    public RedirectView paymentCancel(@RequestParam Map<String, String> requestParams) {
        String tranId = requestParams.get("tran_id");
        subscriptionService.handlePaymentCallback(tranId, "CANCELLED");
        return new RedirectView("http://localhost:5173/member/dashboard?payment=cancelled");
    }

    // Update the getStatus method to return the new List
    @GetMapping("/status/{userId}")
    public ResponseEntity<List<SubscriptionStatusResponseDto>> getStatus(@PathVariable UUID userId) {
        return ResponseEntity.ok(subscriptionService.getUserSubscriptions(userId));
    }

    @GetMapping("/plans/{userId}")
    public ResponseEntity<?> getAvailablePlans(@PathVariable UUID userId) {
        return ResponseEntity.ok(subscriptionService.getAvailablePlansForUser(userId));
    }

}