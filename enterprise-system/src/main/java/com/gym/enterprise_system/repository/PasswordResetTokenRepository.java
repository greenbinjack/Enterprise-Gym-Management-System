package com.gym.enterprise_system.repository;

import com.gym.enterprise_system.entity.PasswordResetToken;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByToken(String token);

    @Transactional
    void deleteByUser_Id(UUID userId); // Cleans up old tokens for a user
}