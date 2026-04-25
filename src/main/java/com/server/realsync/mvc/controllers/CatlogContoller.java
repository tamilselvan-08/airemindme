package com.server.realsync.mvc.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.server.realsync.entity.Account;
import com.server.realsync.entity.CatalogPlan;
import com.server.realsync.entity.CatalogProduct;
import com.server.realsync.entity.CatalogTemplate;
import com.server.realsync.entity.CatalogRTemplate;
import com.server.realsync.services.CatalogProductService;
import com.server.realsync.services.CatalogRTemplateService;
import com.server.realsync.services.CatalogTemplateService;
import com.server.realsync.services.SettingsPlanService;
import com.server.realsync.util.SecurityUtil;

//used for report templates


@RestController
@RequestMapping("/api/catalog")
public class CatlogContoller {

    @Autowired
    private SettingsPlanService settingsPlanService;

    @Autowired
    private CatalogProductService productService;

    @Autowired
    private CatalogTemplateService templateService;

    @Autowired
    private CatalogRTemplateService rTemplateService;

    

    // GET /api/catalog/plans
    @GetMapping("/plans")
    public List<CatalogPlan> getPlans() {
        Account account = SecurityUtil.getCurrentAccountId();
        return settingsPlanService.getByAccountId(account.getId());
    }

    // POST /api/catalog/plans
    @PostMapping("/plans")
    public CatalogPlan createPlan(@RequestBody CatalogPlan plan) {
        Account account = SecurityUtil.getCurrentAccountId();
        plan.setAccountId(account.getId());
        return settingsPlanService.save(plan);
    }

