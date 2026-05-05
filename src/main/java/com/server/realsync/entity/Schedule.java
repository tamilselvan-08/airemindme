/**
 * 
 */
package com.server.realsync.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "schedule")
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_id", nullable = false)
    private Integer accountId;

    @Column(name = "customer_id")
    private Integer customerId;

    @Column(name = "business_plan_id")
    private Long businessPlanId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScheduleType type;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String remarks;

    private BigDecimal amount;

    @Column(name = "before_due_date")
    private Integer beforeDueDate;

    @Column(name = "sent_sms", nullable = false)
    private boolean sentSms = false;

    @Column(name = "sent_email", nullable = false)
    private boolean sentEmail = false;

    @Column(name = "sent_whatsapp", nullable = false)
    private boolean sentWhatsapp = false;

    @Column(name = "whatsapp_content", length = 2000)
    private String whatsappContent;

    @Column(name = "start_datetime")
    private LocalDateTime startDatetime;

    @Column(name = "end_datetime")
    private LocalDateTime endDatetime;

    @Enumerated(EnumType.STRING)
    @Column(name = "repeat_every")
    private RepeatEvery repeatEvery = RepeatEvery.NONE;

    @Column(name = "repeat_count")
    private Integer repeatCount = 1;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @Column(name = "source_type")
    private String sourceType; // REMINDER / GREETING

    @Column(name = "source_id")
    private Long sourceId;

    @Column(name = "execution_status")
    private String executionStatus = "PENDING";

    @Column(name = "retry_count")
    private Integer retryCount = 0;

    @Column(name = "last_error", length = 1000)
    private String lastError;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }

    public Long getSourceId() {
        return sourceId;
    }

    public void setSourceId(Long sourceId) {
        this.sourceId = sourceId;
    }

    public String getExecutionStatus() {
        return executionStatus;
    }

    public void setExecutionStatus(String executionStatus) {
        this.executionStatus = executionStatus;
    }

    public Integer getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }

    public String getLastError() {
        return lastError;
    }

    public void setLastError(String lastError) {
        this.lastError = lastError;
    }

    public boolean isSentSms() {
        return sentSms;
    }

    public void setSentSms(boolean sentSms) {
        this.sentSms = sentSms;
    }

    public boolean isSentEmail() {
        return sentEmail;
    }

    public void setSentEmail(boolean sentEmail) {
        this.sentEmail = sentEmail;
    }

    public boolean isSentWhatsapp() {
        return sentWhatsapp;
    }

    public void setSentWhatsapp(boolean sentWhatsapp) {
        this.sentWhatsapp = sentWhatsapp;
    }
}