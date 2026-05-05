package com.server.realsync.repo;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

import com.server.realsync.entity.Schedule;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByAccountId(Integer accountId);

    List<Schedule> findByCustomerId(Integer customerId);

    List<Schedule> findByStartDatetimeBefore(LocalDateTime time);

    void deleteBySourceTypeAndSourceId(String sourceType, Long sourceId);

    List<Schedule> findTop100ByExecutionStatusAndStartDatetimeBefore(
            String status,
            LocalDateTime time);

}