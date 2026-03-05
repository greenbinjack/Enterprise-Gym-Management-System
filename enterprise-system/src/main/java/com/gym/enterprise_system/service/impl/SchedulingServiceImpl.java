package com.gym.enterprise_system.service.impl;

import com.gym.enterprise_system.entity.*;
import com.gym.enterprise_system.repository.*;
import com.gym.enterprise_system.service.SchedulingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SchedulingServiceImpl implements SchedulingService {

    private final ClassSessionRepository sessionRepo;
    private final ClassBookingRepository bookingRepo;
    private final CheckInRepository checkInRepo;
    private final RoomRepository roomRepo;
    private final UserRepository userRepo;
    private final MembershipPlanRepository planRepo;
    private final SubscriptionRepository subRepo; // Assuming you have this from Module 1
    private final NotificationRepository notifRepo;

    // 1. ADMIN: Create Classes (Handles Recurring Loop)
    @Override
    @Transactional
    public void createAdminClass(UUID roomId, UUID trainerId, String name, String startTimeStr, String endTimeStr,
            int maxCapacity, int weeksToRepeat) {
        Room room = roomRepo.findById(roomId).orElseThrow(() -> new IllegalArgumentException("Room not found"));
        User trainer = userRepo.findById(trainerId)
                .orElseThrow(() -> new IllegalArgumentException("Trainer not found"));

        LocalDateTime start = LocalDateTime.parse(startTimeStr);
        LocalDateTime end = LocalDateTime.parse(endTimeStr);
        UUID recurringId = weeksToRepeat > 1 ? UUID.randomUUID() : null;

        for (int i = 0; i < weeksToRepeat; i++) {
            ClassSession session = ClassSession.builder()
                    .name(name)
                    .room(room)
                    .trainer(trainer)
                    .startTime(start.plusWeeks(i))
                    .endTime(end.plusWeeks(i))
                    .maxCapacity(maxCapacity)
                    .recurringGroupId(recurringId)
                    .build();

            // If the Admin double-booked the room or trainer, PostgreSQL will throw an
            // exception right here!
            sessionRepo.save(session);
        }
    }

    // 2. MEMBER: Book a Class (Enforces Plan Limits)
    @Override
    @Transactional
    public String bookClass(UUID userId, UUID sessionId) {
        User user = userRepo.findById(userId).orElseThrow();
        ClassSession session = sessionRepo.findById(sessionId).orElseThrow();

        // Check if member already booked
        if (bookingRepo.findByClassSessionIdAndUserId(sessionId, userId).isPresent()) {
            throw new IllegalArgumentException("You are already booked or waitlisted for this class.");
        }

        // Check Membership Limits
        Subscription activeSub = subRepo.findByUserIdAndStatus(userId, "ACTIVE")
                .orElseThrow(() -> new IllegalArgumentException("Active subscription required."));

        // Removed class limit check since plans now have defined recurring schedules
        // instead of monthly limits.

        ClassBooking booking = ClassBooking.builder()
                .classSession(session)
                .user(user)
                .status("ENROLLED")
                .build();

        // PostgreSQL Trigger automatically changes status to 'WAITLISTED' if
        // max_capacity is reached
        ClassBooking savedBooking = bookingRepo.save(booking);
        return savedBooking.getStatus(); // Returns either "ENROLLED" or "WAITLISTED"
    }

    // 3. MEMBER: Cancel Booking (24 Hour Rule & Waitlist Auto-Promotion)
    @Override
    @Transactional
    public void cancelClass(UUID userId, UUID sessionId) {
        ClassBooking booking = bookingRepo.findByClassSessionIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        ClassSession session = booking.getClassSession();

        // 24 Hour Cancellation Rule
        if (LocalDateTime.now().isAfter(session.getStartTime().minusHours(24))) {
            throw new IllegalArgumentException("Classes must be cancelled at least 24 hours in advance.");
        }

        booking.setStatus("CANCELLED");
        bookingRepo.save(booking);

        // AUTO-PROMOTION: Check Waitlist
        List<ClassBooking> waitlist = bookingRepo.findByClassSessionIdAndStatusOrderByBookedAtAsc(sessionId,
                "WAITLISTED");
        if (!waitlist.isEmpty()) {
            ClassBooking luckyMember = waitlist.get(0);
            luckyMember.setStatus("ENROLLED");
            bookingRepo.save(luckyMember);

            // Notify them
            notifRepo.save(Notification.builder()
                    .user(luckyMember.getUser())
                    .message("Great news! A spot opened up in " + session.getName()
                            + " and you have been automatically enrolled from the waitlist.")
                    .isRead(false)
                    .build());
        }
    }

    // 4. TRAINER: Live Roster Management (Anti-Fraud & 15-Min Eviction)
    @Override
    @Transactional
    public void markAttendance(UUID trainerId, UUID sessionId, UUID memberId, String status) {
        ClassBooking booking = bookingRepo.findByClassSessionIdAndUserId(sessionId, memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member is not in this class."));

        ClassSession session = booking.getClassSession();

        // Security: Ensure the trainer actually owns this class
        if (!session.getTrainer().getId().equals(trainerId)) {
            throw new IllegalArgumentException("Unauthorized: You are not assigned to teach this class.");
        }

        if ("PRESENT".equalsIgnoreCase(status)) {
            // ANTI-FRAUD VALIDATOR: Is the member physically in the gym?
            CheckIn latestCheckIn = checkInRepo.findFirstByUserIdOrderByCheckInTimeDesc(memberId).orElse(null);

            // Must have checked in within the last 4 hours, and hasn't checked out yet.
            if (latestCheckIn == null ||
                    latestCheckIn.getCheckInTime().isBefore(LocalDateTime.now().minusHours(4)) ||
                    latestCheckIn.getCheckOutTime() != null) {

                throw new IllegalArgumentException(
                        "Fraud Alert: Cannot mark present. Member has not physically scanned into the facility.");
            }
            booking.setStatus("PRESENT");

        } else if ("ABSENT".equalsIgnoreCase(status)) {
            // 15-MINUTE EVICTION RULE
            if (LocalDateTime.now().isBefore(session.getStartTime().plusMinutes(10))) {
                throw new IllegalArgumentException(
                        "Cannot mark absent yet. You must give members a 10-minute grace period after class starts.");
            }
            booking.setStatus("ABSENT");
        }

        bookingRepo.save(booking);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAvailableResources(List<String> daysOfWeek, String timeStr, int durationMinutes,
            int weeks) {
        LocalTime time = LocalTime.parse(timeStr);

        List<Room> allRooms = roomRepo.findAll();
        List<User> allTrainers = userRepo.findAll().stream()
                .filter(u -> "TRAINER".equals(u.getRole().name()) && u.getIsActive()).toList();

        List<Map<String, Object>> commonAvailableRooms = new ArrayList<>();
        List<User> commonAvailableTrainers = new ArrayList<>(allTrainers);

        boolean firstIteration = true;

        for (String dayOfWeek : daysOfWeek) {
            DayOfWeek targetDay = DayOfWeek.valueOf(dayOfWeek.toUpperCase());

            // Find existing indefinite MembershipPlans that overlap this time and day
            List<MembershipPlan> activePlans = planRepo.findByIsActiveTrue();
            List<MembershipPlan> overlappingPlans = activePlans.stream()
                    .filter(p -> p.getRecurringDayOfWeek() != null
                            && p.getRecurringDayOfWeek().contains(targetDay.name()))
                    .filter(p -> p.getRecurringStartTime() != null && p.getDurationMinutes() != null)
                    .filter(p -> {
                        LocalTime planStart = LocalTime.parse(p.getRecurringStartTime());
                        LocalTime planEnd = planStart.plusMinutes(p.getDurationMinutes());
                        LocalTime reqEnd = time.plusMinutes(durationMinutes);
                        return planStart.isBefore(reqEnd) && time.isBefore(planEnd);
                    })
                    .toList();

            // Find the FIRST occurrence of this day of the week
            LocalDate startDate = LocalDate.now();
            if (startDate.getDayOfWeek() != targetDay || LocalTime.now().isAfter(time)) {
                startDate = startDate.with(TemporalAdjusters.next(targetDay));
            }

            List<Map<String, Object>> availableRoomsForDay = new ArrayList<>();
            List<User> availableTrainersForDay = new ArrayList<>(commonAvailableTrainers); // Filter from currently
                                                                                           // remaining

            // Filter Rooms based on capacity across ALL weeks for THIS day
            for (Room room : allRooms) {
                int maxUsedCapacityAcrossWeeks = 0;
                boolean isRoomAvailableAllWeeks = true;

                int planSeatsLocked = overlappingPlans.stream()
                        .filter(p -> room.getId().equals(p.getAllocatedRoomId()))
                        .mapToInt(p -> p.getAllocatedSeats() != null ? p.getAllocatedSeats() : 0)
                        .sum();

                for (int i = 0; i < weeks; i++) {
                    LocalDateTime start = startDate.plusWeeks(i).atTime(time);
                    LocalDateTime end = start.plusMinutes(durationMinutes);

                    int usedCapacity = sessionRepo.getUsedCapacityForRoomAtTime(room.getId(), start, end)
                            + planSeatsLocked;
                    if (usedCapacity > maxUsedCapacityAcrossWeeks) {
                        maxUsedCapacityAcrossWeeks = usedCapacity;
                    }

                    if (maxUsedCapacityAcrossWeeks >= room.getTotalCapacity()) {
                        isRoomAvailableAllWeeks = false;
                        break;
                    }
                }

                if (isRoomAvailableAllWeeks) {
                    availableRoomsForDay.add(Map.of(
                            "id", room.getId(),
                            "name", room.getName(),
                            "totalCapacity", room.getTotalCapacity(),
                            "remainingCapacity", room.getTotalCapacity() - maxUsedCapacityAcrossWeeks));
                }
            }

            final LocalDate finalStartDate = startDate;
            // Filter Trainers (Remove if they have ANY overlap in ANY of the weeks for THIS
            // day)
            availableTrainersForDay.removeIf(trainer -> {
                boolean busyWithPlan = overlappingPlans.stream()
                        .anyMatch(p -> p.getTrainers().stream().anyMatch(t -> t.getId().equals(trainer.getId())));

                if (busyWithPlan)
                    return true;

                for (int i = 0; i < weeks; i++) {
                    LocalDateTime start = finalStartDate.plusWeeks(i).atTime(time);
                    LocalDateTime end = start.plusMinutes(durationMinutes);
                    if (sessionRepo.countOverlappingTrainerClasses(trainer.getId(), start, end) > 0) {
                        return true; // Remove trainer from list
                    }
                }
                return false;
            });

            // Perform Intersection Logic
            if (firstIteration) {
                commonAvailableRooms = new ArrayList<>(availableRoomsForDay);
                commonAvailableTrainers = new ArrayList<>(availableTrainersForDay);
                firstIteration = false;
            } else {
                // Intersect Rooms (keep room if its ID exists in both, taking min remaining
                // capacity)
                List<Map<String, Object>> newCommonRooms = new ArrayList<>();
                for (Map<String, Object> commonRoom : commonAvailableRooms) {
                    UUID commonId = (UUID) commonRoom.get("id");
                    for (Map<String, Object> dayRoom : availableRoomsForDay) {
                        if (commonId.equals(dayRoom.get("id"))) {
                            int r1 = (int) commonRoom.get("remainingCapacity");
                            int r2 = (int) dayRoom.get("remainingCapacity");
                            newCommonRooms.add(Map.of(
                                    "id", commonId,
                                    "name", commonRoom.get("name"),
                                    "totalCapacity", commonRoom.get("totalCapacity"),
                                    "remainingCapacity", Math.min(r1, r2)));
                            break;
                        }
                    }
                }
                commonAvailableRooms = newCommonRooms;

                // Intersect Trainers (just reference equality check is enough)
                commonAvailableTrainers.retainAll(availableTrainersForDay);
            }
        }

        return Map.of("rooms", commonAvailableRooms, "trainers", commonAvailableTrainers);
    }

    @Transactional
    public void createClassBundle(String name, List<String> daysOfWeek, String timeStr, int durationMinutes, int weeks,
            UUID roomId, UUID trainerId, int classSeats) {
        LocalTime time = LocalTime.parse(timeStr);
        Room room = roomRepo.findById(roomId).orElseThrow();
        User trainer = userRepo.findById(trainerId).orElseThrow();
        UUID recurringGroupId = weeks > 1 || daysOfWeek.size() > 1 ? UUID.randomUUID() : null;

        for (String dayOfWeek : daysOfWeek) {
            DayOfWeek targetDay = DayOfWeek.valueOf(dayOfWeek.toUpperCase());

            LocalDate startDate = LocalDate.now();
            if (startDate.getDayOfWeek() != targetDay
                    || (startDate.getDayOfWeek() == targetDay && LocalTime.now().isAfter(time))) {
                startDate = startDate.with(TemporalAdjusters.next(targetDay));
            }

            for (int i = 0; i < weeks; i++) {
                LocalDateTime start = startDate.plusWeeks(i).atTime(time);
                LocalDateTime end = start.plusMinutes(durationMinutes);

                // STRICT BACKEND VALIDATION PER WEEK
                if (start.isBefore(LocalDateTime.now()))
                    throw new IllegalArgumentException("Cannot schedule classes in the past.");

                if (sessionRepo.countOverlappingTrainerClasses(trainerId, start, end) > 0) {
                    throw new IllegalArgumentException("Trainer conflict detected on " + start.toLocalDate());
                }

                int currentUsed = sessionRepo.getUsedCapacityForRoomAtTime(roomId, start, end);
                if (currentUsed + classSeats > room.getTotalCapacity()) {
                    throw new IllegalArgumentException("Capacity exceeded on " + start.toLocalDate() + ". Only "
                            + (room.getTotalCapacity() - currentUsed) + " seats remain.");
                }

                ClassSession session = ClassSession.builder()
                        .name(name)
                        .room(room)
                        .trainer(trainer)
                        .startTime(start)
                        .endTime(end)
                        .maxCapacity(classSeats)
                        .recurringGroupId(recurringGroupId)
                        .build();

                // Saves independently so they can be edited individually later!
                sessionRepo.save(session);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getTrainerDashboardData(UUID trainerId) {
        // 1. Fetch individual class sessions assigned to this trainer
        List<ClassSession> individualSessions = sessionRepo.findAll().stream()
                .filter(c -> c.getTrainer() != null && c.getTrainer().getId().equals(trainerId))
                .toList();

        // 2. Fetch all active membership plans that include this trainer
        List<MembershipPlan> recurringPlans = planRepo.findByIsActiveTrue().stream()
                .filter(p -> p.getTrainers().stream().anyMatch(t -> t.getId().equals(trainerId)))
                .toList();

        return Map.of(
                "sessions", individualSessions,
                "recurringPlans", recurringPlans);
    }

    @Override
    public List<com.gym.enterprise_system.entity.Subscription> getUserSubscriptions(UUID userId) {
        return subRepo.findAllByUserId(userId);
    }
}