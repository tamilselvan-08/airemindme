package com.server.realsync.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.server.realsync.entity.Greeting;
import com.server.realsync.entity.Reminder;
import com.server.realsync.repo.GreetingRepository;

@Service
public class GreetingService {

    @Autowired
    private GreetingRepository repo;

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
        // Industry consistency check: default status
        if (greeting.getStatus() == null) {
            greeting.setStatus("Scheduled");
        }
        return repo.save(greeting);
    }

    public void delete(Integer id, Integer accountId) {
        repo.deleteByIdAndAccountId(id, accountId);
    }

    /** Count total greetings for the dashboard */
    public long countByAccountId(Integer accountId) {
        return repo.countByAccountId(accountId);
    }
}