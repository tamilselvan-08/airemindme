package com.server.realsync.services;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.server.realsync.entity.Reminder;
import com.server.realsync.repo.ReminderRepository;

import jakarta.transaction.Transactional;

@Service
public class ReminderService {

    @Autowired
    private ReminderRepository repo;

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
    public Reminder save(Reminder reminder) {
        if (reminder.getStatus() == null) {
            reminder.setStatus("Scheduled");
        }
        return repo.save(reminder);
    }

    /** Hard delete */
    @Transactional
    public void delete(Integer id, Integer accountId) {
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