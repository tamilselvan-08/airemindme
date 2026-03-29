package com.server.realsync.mvc.controllers;

import com.server.realsync.entity.*;
import com.server.realsync.services.*;
import com.server.realsync.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    @Autowired
    private PromotionEntryService entryService;

    @Autowired
    private CustomerService customerService;

    /**
     * Creates a promotion and generates entries for all targeted customers.
     */
    @PostMapping
    @Transactional
    public ResponseEntity<Map<String, Object>> create(@RequestBody PromotionRequest request) {
        Account account = SecurityUtil.getCurrentAccountId();
        if (account == null) {
            return ResponseEntity.status(401).build();
        }

        // 1. Initialize the Promotion entity
        Promotion p = new Promotion();
        p.setAccountId(account.getId());
        p.setCustomerGroupId(request.groupId()); // Can be null for individual sends
        p.setDescription(request.description());
        p.setImageUrl("");
        p.setType("MANUAL");
        p.setStatus("ACTIVE");
        p.setCreatedAt(LocalDateTime.now());

        // 2. Save the parent Promotion first
        Promotion saved = promotionService.save(p);

        // 3. Determine the list of recipients
        List<Customer> customers;
        if (request.customerId() != null) {

            Customer customer = customerService
                    .getById(account.getId(), request.customerId())
                    .orElse(null);

            if (customer == null) {
                return ResponseEntity.badRequest().body(null);
            }

            customers = List.of(customer);

        } else if (request.groupId() != null) {

            customers = customerService
                    .getByAccountAndGroup(account.getId(), request.groupId(), Pageable.unpaged())
                    .getContent();

            if (customers.isEmpty()) {
                return ResponseEntity.badRequest().body(null);
            }

        } else {
            return ResponseEntity.badRequest().build();
        }

        // 4. Create a PromotionEntry for every customer found
        for (Customer c : customers) {
            PromotionEntry entry = new PromotionEntry();
            entry.setPromotionId(saved.getId());
            entry.setCustomerId(c.getId());
            entry.setTriggeredDate(LocalDateTime.now());
            entryService.save(entry);
        }

        String link = "http://localhost:8000/promo/" + saved.getId();

        return ResponseEntity.ok(java.util.Map.of(
                "id", saved.getId(),
                "link", link));
    }

    @GetMapping
    public List<Promotion> getAll() {
        Account account = SecurityUtil.getCurrentAccountId();
        return promotionService.getByAccount(account.getId());
    }

    @GetMapping("/promo/{id}")
public String openPromo(@PathVariable Long id, Model model) {

    Promotion p = promotionService.getById(id).orElse(null);

    if (p == null) return "error";

    model.addAttribute("promo", p);

    return "remindmeui/promo-landing"; // your HTML
}
}

/**
 * Data Transfer Object (DTO) to handle the incoming JSON payload safely.
 */
record PromotionRequest(Integer groupId, Integer customerId, String description) {
}
