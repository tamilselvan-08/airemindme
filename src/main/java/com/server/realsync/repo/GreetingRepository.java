package com.server.realsync.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import com.server.realsync.entity.Greeting;

import jakarta.transaction.Transactional;

public interface GreetingRepository extends JpaRepository<Greeting, Integer> {

    List<Greeting> findByAccountIdOrderByCreatedAtDesc(Integer accountId);
    List<Greeting> findByCustomerIdAndAccountId(Integer customerId, Integer accountId);

    Optional<Greeting> findByIdAndAccountId(Integer id, Integer accountId);
    @Modifying
    @Transactional
    long deleteByIdAndAccountId(Integer id, Integer accountId);

    long countByAccountId(Integer accountId);
}