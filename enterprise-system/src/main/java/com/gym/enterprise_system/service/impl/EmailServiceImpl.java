package com.gym.enterprise_system.service.impl;

import com.gym.enterprise_system.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    @Override
    public void sendTrainerWelcomeEmail(String toEmail, String firstName) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Welcome to Enterprise Gym! Action Required: Set up your account");

        String emailBody = "Hello " + firstName + ",\n\n" +
                "Congratulations! Your application to join the Enterprise Gym team has been approved.\n\n" +
                "To get started and view your schedule, please activate your account and set your secure password by clicking the link below:\n\n"
                +
                "http://localhost:5173/trainer/activate\n\n" + // CHANGED THIS LINE
                "We are excited to have you on board!\n\n" +
                "Best regards,\n" +
                "System Administrator\n" +
                "Enterprise Gym";

        message.setText(emailBody);

        mailSender.send(message);
    }

    @Async
    @Override
    public void sendPasswordResetEmail(String toEmail, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Password Reset Request - Enterprise Gym");

        String resetUrl = "http://localhost:5173/reset-password?token=" + token;

        String emailBody = "You recently requested to reset your password for your Enterprise Gym account.\n\n" +
                "Click the link below to reset it. This link is only valid for 15 minutes.\n\n" +
                resetUrl + "\n\n" +
                "If you did not request a password reset, please ignore this email or reply to let us know.\n\n" +
                "Best regards,\n" +
                "Enterprise Gym Support";

        message.setText(emailBody);
        mailSender.send(message);
    }

    @Async
    @Override
    public void sendStaffWelcomeEmail(String toEmail, String firstName, String tempPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Welcome! Your Staff Account at Enterprise Gym");

        String emailBody = "Hello " + firstName + ",\n\n" +
                "A staff account has been created for you at Enterprise Gym.\n\n" +
                "Your temporary password is: " + tempPassword + "\n\n" +
                "Please log in and update your details at:\n" +
                "http://localhost:5173/staff/login\n\n" +
                "Best regards,\n" +
                "Enterprise Gym Administration";

        message.setText(emailBody);
        mailSender.send(message);
    }
}