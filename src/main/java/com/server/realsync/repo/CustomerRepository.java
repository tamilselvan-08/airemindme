/**
 * 
 */
package com.server.realsync.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.server.realsync.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    Page<Customer> findByAccountId(Integer accountId, Pageable pageable);

    Page<Customer> findByAccountIdAndCustomerGroupId(
            Integer accountId,
            Integer customerGroupId,
            Pageable pageable);

    long countByAccountIdAndCustomerGroupId(Integer accountId, Integer customerGroupId);

    Optional<Customer> findByAccountIdAndMobile(Integer accountId, String mobile);


    long countByAccountId(Integer accountId);

    @Query("""
            SELECT c FROM Customer c
            WHERE c.accountId = :accountId
            AND (
            LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))
            OR c.mobile LIKE CONCAT('%', :search, '%')
            OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%'))
            )
            """)
    Page<Customer> searchByAccount(Integer accountId, String search, Pageable pageable);

    @Query("""
            SELECT c FROM Customer c
            WHERE c.accountId = :accountId
            AND c.customerGroupId = :groupId
            AND (
            LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))
            OR c.mobile LIKE CONCAT('%', :search, '%')
            OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%'))
            )
            """)
    Page<Customer> searchByAccountAndGroup(Integer accountId,Integer groupId,String search,Pageable pageable);

}