/**
 * 
 */
package com.server.realsync.repo;

/**
 * 
 */
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.server.realsync.entity.Promotion;


public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    List<Promotion> findByAccountId(Integer accountId);

    List<Promotion> findByAccountIdAndStatus(Integer accountId, String status);

    List<Promotion> findByAccountIdAndScheduledAtIsNotNull(Integer accountId);
    long countByAccountId(Integer accountId);

}