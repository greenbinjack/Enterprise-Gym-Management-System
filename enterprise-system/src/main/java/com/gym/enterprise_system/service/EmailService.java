package com.gym.enterprise_system.service;

public interface EmailService {
    void sendTrainerWelcomeEmail(String toEmail, String firstName);

    void sendPasswordResetEmail(String toEmail, String token);

    void sendStaffWelcomeEmail(String toEmail, String firstName, String tempPassword);
}