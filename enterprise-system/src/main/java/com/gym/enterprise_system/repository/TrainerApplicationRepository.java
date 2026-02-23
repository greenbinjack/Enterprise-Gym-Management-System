package com.gym.enterprise_system.repository;

import com.gym.enterprise_system.entity.TrainerApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TrainerApplicationRepository extends JpaRepository<TrainerApplication, UUID> {
    List<TrainerApplication> findByStatus(String status);

    boolean existsByEmail(String email);
}