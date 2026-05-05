package com.server.realsync.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "greeting")
public class Greeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "account_id", nullable = false)
    private Integer accountId;

    @Column(name = "customer_id")
    private Integer customerId;

    @Column(name = "customer_group_id")
    private Integer customerGroupId;

    @Column(name = "greeting_type", length = 30, nullable = false)
    private String greetingType;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @JsonFormat(pattern = "yyyy-MM-dd") // Ensures JS can read the date easily
    @Column(name = "greeting_date", nullable = false)
    private LocalDate greetingDate;

    @Column(name = "greeting_time")
    private LocalTime greetingTime;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "channels", length = 255)
    private String channels; // Stores "1,2" or "wa,sms"

    @Column(length = 20)
    private String status = "Scheduled";

    @Column(name = "created_at", updatable = false) // Record can't change its birth date
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();

    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Integer getId() {
        return id;
    }

    public Integer getAccountId() {
        return accountId;
    }

    public void setAccountId(Integer accountId) {
        this.accountId = accountId;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public Integer getCustomerGroupId() {
        return customerGroupId;
    }

    public void setCustomerGroupId(Integer customerGroupId) {
        this.customerGroupId = customerGroupId;
    }

    public String getGreetingType() {
        return greetingType;
    }

    public void setGreetingType(String greetingType) {
        this.greetingType = greetingType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDate getGreetingDate() {
        return greetingDate;
    }

    public void setGreetingDate(LocalDate greetingDate) {
        this.greetingDate = greetingDate;
    }

    public LocalTime getGreetingTime() {
        return greetingTime;
    }

    public void setGreetingTime(LocalTime greetingTime) {
        this.greetingTime = greetingTime;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getChannels() {
        return channels;
    }

    public void setChannels(String channels) {
        this.channels = channels;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
