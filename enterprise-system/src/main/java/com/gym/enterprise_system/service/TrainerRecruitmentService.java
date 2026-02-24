package com.gym.enterprise_system.service;

import com.gym.enterprise_system.dto.ApplicationRequestDto;
import com.gym.enterprise_system.dto.ApplicationResponseDto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface TrainerRecruitmentService {
    void submitApplication(ApplicationRequestDto request);

    List<ApplicationResponseDto> getApplicationsByStatus(String status);

    void approveApplicant(UUID applicationId);

    void rejectApplicant(UUID applicationId);

    Map<String, Object> getRecruitmentBoardData();

    void moveApplicantToPending(UUID applicationId);
}