package com.expensetracker.config;

import com.expensetracker.model.*;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.TransactionRepository;
import com.expensetracker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           TransactionRepository transactionRepository,
                           BudgetRepository budgetRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        logger.info("Initializing demo data and default accounts...");

        // 1. Seed Admin
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@expensetracker.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ROLE_ADMIN);
        admin.setEmailVerified(true);
        userRepository.save(admin);

        // 2. Seed Demo User
        User demoUser = new User();
        demoUser.setUsername("john_doe");
        demoUser.setEmail("user@expensetracker.com");
        demoUser.setPassword(passwordEncoder.encode("user123"));
        demoUser.setRole(Role.ROLE_USER);
        demoUser.setEmailVerified(true);
        userRepository.save(demoUser);

        // Current and past month dates
        LocalDate today = LocalDate.now();
        String currentMonthYear = YearMonth.now().toString();

        // 3. Seed Budgets for Demo User (in INR ₹)
        budgetRepository.save(new Budget(demoUser, "Housing", new BigDecimal("25000.00"), currentMonthYear, 90));
        budgetRepository.save(new Budget(demoUser, "Groceries", new BigDecimal("12000.00"), currentMonthYear, 80));
        budgetRepository.save(new Budget(demoUser, "Food & Dining", new BigDecimal("6000.00"), currentMonthYear, 75));
        budgetRepository.save(new Budget(demoUser, "Utilities", new BigDecimal("4000.00"), currentMonthYear, 80));
        budgetRepository.save(new Budget(demoUser, "Entertainment", new BigDecimal("3500.00"), currentMonthYear, 85));
        budgetRepository.save(new Budget(demoUser, "Transportation", new BigDecimal("5000.00"), currentMonthYear, 80));

        // 4. Seed Transactions for Demo User (in INR ₹)
        createTx(demoUser, "Monthly Salary", new BigDecimal("85000.00"), TransactionType.INCOME, "Salary", today.withDayOfMonth(1), "Bank Transfer", "Monthly tech salary credited", true, RecurringFrequency.MONTHLY, today.plusMonths(1).withDayOfMonth(1));
        createTx(demoUser, "Freelance Web Project", new BigDecimal("15000.00"), TransactionType.INCOME, "Freelance", today.minusDays(5), "UPI", "Client milestone payment via UPI", false, RecurringFrequency.NONE, null);
        createTx(demoUser, "Apartment Rent", new BigDecimal("22000.00"), TransactionType.EXPENSE, "Housing", today.withDayOfMonth(2), "Bank Transfer", "Monthly flat rent", true, RecurringFrequency.MONTHLY, today.plusMonths(1).withDayOfMonth(2));
        createTx(demoUser, "Supermarket Groceries", new BigDecimal("3850.00"), TransactionType.EXPENSE, "Groceries", today.minusDays(3), "Credit Card", "Monthly groceries restock", false, RecurringFrequency.NONE, null);
        createTx(demoUser, "Fresh Produce & Milk", new BigDecimal("1250.00"), TransactionType.EXPENSE, "Groceries", today.minusDays(8), "UPI", "Weekly fruits and vegetables", false, RecurringFrequency.NONE, null);
        createTx(demoUser, "Family Dinner at Restaurant", new BigDecimal("2100.00"), TransactionType.EXPENSE, "Food & Dining", today.minusDays(2), "Credit Card", "Dinner with family", false, RecurringFrequency.NONE, null);
        createTx(demoUser, "High-Speed Fiber WiFi", new BigDecimal("999.00"), TransactionType.EXPENSE, "Utilities", today.minusDays(10), "UPI", "Monthly fiber broadband", true, RecurringFrequency.MONTHLY, today.plusMonths(1).minusDays(10));
        createTx(demoUser, "Electricity Bill", new BigDecimal("1850.00"), TransactionType.EXPENSE, "Utilities", today.minusDays(6), "Debit Card", "State electricity board bill", false, RecurringFrequency.NONE, null);
        createTx(demoUser, "OTT Subscriptions Bundle", new BigDecimal("649.00"), TransactionType.EXPENSE, "Entertainment", today.minusDays(12), "Credit Card", "Netflix & Hotstar subscription", true, RecurringFrequency.MONTHLY, today.plusMonths(1).minusDays(12));
        createTx(demoUser, "Petrol Fuel Station", new BigDecimal("1500.00"), TransactionType.EXPENSE, "Transportation", today.minusDays(4), "UPI", "Vehicle petrol refill", false, RecurringFrequency.NONE, null);
        createTx(demoUser, "Weekend Movie Tickets", new BigDecimal("750.00"), TransactionType.EXPENSE, "Entertainment", today.minusDays(7), "Credit Card", "Cinema tickets & snacks", false, RecurringFrequency.NONE, null);

        // Previous month transactions for trend chart demo
        LocalDate lastMonth = today.minusMonths(1);
        createTx(demoUser, "Previous Month Salary", new BigDecimal("85000.00"), TransactionType.INCOME, "Salary", lastMonth.withDayOfMonth(1), "Bank Transfer", "Salary", false, RecurringFrequency.NONE, null);
        createTx(demoUser, "Previous Month Rent", new BigDecimal("22000.00"), TransactionType.EXPENSE, "Housing", lastMonth.withDayOfMonth(2), "Bank Transfer", "Rent", false, RecurringFrequency.NONE, null);
        createTx(demoUser, "Monthly Groceries", new BigDecimal("7500.00"), TransactionType.EXPENSE, "Groceries", lastMonth.withDayOfMonth(15), "Credit Card", "Groceries", false, RecurringFrequency.NONE, null);
        createTx(demoUser, "Dining & Swiggy", new BigDecimal("3800.00"), TransactionType.EXPENSE, "Food & Dining", lastMonth.withDayOfMonth(18), "UPI", "Weekend food delivery", false, RecurringFrequency.NONE, null);

        logger.info("Demo data initialized successfully!");
        logger.info("Admin login: admin@expensetracker.com / admin123");
        logger.info("User login:  user@expensetracker.com  / user123");
    }

    private void createTx(User user, String title, BigDecimal amount, TransactionType type,
                          String category, LocalDate date, String paymentMethod, String notes,
                          boolean recurring, RecurringFrequency freq, LocalDate nextDate) {
        Transaction t = new Transaction();
        t.setUser(user);
        t.setTitle(title);
        t.setAmount(amount);
        t.setType(type);
        t.setCategory(category);
        t.setTransactionDate(date);
        t.setPaymentMethod(paymentMethod);
        t.setNotes(notes);
        t.setRecurring(recurring);
        t.setRecurringFrequency(freq);
        t.setNextRecurringDate(nextDate);
        transactionRepository.save(t);
    }
}
