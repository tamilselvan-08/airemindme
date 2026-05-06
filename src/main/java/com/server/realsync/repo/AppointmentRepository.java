package com.server.realsync.repo;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.server.realsync.entity.Appointment;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

        List<Appointment> findByAccountId(Integer accountId);

        Optional<Appointment> findByIdAndAccountId(Long id, Integer accountId);

        List<Appointment> findByCustomer_Id(Integer customerId);

        long countByAccountId(Integer accountId);

        List<Appointment> findByAccountIdAndStatus(Integer accountId, String status);

        List<Appointment> findByAccountIdAndAppointmentDate(
                        Integer accountId,
                        LocalDate appointmentDate);

        List<Appointment> findByAccountIdAndAppointmentDateGreaterThanEqual(
                        Integer accountId,
                        LocalDate date);

        List<Appointment> findByAccountIdAndAppointmentDateBetween(
                        Integer accountId,
                        LocalDate startDate,
                        LocalDate endDate);

        List<Appointment> findByAccountIdAndAppointmentDateAndAppointmentTime(
                        Integer accountId,
                        LocalDate appointmentDate,
                        java.time.LocalTime appointmentTime);

        @Query("""
                            SELECT a
                            FROM Appointment a
                            LEFT JOIN FETCH a.customer
                            WHERE a.accountId = :accountId
                        """)
        List<Appointment> findAllWithCustomer(Integer accountId);
}