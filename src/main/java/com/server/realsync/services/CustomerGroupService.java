/**
 * 
 */
package com.server.realsync.services;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

import com.server.realsync.dto.CustomerGroupDTO;
import com.server.realsync.entity.CustomerGroup;
import com.server.realsync.repo.CustomerGroupRepository;

/**
 * 
 */

@Service
public class CustomerGroupService {

    private final CustomerGroupRepository customerGroupRepository;

    public CustomerGroupService(CustomerGroupRepository customerGroupRepository) {
        this.customerGroupRepository = customerGroupRepository;
    }

    public CustomerGroup save(CustomerGroup group) {
        return customerGroupRepository.save(group);
    }

    public List<CustomerGroup> getByAccountId(Integer accountId) {
        return customerGroupRepository.findByAccountId(accountId);
    }

    public Optional<CustomerGroup> getById(Integer id) {
        return customerGroupRepository.findById(id);
    }

    public List<CustomerGroupDTO> getGroupsWithCounts(Integer accountId) {

        List<Object[]> rows = customerGroupRepository.findGroupsWithCounts(accountId);

        return rows.stream().map(row -> new CustomerGroupDTO(
                ((Number) row[0]).intValue(),
                (String) row[1],
                ((Number) row[2]).longValue())).toList();
    }

    public void delete(Integer id) {
        customerGroupRepository.deleteById(id);
    }

}