package com.gym.enterprise_system.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface SchedulingService {
        void createAdminClass(UUID roomId, UUID trainerId, String name, String startTime, String endTime,
                        int maxCapacity,
                        int weeksToRepeat);

        String bookClass(UUID userId, UUID sessionId);

        void cancelClass(UUID userId, UUID sessionId);

        void markAttendance(UUID trainerId, UUID sessionId, UUID memberId, String status);

        Map<String, Object> getAvailableResources(List<String> daysOfWeek, String timeStr, int durationMinutes,
                        int weeks);

        void createClassBundle(String name, List<String> daysOfWeek, String timeStr, int durationMinutes, int weeks,
                        UUID roomId,
                        UUID trainerId, int classSeats);

        Map<String, Object> getTrainerDashboardData(UUID trainerId);

        List<com.gym.enterprise_system.entity.Subscription> getUserSubscriptions(UUID userId);
}