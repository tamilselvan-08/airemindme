package com.server.realsync.services;

import com.server.realsync.entity.Account;
import com.server.realsync.repo.AccountRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AccountService {

    @Autowired
    private AccountRepository repository;

    public List<Account> findAll() {
        return repository.findAll();
    }

    public Optional<Account> findById(Integer id) {
        return repository.findById(id);
    }

    public Account save(Account account) {
        return repository.save(account);
    }

    
    public Account getById(int id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Account not found"));
    }
    public void deleteById(Integer id) {
        repository.deleteById(id);
    }

    /*
     * public void updateProfile(String username, Account account) {
     * Account accountData = repository.findById(account.getId())
     * .orElseThrow(() -> new RuntimeException("User not found"));
     * 
     * accountData.setFirstName(req.getFirstName());
     * accountData.setLastName(req.getLastName());
     * accountData.setEmail(req.getEmail());
     * accountData.setMobile(req.getMobile());
     * accountData.setGst(req.getGst());
     * accountData.setAddress(req.getAddress());
     * 
     * // Handle password update
     * if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
     * if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
     * throw new RuntimeException("Current password is incorrect");
     * }
     * if (!req.getNewPassword().equals(req.getConfirmPassword())) {
     * throw new RuntimeException("New password and Confirm password do not match");
     * }
     * user.setPassword(passwordEncoder.encode(req.getNewPassword()));
     * }
     * 
     * accountRepository.save(account);
     * userRepository.save(user);
     * }
     */
}
