package com.server.realsync.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.server.realsync.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {

        Page<Customer> findByAccountId(Integer accountId, Pageable pageable);

        List<Customer> findByAccountId(Integer accountId);

        @Query(value = "SELECT * FROM customer WHERE account_id = :accountId AND FIND_IN_SET(:groupId, customer_group_id) ORDER BY created_at DESC", countQuery = "SELECT COUNT(*) FROM customer WHERE account_id = :accountId AND FIND_IN_SET(:groupId, customer_group_id)", nativeQuery = true)
        Page<Customer> findByAccountIdAndCustomerGroupId(
                        @Param("accountId") Integer accountId,
                        @Param("groupId") Integer customerGroupId,
                        Pageable pageable);

        // FIX: Added @Param
        @Query(value = "SELECT COUNT(*) FROM customer WHERE account_id = :accountId AND FIND_IN_SET(:groupId, customer_group_id)", nativeQuery = true)
        long countByAccountIdAndCustomerGroupId(
                        @Param("accountId") Integer accountId,
                        @Param("groupId") Integer customerGroupId);

        Optional<Customer> findByAccountIdAndMobile(Integer accountId, String mobile);

        Optional<Customer> findByIdAndAccountId(Integer id, Integer accountId);

        long countByAccountId(Integer accountId);

        long countByCustomerGroupId(String customerGroupId);

        @Query(value = """
                        SELECT * FROM customer
                        WHERE FIND_IN_SET(:groupId, customer_group_id)
                        """, nativeQuery = true)
        List<Customer> findByGroupId(@Param("groupId") Integer groupId);

        @Query("""
                        SELECT c FROM Customer c
                        WHERE c.accountId = :accountId
                        AND (
                            LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))
                            OR c.mobile LIKE CONCAT('%', :search, '%')
                            OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%'))
                        )
                        """)
        Page<Customer> searchByAccount(@Param("accountId") Integer accountId, @Param("search") String search,
                        Pageable pageable);

        @Query(value = """
                        SELECT * FROM customer
                        WHERE account_id = :accountId
                        AND FIND_IN_SET(:groupId, customer_group_id)
                        AND (
                            LOWER(name) LIKE LOWER(CONCAT('%', :search, '%'))
                            OR mobile LIKE CONCAT('%', :search, '%')
                            OR LOWER(email) LIKE LOWER(CONCAT('%', :search, '%'))
                        )
                        ORDER BY created_at DESC
                        """, countQuery = "SELECT COUNT(*) FROM customer WHERE account_id = :accountId AND FIND_IN_SET(:groupId, customer_group_id)", nativeQuery = true)
        Page<Customer> searchByAccountAndGroup(
                        @Param("accountId") Integer accountId,
                        @Param("groupId") Integer groupId,
                        @Param("search") String search,
                        Pageable pageable);

        @Modifying
        @Query(value = "UPDATE customer SET customer_group_id = " +
                        "TRIM(BOTH ',' FROM REPLACE(CONCAT(',', customer_group_id, ','), CONCAT(',', :groupId, ','), ',')) "
                        +
                        "WHERE FIND_IN_SET(:groupId, customer_group_id)", nativeQuery = true)
        void removeGroupIdFromAllCustomers(@Param("groupId") Integer groupId);

        @Modifying
        @Query(value = "UPDATE customer SET customer_group_id = NULL WHERE customer_group_id = ''", nativeQuery = true)
        void setEmptyGroupsToNull();
}