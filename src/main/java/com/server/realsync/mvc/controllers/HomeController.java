package com.server.realsync.mvc.controllers;

import java.util.Optional;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.server.realsync.entity.Account;
import com.server.realsync.entity.Customer;
import com.server.realsync.entity.CatalogPlan;
import com.server.realsync.services.AccountService;
import com.server.realsync.services.CustomerService;
import com.server.realsync.services.SettingsPlanService;

import com.server.realsync.services.UserService;
import com.server.realsync.util.CustomerMessageService;

import com.server.realsync.util.GmailSender;
import com.server.realsync.util.SecurityUtil;

import io.swagger.v3.oas.annotations.tags.Tag;

@Controller
@RequestMapping("/")
@Tag(name = "Home API", description = "HomeController APIs")
public class HomeController {

	@Autowired
	private UserService userService;
	@Autowired
	private CustomerService customerService;
	@Autowired
	private AccountService accountService;
	@Autowired
	CustomerMessageService customerMessageService;
	@Autowired
	private SettingsPlanService settingsPlanService;

	@Autowired
	GmailSender gmailSender;

	@GetMapping
	public String getWebHomePage(Model model) {
		Account account = SecurityUtil.getCurrentAccountId();
		model.addAttribute("accountId", account.getId());
		return "remindme/index.html";
	}

	@GetMapping({ "/login.html", "/signin.html" })
	public String getLogin(@RequestParam(value = "error", required = false) String error, Model model) {
		if ("true".equals(error)) {
			model.addAttribute("errorMessage", "Invalid username or password");
		}
		return "remindmeui/login";
		// return "realsync/index";
	}

	@GetMapping("/signup.html")
	public String getRegister(@RequestParam(value = "refAccId", required = false) String refAccId,
			Model model) {

		model.addAttribute("refAccId", refAccId);
		return "remindme/signup";
	}

	@GetMapping("/home.html")
	public String getAdminDashboard(Model model) {

		return "remindmeui/home";
	}

	@GetMapping("/customers.html")
	public String getCustomers(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(required = false) String segment,
			@RequestParam(required = false) String search,
			Model model) {

		Account account = SecurityUtil.getCurrentAccountId();

		Pageable pageable = PageRequest.of(page, 6, Sort.by("createdAt").descending());
		long totalCustomers = customerService.getTotalCustomers(account.getId());

		Page<Customer> customers;

		Integer groupId = null;

		if (segment != null && !segment.isBlank()) {
			groupId = switch (segment) {
				case "vip" -> 1;
				case "regular" -> 2;
				case "new" -> 3;
				case "inactive" -> 4;
				default -> null;
			};
		}

		if (search != null && !search.isBlank()) {

			if (groupId != null) {
				customers = customerService.searchByAccountAndGroup(
						account.getId(), groupId, search, pageable);
			} else {
				customers = customerService.searchByAccount(
						account.getId(), search, pageable);
			}

		} else {

			if (groupId != null) {
				customers = customerService.getByAccountAndGroup(
						account.getId(), groupId, pageable);
			} else {
				customers = customerService.getByAccount(
						account.getId(), pageable);
			}

		}

		model.addAttribute("customers", customers.getContent());
		model.addAttribute("currentPage", page);
		model.addAttribute("totalPages", customers.getTotalPages());
		model.addAttribute("totalCustomers", totalCustomers);
		model.addAttribute("search", search);
		model.addAttribute("selectedSegment", segment);

		return "remindmeui/customers";
	}

	@GetMapping("/customer-detail.html")
	public String getCustomerDetail(@RequestParam Integer id, Model model) {
		Account account = SecurityUtil.getCurrentAccountId();
		Optional<Customer> customer = customerService.getById(account.getId(), id);
		if (customer.isEmpty()) {
			return "redirect:/customers.html";
		}
		model.addAttribute("customer", customer.get());
		return "remindmeui/customer-detail";
	}

	@GetMapping("/promotions.html")
	public String getPromotions(Model model) {

		return "remindmeui/promotions";
	}

	@GetMapping("/reminder-detail.html")
	public String getReminderDetail(Model model) {

		return "remindmeui/reminder-detail";
	}

	@GetMapping("/greeting-detail.html")
	public String getGreetingDetail(Model model) {

		return "remindmeui/greeting-detail";
	}

	@GetMapping("/promo-landing.html")
	public String getPromoLanding(Model model) {

		return "remindmeui/promo-landing";
	}

	@GetMapping("/catalog.html")
	public String getCatalog(Model model) {

		Account account = SecurityUtil.getCurrentAccountId();

		List<CatalogPlan> plans = settingsPlanService.getByAccountId(account.getId());

		model.addAttribute("plans", plans);
		model.addAttribute("totalPlans", plans.size());
		model.addAttribute("activePlans", settingsPlanService.countActiveByAccountId(account.getId()));

		return "remindmeui/catalog";
	}


	@GetMapping("/engagement.html")
	public String engagement(Model model) {
		
		return "remindmeui/engagement";
	}
	
	@GetMapping("/user-management.html")
	public String users(Model model) {
		model.addAttribute("activePage", "users");
		return "remindmeui/user-management";
	}

	@GetMapping("/reports.html")
	public String getAdminReport(Model model) {

		return "remindme/reports";
	}

	@GetMapping("/report-history")
	public String reportHistory(Model model) {
		model.addAttribute("activePage", "reports");
		return "report-history";
	}

	@GetMapping("/settings.html")
	public String getSettings(Model model) {
		Account loggedIn = SecurityUtil.getCurrentAccountId();

		Account account = accountService.getById(loggedIn.getId());
		model.addAttribute("account", account);
		return "remindmeui/settings";
	}

	@GetMapping("index.html")
	public String getIndexPage() {

		return "remindme/index.html";
	}

}