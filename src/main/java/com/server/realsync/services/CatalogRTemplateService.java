package com.server.realsync.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.server.realsync.entity.CatalogRTemplate;
import com.server.realsync.repo.CatalogRTemplateRepository;

@Service
public class CatalogRTemplateService {

    @Autowired
    private CatalogRTemplateRepository repo;

    /** All report templates for an account, newest first */
    public List<CatalogRTemplate> getByAccountId(Integer accountId) {
        return repo.findByAccountIdOrderByCreatedAtDesc(accountId);
    }

    /** Single report template scoped to account */
    public Optional<CatalogRTemplate> getById(Integer id, Integer accountId) {
        return repo.findByIdAndAccountId(id, accountId);
    }

    /** Create or update */
    public CatalogRTemplate save(CatalogRTemplate template) {
        return repo.save(template);
    }

    /** Hard delete */
    public void delete(Integer id) {
        repo.deleteById(id);
    }

    /** Count active report templates */
    public long countActiveByAccountId(Integer accountId) {
        return repo.countByAccountIdAndStatus(accountId, "active");
    }

    /**
     * Toggle status: active ↔ inactive
     */
    public Optional<CatalogRTemplate> toggleStatus(Integer id, Integer accountId) {
        return repo.findByIdAndAccountId(id, accountId).map(t -> {
            t.setStatus("active".equals(t.getStatus()) ? "inactive" : "active");
            return repo.save(t);
        });
    }
}