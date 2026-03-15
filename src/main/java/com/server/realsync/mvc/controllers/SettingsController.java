package com.server.realsync.mvc.controllers;

import com.server.realsync.dto.PasswordResetDto;
import com.server.realsync.entity.Account;
import com.server.realsync.services.UserService;
import com.server.realsync.util.SecurityUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.server.realsync.entity.User;
import com.server.realsync.services.AccountService;
import com.server.realsync.services.CustomerService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ==========================
    // UPDATE PROFILE
    // ==========================
    @PostMapping("/profile")
    public String updateProfile(@RequestBody Account req) {

        Account account = SecurityUtil.getCurrentAccountId();

        account.setName(req.getName());
        account.setEmail(req.getEmail());
        account.setMobile(req.getMobile());
        account.setBusinessName(req.getBusinessName());

        accountService.save(account);

        return "Profile Updated";
    }

    // ==========================
    // UPDATE PASSWORD
    // ==========================
    @PostMapping("/password")
    public String updatePassword(@RequestBody PasswordResetDto dto) {

        User user = SecurityUtil.getLoggedInUser();
        if (user == null) {
            return "Unauthorized";
        }

        // Verify current password before changing
        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            return "Current password is incorrect";
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userService.saveUser(user);

        return "Password Updated Successfully";
    }
}