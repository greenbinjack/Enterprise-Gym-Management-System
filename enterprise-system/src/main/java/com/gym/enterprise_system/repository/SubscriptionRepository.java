package com.gym.enterprise_system.repository;

import com.gym.enterprise_system.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    Optional<Subscription> findByUserIdAndStatus(UUID userId, String status);

    Optional<Subscription> findByUserId(UUID userId);

    List<Subscription> findAllByUserId(UUID userId);
}