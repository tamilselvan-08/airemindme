package com.server.realsync.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.server.realsync.entity.CatalogRTemplate;

public interface CatalogRTemplateRepository extends JpaRepository<CatalogRTemplate, Integer> {

    List<CatalogRTemplate> findByAccountId(Integer accountId);
    List<CatalogRTemplate> findByAccountIdOrderByCreatedAtDesc(Integer accountId);

    Optional<CatalogRTemplate> findByIdAndAccountId(Integer id, Integer accountId);
    

    long countByAccountIdAndStatus(Integer accountId, String status);
}