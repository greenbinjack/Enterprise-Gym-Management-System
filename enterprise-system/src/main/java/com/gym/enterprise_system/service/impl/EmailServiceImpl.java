package com.gym.enterprise_system.service.impl;

import com.gym.enterprise_system.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

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
}