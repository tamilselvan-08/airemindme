package com.server.realsync.repo;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import com.server.realsync.entity.ScheduleEntry;
import com.server.realsync.entity.ScheduleEntryStatus;

/**
 * 
 */

public interface ScheduleEntryRepository extends JpaRepository<ScheduleEntry, Long> {

    List<ScheduleEntry> findByScheduleId(Long scheduleId);

    List<ScheduleEntry> findByOccurrenceDateBefore(LocalDateTime time);

    List<ScheduleEntry> findByStatus(ScheduleEntryStatus status);

    List<ScheduleEntry> findByReminderIdOrderByOccurrenceDateAsc(Long reminderId);

    List<ScheduleEntry> findTop2ByReminderIdOrderByOccurrenceDateDesc(Long reminderId);

    List<ScheduleEntry> findBySourceTypeAndSourceId(String sourceType,Long sourceId);

    @Modifying
    void deleteByReminderIdAndStatusNot(Long reminderId, ScheduleEntryStatus status);

    @Modifying
    @Transactional
    void deleteBySourceIdAndSourceTypeAndStatusNot(Long sourceId, String sourceType, ScheduleEntryStatus status);

    @Modifying
    @Transactional
    void deleteBySourceIdAndSourceType(Long sourceId, String sourceType);

}