package com.server.realsync.dto;

import java.util.List;
import java.util.Map;

public class ReportResponse {

    public Integer id;
    public String reportName;
    public String customerName;
    public String mobile;
    public String date;
    public Double price;
    public String status;
    public List<Map<String, Object>> fields;

    private Integer templateId; // ✅ ADD THIS

    public Integer getTemplateId() {
        return templateId;
    }

    public void setTemplateId(Integer templateId) {
        this.templateId = templateId;
    }

    private Integer patientId;

    public Integer getPatientId() {
        return patientId;
    }

    public void setPatientId(Integer patientId) {
        this.patientId = patientId;
    }
}
