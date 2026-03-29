/**
 * 
 */
package com.server.realsync.repo;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.server.realsync.entity.CustomerGroup;

/**
 * 
 */

public interface CustomerGroupRepository extends JpaRepository<CustomerGroup, Integer> {

    List<CustomerGroup> findByAccountId(Integer accountId);

    Optional<CustomerGroup> findByAccountIdAndName(Integer accountId, String name);

    @Query(value = """
            SELECT
                cg.id,
                cg.name,
                (SELECT COUNT(*) FROM customer c
                 WHERE c.account_id = :accountId
                 AND FIND_IN_SET(cg.id, IFNULL(c.customer_group_id, ''))) AS customerCount
            FROM customer_group cg
            WHERE cg.account_id = :accountId
            """, nativeQuery = true)
    List<Object[]> findGroupsWithCounts(@Param("accountId") Integer accountId);

}