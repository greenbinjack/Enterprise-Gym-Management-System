package com.gym.enterprise_system.repository;

import com.gym.enterprise_system.entity.User; // Dummy entity for JPA structure
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AnalyticsRepository extends JpaRepository<User, UUID> {

    // Executes the PL/pgSQL function and returns raw JSON!
    @Query(value = "SELECT get_dashboard_metrics()", nativeQuery = true)
    String getDashboardMetricsJson();
}