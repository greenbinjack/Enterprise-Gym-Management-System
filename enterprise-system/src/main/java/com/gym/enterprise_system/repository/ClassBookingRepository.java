package com.gym.enterprise_system.repository;

import com.gym.enterprise_system.entity.ClassBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClassBookingRepository extends JpaRepository<ClassBooking, UUID> {
    Optional<ClassBooking> findByClassSessionIdAndUserId(UUID sessionId, UUID userId);

    // Finds the oldest waitlisted person to promote them
    List<ClassBooking> findByClassSessionIdAndStatusOrderByBookedAtAsc(UUID sessionId, String status);

    // Counts how many classes a user booked this month to enforce Membership Limits
    @Query("SELECT COUNT(b) FROM ClassBooking b WHERE b.user.id = :userId AND b.status IN ('ENROLLED', 'PRESENT') AND MONTH(b.classSession.startTime) = :month AND YEAR(b.classSession.startTime) = :year")
    int countEnrolledClassesForMonth(UUID userId, int month, int year);
}