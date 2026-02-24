package com.gym.enterprise_system.service.impl;

import com.gym.enterprise_system.dto.ApplicationRequestDto;
import com.gym.enterprise_system.dto.ApplicationResponseDto;
import com.gym.enterprise_system.entity.Role;
import com.gym.enterprise_system.entity.TrainerApplication;
import com.gym.enterprise_system.entity.User;
import com.gym.enterprise_system.repository.NotificationRepository;
import com.gym.enterprise_system.repository.TrainerApplicationRepository;
import com.gym.enterprise_system.repository.UserRepository;
import com.gym.enterprise_system.service.EmailService;
import com.gym.enterprise_system.service.TrainerRecruitmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainerRecruitmentServiceImpl implements TrainerRecruitmentService {

        private final TrainerApplicationRepository applicationRepository;
        private final UserRepository userRepository;
        private final NotificationRepository notificationRepository;

        private final EmailService emailService;

        @Override
        public void submitApplication(ApplicationRequestDto request) {
                if (applicationRepository.existsByEmail(request.email())
                                || userRepository.existsByEmail(request.email())) {
                        throw new IllegalArgumentException("An application or user with this email already exists.");
                }

                TrainerApplication application = TrainerApplication.builder()
                                .firstName(request.firstName())
                                .lastName(request.lastName())
                                .email(request.email())
                                .phone(request.phone())
                                .specialties(request.specialties())
                                .cvUrl(request.cvUrl())
                                .status("PENDING")
                                .build();

                applicationRepository.save(application);
        }

        @Override
        public List<ApplicationResponseDto> getApplicationsByStatus(String status) {
                return applicationRepository.findByStatus(status).stream()
                                .map(app -> new ApplicationResponseDto(app.getId(), app.getFirstName(),
                                                app.getLastName(),
                                                app.getEmail(), app.getPhone(), app.getSpecialties(), app.getCvUrl(),
                                                app.getStatus()))
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional
        public void approveApplicant(UUID applicationId) {
                TrainerApplication app = applicationRepository.findById(applicationId)
                                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

                if (!"PENDING".equals(app.getStatus())) {
                        throw new IllegalStateException("Only pending applications can be approved.");
                }

                // 1. Migrate to Users Table
                User newTrainer = User.builder()
                                .firstName(app.getFirstName())
                                .lastName(app.getLastName())
                                .email(app.getEmail())
                                .passwordHash("[TEMP_HASH]_" + UUID.randomUUID().toString())
                                .role(Role.TRAINER)
                                .build();
                userRepository.save(newTrainer);

                // 2. Generate System Notification! (NEW CODE)
                com.gym.enterprise_system.entity.Notification welcomeNotif = com.gym.enterprise_system.entity.Notification
                                .builder()
                                .user(newTrainer)
                                .message(
                                                "Welcome to Enterprise Gym! Your trainer account has been approved. Please set up your profile.")
                                .isRead(false)
                                .build();
                notificationRepository.save(welcomeNotif);

                // 3. Update Application Status
                app.setStatus("APPROVED");
                applicationRepository.save(app);

                emailService.sendTrainerWelcomeEmail(app.getEmail(), app.getFirstName());

                // 3. Simulate Email Sending
                System.out.println("======================================================");
                System.out.println("SIMULATED EMAIL SENT TO: " + app.getEmail());
                System.out.println("SUBJECT: Welcome to the Team! Set your password.");
                System.out.println("BODY: Click here to set up your trainer account password...");
                System.out.println("======================================================");
        }

        @Override
        @Transactional
        public void rejectApplicant(UUID applicationId) {
                TrainerApplication app = applicationRepository.findById(applicationId)
                                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

                app.setStatus("REJECTED");
                applicationRepository.save(app);
        }

        @Override
        public java.util.Map<String, Object> getRecruitmentBoardData() {
                // 1. Get Applications
                List<ApplicationResponseDto> pending = getApplicationsByStatus("PENDING");
                List<ApplicationResponseDto> rejected = getApplicationsByStatus("REJECTED");

                // 2. Get Users (Hired & Fired Trainers)
                List<User> allTrainers = userRepository.findAll().stream()
                                .filter(u -> Role.TRAINER.equals(u.getRole()))
                                .collect(Collectors.toList());

                List<User> hiredTrainers = allTrainers.stream()
                                .filter(u -> u.getIsActive() != null && u.getIsActive())
                                .collect(Collectors.toList());

                List<User> firedTrainers = allTrainers.stream()
                                .filter(u -> u.getIsActive() != null && !u.getIsActive())
                                .collect(Collectors.toList());

                return java.util.Map.of(
                                "needsReview", pending,
                                "rejected", rejected,
                                "hired", hiredTrainers,
                                "fired", firedTrainers);
        }

        @Override
        @Transactional
        public void moveApplicantToPending(UUID applicationId) {
                TrainerApplication app = applicationRepository.findById(applicationId)
                                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

                app.setStatus("PENDING");
                applicationRepository.save(app);
        }
}