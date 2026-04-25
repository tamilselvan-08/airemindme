package com.server.realsync.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.server.realsync.entity.Report;
import com.server.realsync.entity.Account;
import com.server.realsync.entity.Customer;
import com.server.realsync.entity.CatalogRTemplate;

import com.server.realsync.repo.ReportRepository;
import com.server.realsync.repo.CustomerRepository;
import com.server.realsync.repo.CatalogRTemplateRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.server.realsync.dto.ReportResponse;
import com.server.realsync.util.SecurityUtil;

import java.util.List;

@Service
public class ReportService {

    @Autowired
    private ReportRepository repo;

    @Autowired
    private CustomerRepository customerRepo; // ✅ REQUIRED

    @Autowired
    private CatalogRTemplateRepository templateRepo; // ✅ REQUIRED

    // SAVE
    public Report save(Report report) {
        Account account = SecurityUtil.getCurrentAccountId();
        report.setAccountId(account.getId());
        return repo.save(report);
    }

    // OLD METHOD (keep if needed)
    public List<Report> getByAccountId(Integer accountId) {
        return repo.findByAccountId(accountId);
    }

    public Report getById(Integer id) {
        return repo.findById(id).orElse(null);
    }

    public List<ReportResponse> getAllReports() {

        Account account = SecurityUtil.getCurrentAccountId();

        List<Report> reports = repo.findByAccountId(account.getId());

        return reports.stream()
                .map(this::mapToResponse) // 🔥 reuse
                .toList();
    }

    public ReportResponse getReportById(Integer id) {

        Account account = SecurityUtil.getCurrentAccountId();

        Report r = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        if (!r.getAccountId().equals(account.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        return mapToResponse(r);
    }
private ReportResponse mapToResponse(Report r) {

    Customer c = customerRepo.findById(r.getPatientId()).orElse(null);
    CatalogRTemplate t = templateRepo.findById(r.getTemplateId()).orElse(null);

    ReportResponse res = new ReportResponse();

    res.id = r.getId();
    res.status = r.getStatus();
    res.date = r.getCreatedAt() != null ? r.getCreatedAt().toString() : "";

    res.setTemplateId(r.getTemplateId());

    // 🔥 ADD THIS (THIS IS YOUR FIX)
    res.setPatientId(r.getPatientId());

    res.customerName = (c != null) ? c.getName() : "Unknown";
    res.mobile = (c != null) ? c.getMobile() : "";

    res.reportName = (t != null) ? t.getTitle() : "No Template";
    res.price = (t != null && t.getPrice() != null) ? t.getPrice() : 0.0;

    try {
        ObjectMapper mapper = new ObjectMapper();
        res.fields = mapper.readValue(r.getFields(), List.class);
    } catch (Exception e) {
        res.fields = List.of();
    }

    return res;
}
}