    // PUT /api/catalog/plans/{id}
    @PutMapping("/plans/{id}")
    public ResponseEntity<CatalogPlan> updatePlan(@PathVariable Integer id, @RequestBody CatalogPlan plan) {
        Account account = SecurityUtil.getCurrentAccountId();
        return settingsPlanService.getById(id)
                .filter(existing -> existing.getAccountId().equals(account.getId()))
                .map(existing -> {
                    plan.setId(id);
                    plan.setAccountId(account.getId());
                    return ResponseEntity.ok(settingsPlanService.save(plan));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/catalog/plans/{id}
    @DeleteMapping("/plans/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Integer id) {
        Account account = SecurityUtil.getCurrentAccountId();
        return settingsPlanService.getById(id)
                .filter(existing -> existing.getAccountId().equals(account.getId()))
                .map(existing -> {
                    settingsPlanService.delete(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/plans/{id}/toggle-status")
    public ResponseEntity<CatalogPlan> togglePlanStatus(@PathVariable Integer id) {
        Account account = SecurityUtil.getCurrentAccountId();
        return settingsPlanService.getById(id)
                .filter(p -> p.getAccountId().equals(account.getId()))
                .map(p -> {
                    p.setStatus("active".equals(p.getStatus()) ? "inactive" : "active");
                    return ResponseEntity.ok(settingsPlanService.save(p));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/products")
    public List<CatalogProduct> getProducts() {
        Account account = SecurityUtil.getCurrentAccountId();
        return productService.getByAccountId(account.getId());
    }

    @PostMapping("/products")
    public CatalogProduct createProduct(@RequestBody CatalogProduct product) {
        Account account = SecurityUtil.getCurrentAccountId();
        product.setAccountId(account.getId());
        return productService.save(product);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<CatalogProduct> updateProduct(@PathVariable Integer id,
            @RequestBody CatalogProduct product) {
        Account account = SecurityUtil.getCurrentAccountId();
        return productService.getById(id, account.getId())
                .map(existing -> {
                    product.setId(id);
                    product.setAccountId(account.getId());
                    return ResponseEntity.ok(productService.save(product));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Integer id) {
        Account account = SecurityUtil.getCurrentAccountId();
        return productService.getById(id, account.getId())
                .map(existing -> {
                    productService.delete(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** Toggle product active ↔ inactive */
    @PatchMapping("/products/{id}/toggle-status")
    public ResponseEntity<CatalogProduct> toggleProductStatus(@PathVariable Integer id) {
        Account account = SecurityUtil.getCurrentAccountId();
        return productService.toggleStatus(id, account.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // =====================================================================
    // TEMPLATES
    // =====================================================================

    @GetMapping("/templates")
    public List<CatalogTemplate> getTemplates() {
        Account account = SecurityUtil.getCurrentAccountId();
        return templateService.getByAccountId(account.getId());
    }

    @PostMapping("/templates")
    public CatalogTemplate createTemplate(@RequestBody CatalogTemplate template) {
        Account account = SecurityUtil.getCurrentAccountId();
        template.setAccountId(account.getId());
        return templateService.save(template);
    }

    @PutMapping("/templates/{id}")
    public ResponseEntity<CatalogTemplate> updateTemplate(@PathVariable Integer id,
            @RequestBody CatalogTemplate template) {
        Account account = SecurityUtil.getCurrentAccountId();
        return templateService.getById(id, account.getId())
                .map(existing -> {
                    template.setId(id);
                    template.setAccountId(account.getId());
                    return ResponseEntity.ok(templateService.save(template));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/templates/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Integer id) {
        Account account = SecurityUtil.getCurrentAccountId();
        return templateService.getById(id, account.getId())
                .map(existing -> {
                    templateService.delete(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** Toggle template active ↔ inactive */
    @PatchMapping("/templates/{id}/toggle-status")
    public ResponseEntity<CatalogTemplate> toggleTemplateStatus(@PathVariable Integer id) {
        Account account = SecurityUtil.getCurrentAccountId();
        return templateService.toggleStatus(id, account.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // =====================================================================
    // REPORT TEMPLATES
    // =====================================================================

    // GET all
    @GetMapping("/rtemplates")
    public List<CatalogRTemplate> getRTemplates() {
        Account account = SecurityUtil.getCurrentAccountId();
        return rTemplateService.getByAccountId(account.getId());
    }

    // CREATE
    @PostMapping("/rtemplates")
    public CatalogRTemplate createRTemplate(@RequestBody CatalogRTemplate template) {
        Account account = SecurityUtil.getCurrentAccountId();
        template.setAccountId(account.getId());
        return rTemplateService.save(template);
    }

    // UPDATE
    @PutMapping("/rtemplates/{id}")
    public ResponseEntity<CatalogRTemplate> updateRTemplate(
            @PathVariable Integer id,
            @RequestBody CatalogRTemplate template) {

        Account account = SecurityUtil.getCurrentAccountId();

        return rTemplateService.getById(id, account.getId())
                .map(existing -> {
                    template.setId(id);
                    template.setAccountId(account.getId());
                    return ResponseEntity.ok(rTemplateService.save(template));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/rtemplates/{id}")
    public ResponseEntity<?> getRTemplateById(@PathVariable Integer id) {

        Account account = SecurityUtil.getCurrentAccountId();

        return rTemplateService.getById(id, account.getId())
                .map(template -> {

                    Map<String, Object> response = Map.of(
                            "id", template.getId(),
                            "title", template.getTitle(),
                            "columns", template.getParsedColumns());

                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE
    @DeleteMapping("/rtemplates/{id}")
    public ResponseEntity<Void> deleteRTemplate(@PathVariable Integer id) {
        Account account = SecurityUtil.getCurrentAccountId();

        return rTemplateService.getById(id, account.getId())
                .map(existing -> {
                    rTemplateService.delete(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // TOGGLE STATUS
    @PatchMapping("/rtemplates/{id}/toggle-status")
    public ResponseEntity<CatalogRTemplate> toggleRTemplateStatus(@PathVariable Integer id) {
        Account account = SecurityUtil.getCurrentAccountId();

        return rTemplateService.toggleStatus(id, account.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // =====================================================================
    // SUMMARY — badge counts for the page header
    // =====================================================================

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Long>> getSummary() {
        Account account = SecurityUtil.getCurrentAccountId();
        Integer accId = account.getId();
        return ResponseEntity.ok(Map.of(
                "activePlans", settingsPlanService.countActiveByAccountId(accId),
                "activeProducts", productService.countActiveByAccountId(accId),
                "activeTemplates", templateService.countActiveByAccountId(accId)));
    }


}
