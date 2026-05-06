package com.server.realsync.mvc.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.server.realsync.dto.AppointmentResponse;
import com.server.realsync.entity.Account;
import com.server.realsync.entity.Appointment;
import com.server.realsync.services.AppointmentService;
import com.server.realsync.util.SecurityUtil;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    @GetMapping
    public List<AppointmentResponse> getAll() {
        Integer accountId = SecurityUtil.getCurrentAccountId().getId();
        return service.getAll(accountId);
    }

    @PostMapping
    public Appointment create(@RequestBody Appointment appt,
            @RequestParam Integer customerId) {

        Integer accountId = SecurityUtil.getCurrentAccountId().getId();
        return service.create(appt, customerId, accountId);
    }

    @PutMapping("/{id}")
    public Appointment update(@PathVariable Long id,
            @RequestBody Appointment appt) {

        Integer accountId = SecurityUtil.getCurrentAccountId().getId();
        return service.update(appt, id, accountId);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        Integer accountId = SecurityUtil.getCurrentAccountId().getId();
        service.delete(id, accountId);
        return "Deleted";
    }

    @PutMapping("/{id}/status")
    public Appointment updateStatus(@PathVariable Long id,
            @RequestParam String status) {

        Integer accountId = SecurityUtil.getCurrentAccountId().getId();
        return service.updateStatus(id, accountId, status);
    }
}