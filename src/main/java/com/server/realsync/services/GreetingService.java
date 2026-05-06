package com.server.realsync.services;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.server.realsync.entity.Greeting;
import com.server.realsync.entity.Schedule;
import com.server.realsync.entity.ScheduleEntry;
import com.server.realsync.entity.ScheduleEntryStatus;
import com.server.realsync.entity.Customer;
import com.server.realsync.repo.GreetingRepository;
import com.server.realsync.repo.ScheduleEntryRepository;
import com.server.realsync.repo.ScheduleRepository;
import com.server.realsync.repo.CustomerRepository;

@Service
public class GreetingService {

    @Autowired
    private GreetingRepository repo;
    @Autowired
    private CustomerRepository customerRepo;
    @Autowired
    private ScheduleEntryRepository scheduleEntryRepository;

    /** All greetings for an account, newest first */
    public List<Greeting> getByAccountId(Integer accountId) {
        return repo.findByAccountIdOrderByCreatedAtDesc(accountId);
    }

    public List<Greeting> getByCustomerId(Integer customerId, Integer accountId) {
        return repo.findByCustomerIdAndAccountId(customerId, accountId);
    }

    /** Single greeting scoped to account */
    public Optional<Greeting> getById(Integer id, Integer accountId) {
        return repo.findByIdAndAccountId(id, accountId);
    }

    /** Create or update */
    public Greeting save(Greeting greeting) {

        if (greeting.getStatus() == null) {
            greeting.setStatus("Scheduled");
        }

        Greeting saved = repo.save(greeting);

        // ❗ remove old schedules (important for edit)
        scheduleEntryRepository.deleteBySourceIdAndSourceTypeAndStatusNot(
                saved.getId().longValue(),
                "GREETING",
                ScheduleEntryStatus.COMPLETED);

        // create execution entries
        createGreetingSchedules(saved);

        return saved;
    }

    /** CREATE SCHEDULE ENTRIES */
    private void createGreetingSchedules(Greeting g) {

        System.out.println("🔥 createGreetingSchedules called");
        System.out.println("🔥 Greeting ID: " + g.getId());
        System.out.println("👤 Customer ID: " + g.getCustomerId());
        System.out.println("👥 Group ID: " + g.getCustomerGroupId());

        LocalTime time = g.getGreetingTime() != null
                ? g.getGreetingTime()
                : LocalTime.of(9, 0);

        LocalDateTime dateTime = LocalDateTime.of(
                g.getGreetingDate(),
                time);

        System.out.println("📅 DateTime: " + dateTime);

        // Single customer
        // Group customers
        if (g.getCustomerGroupId() != null) {

            System.out.println("👥 Group ID: " + g.getCustomerGroupId());

            Page<Customer> customerPage = customerRepo.findByAccountIdAndCustomerGroupId(
                    g.getAccountId(),
                    g.getCustomerGroupId(),
                    Pageable.unpaged());

            System.out.println("🔥 Query executed");

            List<Customer> customers = customerPage.getContent();

            System.out.println("✅ Customers found: " + customers.size());

            for (Customer c : customers) {

                System.out.println("➡️ Creating entry for customer: " + c.getId());

                createEntry(g, c.getId(), dateTime);
            }
        }
        // Group customers
        if (g.getCustomerId() != null) {

            System.out.println("👤 Single customer: " + g.getCustomerId());

            try {

                createEntry(g, g.getCustomerId(), dateTime);

                System.out.println("✅ Single customer schedule created");

            } catch (Exception ex) {

                System.out.println("❌ ERROR INSIDE createEntry");
                ex.printStackTrace();
            }

            return;
        }
    }

    private void createEntry(Greeting g, Integer customerId, LocalDateTime time) {

        try {

            System.out.println("🚀 createEntry called");

            System.out.println("Customer ID = " + customerId);
            System.out.println("Greeting ID = " + g.getId());
            System.out.println("Time = " + time);

            ScheduleEntry e = new ScheduleEntry();

            e.setSourceType("GREETING");
            e.setSourceId(g.getId().longValue());

            e.setCustomerId(customerId.longValue());

            e.setOccurrenceDate(time);

            e.setStatus(ScheduleEntryStatus.PENDING);

            e.setRemarks(g.getMessage());

            System.out.println("🔥 BEFORE SAVE");

            ScheduleEntry saved = scheduleEntryRepository.save(e);

            System.out.println("✅ Saved schedule entry ID: " + saved.getId());

        } catch (Exception ex) {

            System.out.println("❌ ERROR INSIDE createEntry");

            ex.printStackTrace();
        }
    }

    public List<ScheduleEntry> getGreetingEntries(Integer greetingId) {

        return scheduleEntryRepository
                .findBySourceTypeAndSourceId(
                        "GREETING",
                        greetingId.longValue());
    }

    @Transactional
    public void delete(Integer id, Integer accountId) {

        // delete all schedule entries
        scheduleEntryRepository.deleteBySourceIdAndSourceType(
                id.longValue(),
                "GREETING");

        // delete greeting
        repo.deleteByIdAndAccountId(id, accountId);

        System.out.println("✅ Greeting and schedule entries deleted");
    }

    /** Count total greetings for the dashboard */
    public long countByAccountId(Integer accountId) {
        return repo.countByAccountId(accountId);
    }
}