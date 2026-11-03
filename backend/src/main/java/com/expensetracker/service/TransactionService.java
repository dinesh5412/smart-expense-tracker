package com.expensetracker.service;

import com.expensetracker.dto.*;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.model.*;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final AuthService authService;

    public TransactionService(TransactionRepository transactionRepository,
                              BudgetRepository budgetRepository,
                              AuthService authService) {
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.authService = authService;
    }

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request) {
        User user = authService.getCurrentAuthenticatedUser();

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        mapRequestToEntity(request, transaction);

        if (transaction.isRecurring()) {
            transaction.setNextRecurringDate(calculateNextDate(transaction.getTransactionDate(), transaction.getRecurringFrequency()));
        }

        Transaction saved = transactionRepository.save(transaction);
        return TransactionResponse.fromEntity(saved);
    }

    @Transactional
    public TransactionResponse updateTransaction(Long id, TransactionRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You do not have permission to modify this transaction");
        }

        mapRequestToEntity(request, transaction);
        if (transaction.isRecurring()) {
            if (transaction.getNextRecurringDate() == null || transaction.getNextRecurringDate().isBefore(LocalDate.now())) {
                transaction.setNextRecurringDate(calculateNextDate(transaction.getTransactionDate(), transaction.getRecurringFrequency()));
            }
        } else {
            transaction.setNextRecurringDate(null);
        }

        Transaction updated = transactionRepository.save(transaction);
        return TransactionResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteTransaction(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You do not have permission to delete this transaction");
        }

        transactionRepository.delete(transaction);
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You do not have permission to view this transaction");
        }

        return TransactionResponse.fromEntity(transaction);
    }

    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> searchTransactions(
            TransactionType type,
            String category,
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            String keyword,
            int page,
            int size,
            String sortBy,
            String direction) {

        User user = authService.getCurrentAuthenticatedUser();

        Sort sort = Sort.by("asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC,
                sortBy != null ? sortBy : "transactionDate");
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), sort);

        Page<Transaction> transactionPage = transactionRepository.searchTransactions(
                user, type, category, startDate, endDate, minAmount, maxAmount, keyword, pageable
        );

        List<TransactionResponse> responseList = transactionPage.getContent().stream()
                .map(TransactionResponse::fromEntity)
                .collect(Collectors.toList());

        PageResponse<TransactionResponse> result = new PageResponse<>();
        result.setContent(responseList);
        result.setPageNumber(transactionPage.getNumber());
        result.setPageSize(transactionPage.getSize());
        result.setTotalElements(transactionPage.getTotalElements());
        result.setTotalPages(transactionPage.getTotalPages());
        result.setLast(transactionPage.isLast());

        return result;
    }

    @Transactional(readOnly = true)
    public SummaryStatsResponse getSummaryStats(String monthYear) {
        User user = authService.getCurrentAuthenticatedUser();

        LocalDate startDate = null;
        LocalDate endDate = null;

        if (monthYear != null && !monthYear.isBlank()) {
            YearMonth ym = YearMonth.parse(monthYear);
            startDate = ym.atDay(1);
            endDate = ym.atEndOfMonth();
        }

        BigDecimal income = transactionRepository.sumAmountByUserAndTypeAndDateRange(user, TransactionType.INCOME, startDate, endDate);
        BigDecimal expense = transactionRepository.sumAmountByUserAndTypeAndDateRange(user, TransactionType.EXPENSE, startDate, endDate);

        if (income == null) income = BigDecimal.ZERO;
        if (expense == null) expense = BigDecimal.ZERO;

        BigDecimal balance = income.subtract(expense);

        double savingsRate = 0.0;
        if (income.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = balance.divide(income, 4, RoundingMode.HALF_UP).doubleValue() * 100;
        }

        long activeBudgets = budgetRepository.countByUser(user);
        long totalTransactions = transactionRepository.countByUser(user);
        List<TransactionResponse> recent = transactionRepository.findTop5ByUserOrderByTransactionDateDescCreatedAtDesc(user)
                .stream()
                .map(TransactionResponse::fromEntity)
                .collect(Collectors.toList());

        SummaryStatsResponse response = new SummaryStatsResponse();
        response.setTotalBalance(balance);
        response.setTotalIncome(income);
        response.setTotalExpense(expense);
        response.setSavingsRate(Math.max(0, Math.round(savingsRate * 10.0) / 10.0));
        response.setActiveBudgetsCount(activeBudgets);
        response.setTotalTransactionsCount(totalTransactions);
        response.setRecentTransactions(recent);

        return response;
    }

    @Transactional(readOnly = true)
    public List<CategoryBreakdownDto> getCategoryAnalytics(String monthYear, TransactionType type) {
        User user = authService.getCurrentAuthenticatedUser();
        TransactionType targetType = type != null ? type : TransactionType.EXPENSE;

        LocalDate startDate = null;
        LocalDate endDate = null;
        if (monthYear != null && !monthYear.isBlank()) {
            YearMonth ym = YearMonth.parse(monthYear);
            startDate = ym.atDay(1);
            endDate = ym.atEndOfMonth();
        }

        List<TransactionRepository.CategorySumProjection> projections =
                transactionRepository.getCategoryBreakdown(user, targetType, startDate, endDate);

        BigDecimal grandTotal = projections.stream()
                .map(TransactionRepository.CategorySumProjection::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return projections.stream().map(p -> {
            double percentage = 0.0;
            if (grandTotal.compareTo(BigDecimal.ZERO) > 0) {
                percentage = p.getTotalAmount()
                        .divide(grandTotal, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
            }
            return new CategoryBreakdownDto(
                    p.getCategory(),
                    p.getTotalAmount(),
                    Math.round(percentage * 10.0) / 10.0,
                    p.getCount()
            );
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MonthlyTrendDto> getMonthlyTrendAnalytics(int monthsCount) {
        User user = authService.getCurrentAuthenticatedUser();
        int count = monthsCount <= 0 ? 6 : monthsCount;

        List<MonthlyTrendDto> result = new ArrayList<>();
        YearMonth current = YearMonth.now();
        DateTimeFormatter labelFormatter = DateTimeFormatter.ofPattern("MMM yyyy");

        for (int i = count - 1; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            LocalDate start = ym.atDay(1);
            LocalDate end = ym.atEndOfMonth();

            BigDecimal inc = transactionRepository.sumAmountByUserAndTypeAndDateRange(user, TransactionType.INCOME, start, end);
            BigDecimal exp = transactionRepository.sumAmountByUserAndTypeAndDateRange(user, TransactionType.EXPENSE, start, end);

            if (inc == null) inc = BigDecimal.ZERO;
            if (exp == null) exp = BigDecimal.ZERO;

            BigDecimal net = inc.subtract(exp);

            result.add(new MonthlyTrendDto(
                    ym.toString(),
                    ym.format(labelFormatter),
                    inc,
                    exp,
                    net
            ));
        }

        return result;
    }

    @Transactional
    public ApiResponse<Integer> processDueRecurringTransactions() {
        LocalDate today = LocalDate.now();
        List<Transaction> dueRecurring = transactionRepository.findByRecurringTrueAndNextRecurringDateLessThanEqual(today);

        int processed = 0;
        for (Transaction orig : dueRecurring) {
            // Create next instance
            Transaction newTx = new Transaction();
            newTx.setUser(orig.getUser());
            newTx.setTitle(orig.getTitle() + " (Auto)");
            newTx.setAmount(orig.getAmount());
            newTx.setType(orig.getType());
            newTx.setCategory(orig.getCategory());
            newTx.setTransactionDate(orig.getNextRecurringDate() != null ? orig.getNextRecurringDate() : today);
            newTx.setPaymentMethod(orig.getPaymentMethod());
            newTx.setNotes("Generated recurring transaction from #" + orig.getId());
            newTx.setRecurring(false);
            newTx.setRecurringFrequency(RecurringFrequency.NONE);
            transactionRepository.save(newTx);

            // Update parent next recurring date
            orig.setNextRecurringDate(calculateNextDate(orig.getNextRecurringDate() != null ? orig.getNextRecurringDate() : today, orig.getRecurringFrequency()));
            transactionRepository.save(orig);
            processed++;
        }

        return ApiResponse.ok("Processed " + processed + " recurring transactions", processed);
    }

    private void mapRequestToEntity(TransactionRequest request, Transaction transaction) {
        transaction.setTitle(request.getTitle().trim());
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setCategory(request.getCategory().trim());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod().trim() : "Cash");
        transaction.setNotes(request.getNotes() != null ? request.getNotes().trim() : "");
        transaction.setRecurring(request.isRecurring());
        transaction.setRecurringFrequency(request.isRecurring() ? request.getRecurringFrequency() : RecurringFrequency.NONE);
    }

    private LocalDate calculateNextDate(LocalDate fromDate, RecurringFrequency frequency) {
        if (fromDate == null) fromDate = LocalDate.now();
        if (frequency == null) return fromDate.plusMonths(1);
        return switch (frequency) {
            case DAILY -> fromDate.plusDays(1);
            case WEEKLY -> fromDate.plusWeeks(1);
            case MONTHLY -> fromDate.plusMonths(1);
            case YEARLY -> fromDate.plusYears(1);
            default -> fromDate.plusMonths(1);
        };
    }
}
