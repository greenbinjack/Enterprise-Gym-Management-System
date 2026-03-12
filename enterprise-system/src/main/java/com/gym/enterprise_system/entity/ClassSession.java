package com.gym.enterprise_system.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "class_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "trainer_id", nullable = false)
    private User trainer;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "max_capacity", nullable = false)
    private Integer maxCapacity;

    @Column(name = "recurring_group_id")
    private UUID recurringGroupId;

    @org.hibernate.annotations.Formula("(SELECT COUNT(cb.id) FROM class_bookings cb WHERE cb.class_session_id = id AND cb.status IN ('ENROLLED', 'PRESENT', 'ABSENT'))")
    private Integer bookedCount;

    @org.hibernate.annotations.Formula("(SELECT COUNT(cb.id) FROM class_bookings cb WHERE cb.class_session_id = id AND cb.status = 'PRESENT')")
    private Integer attendedCount;
}