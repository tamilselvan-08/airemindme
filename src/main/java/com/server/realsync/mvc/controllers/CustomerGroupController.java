package com.server.realsync.mvc.controllers;

import com.server.realsync.dto.CustomerGroupDTO;
import com.server.realsync.entity.Account;
import com.server.realsync.entity.CustomerGroup;
import com.server.realsync.services.CustomerGroupService;
import com.server.realsync.services.CustomerService;
import com.server.realsync.util.SecurityUtil;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/customer-groups")
public class CustomerGroupController {

    private final CustomerGroupService groupService;
    private final CustomerService customerService;

    // Standard constructor injection (Cleaner than multiple @Autowired)
    public CustomerGroupController(CustomerGroupService groupService, CustomerService customerService) {
        this.groupService = groupService;
        this.customerService = customerService;
    }

    /**
     * GET all groups for the currently logged-in account.
     */
    @GetMapping("/my-groups")
public ResponseEntity<List<CustomerGroupDTO>> getMyGroups() {
    Account account = SecurityUtil.getCurrentAccountId(); 

    if (account == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    List<CustomerGroupDTO> groups = groupService.getGroupsWithCounts(account.getId());
    
    return ResponseEntity.ok(groups);
}

    /**
     * POST to save a group.
     */
    @PostMapping("/save")
    public ResponseEntity<?> saveGroup(@RequestBody CustomerGroup group) {
        Account account = SecurityUtil.getCurrentAccountId();
        if (account == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User session not found.");
        }

        group.setAccountId(account.getId());

        // Check for duplicate names for this account
        List<CustomerGroup> existingGroups = groupService.getByAccountId(account.getId());
        boolean exists = existingGroups.stream()
                .anyMatch(g -> g.getName().equalsIgnoreCase(group.getName()));

        if (exists) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("A group with this name already exists.");
        }

        return ResponseEntity.ok(groupService.save(group));
    }

    /**
     * DELETE a group.
     * Includes cleanup to remove the ID from customers without deleting them.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGroup(@PathVariable Integer id) {
        Account account = SecurityUtil.getCurrentAccountId();
        if (account == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // SECURITY CHECK: Verify the group belongs to the logged-in account
        Optional<CustomerGroup> groupOpt = groupService.getById(id);
        if (groupOpt.isEmpty() || !groupOpt.get().getAccountId().equals(account.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You do not have permission to delete this group.");
        }

        // 1. Clean up the customer table (Remove the 'label' from Tamil and others)
        customerService.cleanupDeletedGroup(id);

        // 2. Delete the actual group definition
        groupService.delete(id);

        return ResponseEntity.ok().build();
    }
}