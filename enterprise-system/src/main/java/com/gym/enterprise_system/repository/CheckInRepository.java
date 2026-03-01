package com.gym.enterprise_system.repository;

import com.gym.enterprise_system.entity.CheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CheckInRepository extends JpaRepository<CheckIn, UUID> {
    // Finds the absolute latest check-in for the Anti-Fraud Validator
    Optional<CheckIn> findFirstByUserIdOrderByCheckInTimeDesc(UUID userId);

    // Fetch all members currently inside the facility (no checkout time)
    List<CheckIn> findByCheckOutTimeIsNull();
}