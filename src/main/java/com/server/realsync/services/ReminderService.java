package com.server.realsync.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.server.realsync.entity.Reminder;
import com.server.realsync.repo.ReminderRepository;
import com.server.realsync.entity.ScheduleEntry;
import com.server.realsync.entity.ScheduleEntryStatus;
import com.server.realsync.repo.ScheduleEntryRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class ReminderService {

    @Autowired
    private ReminderRepository repo;
    @Autowired
    private ScheduleService scheduleService;

    @Autowired
    private ScheduleEntryRepository scheduleEntryRepository;

    /** All reminders for an account, newest first */
    public List<Reminder> getByAccountId(Integer accountId) {
        return repo.findByAccountIdOrderByCreatedAtDesc(accountId);
    }

    public List<Reminder> getByCustomerId(Integer customerId, Integer accountId) {
        return repo.findByCustomerIdAndAccountId(customerId, accountId);
    }

    /** Single reminder scoped to account */
    public Optional<Reminder> getById(Integer id, Integer accountId) {
        return repo.findByIdAndAccountId(id, accountId);
    }

    /** Create or update */
    @Transactional
    public Reminder save(Reminder reminder) {

        if (reminder.getStatus() == null) {
            reminder.setStatus("Scheduled");
        }

        Reminder saved = repo.save(reminder);
        Long reminderId = saved.getId().longValue();
        scheduleEntryRepository.deleteByReminderIdAndStatusNot(
                reminderId,
                ScheduleEntryStatus.COMPLETED);

        // 🔥 CREATE NEW SCHEDULES
        createSchedules(saved);

        return saved;
    }

    private void createSchedules(Reminder r) {

        LocalTime time = r.getReminderTime() != null
                ? r.getReminderTime()
                : LocalTime.of(9, 0);

        LocalDateTime base = LocalDateTime.of(
                r.getReminderDate(),
                time);

        // 🟢 One-time
        if (!"recurring".equalsIgnoreCase(r.getReminderType())) {
            createSchedule(r, base);
            return;
        }

        int count = r.getTotalOccurrences() != null ? r.getTotalOccurrences() : 1;
        String freq = r.getFrequency() != null ? r.getFrequency() : "none";

        for (int i = 0; i < count; i++) {

            LocalDateTime next = switch (freq) {
                case "daily" -> base.plusDays(i);
                case "weekly" -> base.plusWeeks(i);
                case "monthly" -> base.plusMonths(i);
                case "yearly" -> base.plusYears(i);
                default -> base;
            };

            createSchedule(r, next);
        }
    }

    private void createSchedule(Reminder r, LocalDateTime time) {

        ScheduleEntry e = new ScheduleEntry();

        e.setReminderId(r.getId().longValue());
        e.setOccurrenceDate(time);
        e.setStatus(ScheduleEntryStatus.PENDING);
        e.setAmount(r.getAmount() != null ? BigDecimal.valueOf(r.getAmount()) : null);
        e.setRemarks(r.getMessage());
        

        scheduleEntryRepository.save(e);
    }

    /** Hard delete */

    @Transactional
    public void delete(Integer id, Integer accountId) {

        Optional<Reminder> opt = getById(id, accountId);

        if (opt.isEmpty()) {
            throw new RuntimeException("Reminder not found");
        }

        Long reminderId = opt.get().getId().longValue();

        // 🔥 STEP 1: delete execution rows
        scheduleEntryRepository.deleteByReminderIdAndStatusNot(
                reminderId,
                ScheduleEntryStatus.COMPLETED);

        // 🔥 STEP 2: delete reminder
        repo.deleteByIdAndAccountId(id, accountId);
    }

    /** Count reminders currently scheduled */
    public long countScheduledByAccountId(Integer accountId) {
        return repo.countByAccountIdAndStatus(accountId, "Scheduled");
    }

    /** Count total reminders sent today (Native Query) */
    public long countSentToday(Integer accountId) {
        return repo.countSentToday(accountId);
    }

    public void reschedule(Integer id, Integer accountId, String date, String time) {

        Reminder reminder = getById(id, accountId)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));

        reminder.setReminderDate(LocalDate.parse(date));
        reminder.setReminderTime(LocalTime.parse(time));

        save(reminder);
    }

    public void makeRecurring(Integer id, Integer accountId) {

        Reminder reminder = getById(id, accountId)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));

        reminder.setRecurring(true);

        save(reminder);
    }

}