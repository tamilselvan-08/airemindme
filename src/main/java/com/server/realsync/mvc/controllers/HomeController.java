package com.server.realsync.mvc.controllers;

import java.util.Optional;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.server.realsync.dto.ReportResponse;
import com.server.realsync.entity.Account;
import com.server.realsync.entity.AdminUser;
import com.server.realsync.entity.Appointment;
import com.server.realsync.entity.Customer;
import com.server.realsync.entity.CatalogPlan;
import com.server.realsync.entity.CatalogProduct;
import com.server.realsync.entity.CatalogRTemplate;
import com.server.realsync.entity.CustomerGroup;
import com.server.realsync.entity.Greeting;
import com.server.realsync.entity.Reminder;
import com.server.realsync.services.AccountService;
import com.server.realsync.services.CustomerService;
import com.server.realsync.services.ReminderService;
import com.server.realsync.services.GreetingService;
import com.server.realsync.services.CustomerGroupService;
import com.server.realsync.services.CatalogProductService;
import com.server.realsync.services.CatalogRTemplateService;
import com.server.realsync.services.ReportService;
import com.server.realsync.services.AdminUserService;
import com.server.realsync.services.AppointmentService;
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
	private AccountService accountService;
	@Autowired
	CustomerMessageService customerMessageService;
	@Autowired
	private CustomerService customerService;
	@Autowired
	CustomerGroupService customerGroupService;
	@Autowired
	private SettingsPlanService settingsPlanService;
	@Autowired
	private CatalogProductService catalogProductService;
	@Autowired
	private CatalogRTemplateService catalogRTemplateService;
	@Autowired
	private AdminUserService adminUserService;
	@Autowired
	private AppointmentService appointmentService;
	@Autowired
	private ReportService reportService;
	@Autowired
	private ReminderService reminderService;
	@Autowired
	private GreetingService greetingService;
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
		Account loggedIn = SecurityUtil.getCurrentAccountId();

		Account account = accountService.getById(loggedIn.getId());

		model.addAttribute("account", account);
		return "remindmeui/home";
	}

	@GetMapping("/customers.html")
	public String getCustomers(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(required = false) String segment, // Now represents the dynamic Group ID
			@RequestParam(required = false) String search,
			Model model) {

		Account loggedIn = SecurityUtil.getCurrentAccountId();

		Account account = accountService.getById(loggedIn.getId());

		model.addAttribute("activePage", "customers");

		List<CustomerGroup> accountGroups = customerGroupService.getByAccountId(account.getId());
		model.addAttribute("customerGroups", accountGroups);

		Pageable pageable = PageRequest.of(page, 6, Sort.unsorted());
		;
		long totalCustomers = customerService.getTotalCustomers(account.getId());
		Page<Customer> customers;

		Integer groupId = null;
		if (segment != null && !segment.isBlank() && !segment.equalsIgnoreCase("all")) {
			try {

				groupId = Integer.parseInt(segment);
			} catch (NumberFormatException e) {

				groupId = null;
			}
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
		model.addAttribute("account", account);
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
		Account loggedIn = SecurityUtil.getCurrentAccountId();

		Account account = accountService.getById(loggedIn.getId());

		model.addAttribute("account", account);
		Optional<Customer> customer = customerService.getById(account.getId(), id);
		if (customer.isEmpty()) {
			return "redirect:/customers.html";
		}
		model.addAttribute("customer", customer.get());
		return "remindmeui/customer-detail";
	}

	@GetMapping("/promotions.html")
	public String getPromotions(Model model) {
		Account loggedIn = SecurityUtil.getCurrentAccountId();

		Account account = accountService.getById(loggedIn.getId());

		model.addAttribute("account", account);
		return "remindmeui/promotions";
	}

	@GetMapping("/reminder-detail.html")
	public String getReminderDetail(@RequestParam("id") Integer id, Model model) {

		Account loggedIn = SecurityUtil.getCurrentAccountId();
		Account account = accountService.getById(loggedIn.getId());

		Optional<Reminder> reminderOpt = reminderService.getById(id, account.getId());
		if (reminderOpt.isEmpty()) {
			return "redirect:/engagement.html";
		}

		Reminder reminder = reminderOpt.get();

		// ✅ Basic
		model.addAttribute("account", account);
		model.addAttribute("reminder", reminder);

		// ✅ Customer
		Optional<Customer> customer = customerService.getById(account.getId(), reminder.getCustomerId());
		model.addAttribute("customer", customer.orElse(new Customer()));

		// ✅ Prevent Thymeleaf crash
		model.addAttribute("attachedPlan", null);
		model.addAttribute("attachedProduct", null);

		// ✅ Plan / Product logic
		if (reminder.getAttachedItemId() != null && reminder.getAttachedItemType() != null) {

			if ("plan".equalsIgnoreCase(reminder.getAttachedItemType())) {
				settingsPlanService.getById(reminder.getAttachedItemId())
						.ifPresent(plan -> model.addAttribute("attachedPlan", plan));
			}

			else if ("product".equalsIgnoreCase(reminder.getAttachedItemType())) {
				catalogProductService
						.getById(reminder.getAttachedItemId(), account.getId())
						.ifPresent(product -> model.addAttribute("attachedProduct", product));
			}
		}

		// ✅ Date formatting
		if (reminder.getCreatedAt() != null) {
			model.addAttribute("createdAtFormatted",
					reminder.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")));
		} else {
			model.addAttribute("createdAtFormatted", "N/A");
		}

		return "remindmeui/reminder-detail";
	}

	@GetMapping("/reminder-detail-onetime.html")
	public String getReminderDetailOneTime(@RequestParam("id") Integer id, Model model) {
		Account loggedIn = SecurityUtil.getCurrentAccountId();
		Account account = accountService.getById(loggedIn.getId());

		Optional<Reminder> reminderOpt = reminderService.getById(id, account.getId());
		if (reminderOpt.isEmpty()) {
			return "redirect:/engagement.html";
		}

		Reminder reminder = reminderOpt.get();

		// 1. Always add basic attributes first
		model.addAttribute("account", account);
		model.addAttribute("reminder", reminder);

		// 2. Safely handle Customer
		Optional<Customer> customer = customerService.getById(account.getId(), reminder.getCustomerId());
		model.addAttribute("customer", customer.orElse(new Customer()));

		// Initialize both to avoid Thymeleaf crash
		model.addAttribute("attachedPlan", null);
		model.addAttribute("attachedProduct", null);

		// Then conditionally set
		if (reminder.getAttachedItemId() != null && reminder.getAttachedItemType() != null) {

			if ("plan".equalsIgnoreCase(reminder.getAttachedItemType())) {
				settingsPlanService.getById(reminder.getAttachedItemId())
						.ifPresent(plan -> model.addAttribute("attachedPlan", plan));
			}

			else if ("product".equalsIgnoreCase(reminder.getAttachedItemType())) {
				catalogProductService.getById(reminder.getAttachedItemId(), account.getId())
						.ifPresent(product -> model.addAttribute("attachedProduct", product));
			}
		}

		// 4. Safely handle Date Formatting to prevent crash if null
		if (reminder.getCreatedAt() != null) {
			model.addAttribute("createdAtFormatted",
					reminder.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")));
		} else {
			model.addAttribute("createdAtFormatted", "N/A");
		}

		return "remindmeui/reminder-detail-onetime";
	}

	@GetMapping("/greeting-detail.html")
	public String getGreetingDetail(@RequestParam("id") Integer id, Model model) {

		Account loggedIn = SecurityUtil.getCurrentAccountId();
		Account account = accountService.getById(loggedIn.getId());

		Optional<Greeting> greetingOpt = greetingService.getById(id, account.getId());

		if (greetingOpt.isEmpty()) {
			return "redirect:/engagement.html";
		}

		Greeting greeting = greetingOpt.get();

		Optional<Customer> customerOpt = customerService.getById(account.getId(), greeting.getCustomerId());

		model.addAttribute("account", account);
		model.addAttribute("greeting", greeting);
		model.addAttribute("customer", customerOpt.orElse(new Customer()));

		return "remindmeui/greeting-detail";
	}

	@GetMapping("/promo-landing.html")
	public String getPromoLanding(Model model) {
		Account loggedIn = SecurityUtil.getCurrentAccountId();

		Account account = accountService.getById(loggedIn.getId());

		model.addAttribute("account", account);
		return "remindmeui/promo-landing";
	}

	@GetMapping("/catalog.html")
	public String getCatalog(Model model) {

		Account loggedIn = SecurityUtil.getCurrentAccountId();

		Account account = accountService.getById(loggedIn.getId());

		model.addAttribute("account", account);

		List<CatalogPlan> plans = settingsPlanService.getByAccountId(account.getId());

		model.addAttribute("plans", plans);
		model.addAttribute("totalPlans", plans.size());
		model.addAttribute("activePlans", settingsPlanService.countActiveByAccountId(account.getId()));

		return "remindmeui/catalog";
	}

	@GetMapping("/engagement.html")
	public String engagement(Model model) {
		Account loggedIn = SecurityUtil.getCurrentAccountId();

		Account account = accountService.getById(loggedIn.getId());

		model.addAttribute("account", account);
		return "remindmeui/engagement";
	}

	@GetMapping("/user-management.html")
	public String users(Model model) {
		Account loggedIn = SecurityUtil.getCurrentAccountId();

		Account account = accountService.getById(loggedIn.getId());

		model.addAttribute("account", account);
		model.addAttribute("activePage", "users");
		return "remindmeui/user-management";
	}

	@GetMapping("/user-detail.html")
	public String userDetail(@RequestParam Integer id, Model model) {

		Integer accountId = SecurityUtil.getCurrentAccountId().getId();

		AdminUser user = adminUserService.getById(accountId, id)
				.orElseThrow(() -> new RuntimeException("User not found"));

		model.addAttribute("user", user);
		model.addAttribute("activePage", "users");

		return "remindmeui/user-detail";
	}

	@GetMapping("/appointments.html")
	public String getAppointmentsPage(Model model) {

		Account loggedIn = SecurityUtil.getCurrentAccountId();
		Account account = accountService.getById(loggedIn.getId());
		List<Customer> customers = customerService.getByAccountId(account.getId());

		Page<AdminUser> page = adminUserService.getByAccount(account.getId(), Pageable.unpaged());
		List<AdminUser> users = page.getContent();

		model.addAttribute("customers", customers);
		model.addAttribute("users", users);
		model.addAttribute("account", account);

		return "remindmeui/appointments";
	}

	@GetMapping("/appointment-detail.html")
	public String getAppointmentDetail(@RequestParam Long id, Model model) {

		Integer accountId = SecurityUtil.getCurrentAccountId().getId();

		Optional<Appointment> apptOpt = appointmentService.getById(id, accountId);

		if (apptOpt.isEmpty()) {
			return "redirect:/appointments.html";
		}

		Appointment appt = apptOpt.get();

		model.addAttribute("appointment", appt);

		model.addAttribute("customer", appt.getCustomer() != null ? appt.getCustomer() : new Customer());

		return "remindmeui/appointment-detail";
	}

	@GetMapping("/reports.html")
	public String getAdminReport(Model model) {
		Account loggedIn = SecurityUtil.getCurrentAccountId();

		Account account = accountService.getById(loggedIn.getId());

		model.addAttribute("account", account);
		return "remindme/reports";
	}

	@GetMapping("/create-report.html")
	public String createReportPage(Model model) {
		Account loggedIn = SecurityUtil.getCurrentAccountId();

		Account account = accountService.getById(loggedIn.getId());
		model.addAttribute("account", account);

		return "remindmeui/create-report";
	}

	@GetMapping("/report-history")
	public String reportHistory(Model model) {
		Account loggedIn = SecurityUtil.getCurrentAccountId();

		Account account = accountService.getById(loggedIn.getId());

		model.addAttribute("account", account);
		model.addAttribute("activePage", "reports");
		return "remindmeui/report-history";
	}

	@GetMapping("/view-report.html")
public String viewReportPage(@RequestParam Integer id, Model model) {

    // 1. Get logged-in account
    Integer accountId = SecurityUtil.getCurrentAccountId().getId();
    Account account = accountService.getById(accountId);

    // 2. Get report (DTO)
    ReportResponse report = reportService.getReportById(id);

    if (report == null) {
        return "redirect:/reports.html"; // safety fallback
    }

    

    // 4. Add all required data to UI
    model.addAttribute("account", account);
    model.addAttribute("report", report);
    

    return "remindmeui/report-detail";
}

	@GetMapping("/settings.html")
	public String getSettings(Model model) {
		Account loggedIn = SecurityUtil.getCurrentAccountId();

		Account account = accountService.getById(loggedIn.getId());

		List<CustomerGroup> groups = customerGroupService.getByAccountId(account.getId());

		model.addAttribute("account", account);
		model.addAttribute("groups", groups);
		model.addAttribute("activePage", "settings");
		return "remindmeui/settings";
	}

	@GetMapping("index.html")
	public String getIndexPage() {

		return "remindme/index.html";
	}

}