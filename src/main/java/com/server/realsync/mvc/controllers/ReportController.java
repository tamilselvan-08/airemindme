package com.server.realsync.mvc.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.server.realsync.entity.Account;
import com.server.realsync.entity.Report;
import com.server.realsync.services.ReportService;
import com.server.realsync.util.SecurityUtil;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    // CREATE REPORT
    @PostMapping
    public ResponseEntity<?> createReport(@RequestBody Report report) {

        Account account = SecurityUtil.getCurrentAccountId();

        report.setAccountId(account.getId());

        return ResponseEntity.ok(reportService.save(report));
    }

    // GET ALL REPORTS
    @GetMapping
    public List<Report> getReports() {

        Account account = SecurityUtil.getCurrentAccountId();

        return reportService.getByAccountId(account.getId());
    }

    // GET SINGLE REPORT
    @GetMapping("/{id}")
    public ResponseEntity<?> getReport(@PathVariable Integer id) {

        Report report = reportService.getById(id);

        if (report == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(report);
    }
}