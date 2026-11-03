package com.expensetracker.service;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.BudgetRequest;
import com.expensetracker.dto.BudgetResponse;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.model.Budget;
import com.expensetracker.model.User;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final AuthService authService;

    public BudgetService(BudgetRepository budgetRepository,
                         TransactionRepository transactionRepository,
                         AuthService authService) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
        this.authService = authService;
    }

    @Transactional
    public BudgetResponse saveBudget(BudgetRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        String category = request.getCategory().trim();
        String monthYear = request.getMonthYear().trim();

        Optional<Budget> existingOpt = budgetRepository.findByUserAndCategoryAndMonthYear(user, category, monthYear);
        Budget budget = existingOpt.orElseGet(Budget::new);

        budget.setUser(user);
        budget.setCategory(category);
        budget.setMonthlyLimit(request.getMonthlyLimit());
        budget.setMonthYear(monthYear);
        budget.setAlertThreshold(request.getAlertThreshold() != null ? request.getAlertThreshold() : 80);

        Budget saved = budgetRepository.save(budget);
        return mapToResponse(saved, user);
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgetsForMonth(String monthYear) {
        User user = authService.getCurrentAuthenticatedUser();
        String targetMonthYear = (monthYear != null && !monthYear.isBlank()) ? monthYear : YearMonth.now().toString();

        List<Budget> budgets = budgetRepository.findByUserAndMonthYear(user, targetMonthYear);
        List<BudgetResponse> responses = new ArrayList<>();

        for (Budget b : budgets) {
            responses.add(mapToResponse(b, user));
        }

        return responses;
    }

    @Transactional
    public ApiResponse<Void> deleteBudget(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));

        if (!budget.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You do not have permission to delete this budget");
        }

        budgetRepository.delete(budget);
        return ApiResponse.ok("Budget deleted successfully");
    }

    private BudgetResponse mapToResponse(Budget budget, User user) {
        YearMonth ym = YearMonth.parse(budget.getMonthYear());
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        BigDecimal spent = transactionRepository.sumCategoryExpenseInDateRange(
                user, budget.getCategory(), startDate, endDate
        );
        if (spent == null) spent = BigDecimal.ZERO;

        BigDecimal remaining = budget.getMonthlyLimit().subtract(spent);

        double percentage = 0.0;
        if (budget.getMonthlyLimit().compareTo(BigDecimal.ZERO) > 0) {
            percentage = spent.divide(budget.getMonthlyLimit(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        String status = "OK";
        int threshold = budget.getAlertThreshold() != null ? budget.getAlertThreshold() : 80;

        if (percentage >= 100.0) {
            status = "EXCEEDED";
        } else if (percentage >= threshold) {
            status = "WARNING";
        }

        BudgetResponse resp = new BudgetResponse();
        resp.setId(budget.getId());
        resp.setCategory(budget.getCategory());
        resp.setMonthlyLimit(budget.getMonthlyLimit());
        resp.setMonthYear(budget.getMonthYear());
        resp.setAlertThreshold(threshold);
        resp.setSpentAmount(spent);
        resp.setRemainingAmount(remaining);
        resp.setPercentageUsed(Math.round(percentage * 10.0) / 10.0);
        resp.setStatus(status);

        return resp;
    }
}
