package com.server.realsync.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "catalog_rtemplate")
public class CatalogRTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "account_id", nullable = false)
    private Integer accountId;

    @Column(nullable = false)
    private String title;

    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Stored as comma-separated string:
     * Example: "Hemoglobin,WBC,Platelets"
     */
    @Column(columnDefinition = "TEXT")
    private String columns;

    /**
     * Price per report
     */
    private Double price;

    /**
     * Show grand total row
     */
    @Column(name = "show_total")
    private Boolean showTotal = true;

    @Column(nullable = false)
    private String status = "active";

    @Column(name = "created_at")
    private LocalDate createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null)
            createdAt = LocalDate.now();
        if (status == null)
            status = "active";
        if (showTotal == null)
            showTotal = true;
    }

    // ── Helpers for columns list ──────────────────────────────────────

    @Transient
    public List<String> getColumnList() {
        if (columns == null || columns.isBlank())
            return List.of();
        return Arrays.stream(columns.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    @Transient
    public void setColumnList(List<String> list) {
        this.columns = (list == null || list.isEmpty())
                ? ""
                : String.join(",", list);
    }

    // ── Getters & Setters ─────────────────────────────────────────────

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getAccountId() {
        return accountId;
    }

    public void setAccountId(Integer accountId) {
        this.accountId = accountId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String desc) {
        this.description = desc;
    }

    public String getColumns() {
        return columns;
    }

    public void setColumns(String columns) {
        this.columns = columns;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Boolean getShowTotal() {
        return showTotal;
    }

    public void setShowTotal(Boolean showTotal) {
        this.showTotal = showTotal;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate d) {
        this.createdAt = d;
    }
}