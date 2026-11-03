package com.expensetracker.controller;

import com.expensetracker.dto.*;
import com.expensetracker.model.TransactionType;
import com.expensetracker.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(@Valid @RequestBody TransactionRequest request) {
        TransactionResponse response = transactionService.createTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<PageResponse<TransactionResponse>> getTransactions(
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        PageResponse<TransactionResponse> result = transactionService.searchTransactions(
                type, category, startDate, endDate, minAmount, maxAmount, keyword, page, size, sortBy, direction
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransactionById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getTransactionById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.ok(ApiResponse.ok("Transaction deleted successfully"));
    }

    @GetMapping("/summary")
    public ResponseEntity<SummaryStatsResponse> getSummaryStats(@RequestParam(required = false) String monthYear) {
        return ResponseEntity.ok(transactionService.getSummaryStats(monthYear));
    }

    @GetMapping("/category-analytics")
    public ResponseEntity<List<CategoryBreakdownDto>> getCategoryAnalytics(
            @RequestParam(required = false) String monthYear,
            @RequestParam(required = false) TransactionType type) {
        return ResponseEntity.ok(transactionService.getCategoryAnalytics(monthYear, type));
    }

    @GetMapping("/monthly-trend")
    public ResponseEntity<List<MonthlyTrendDto>> getMonthlyTrend(@RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(transactionService.getMonthlyTrendAnalytics(months));
    }

    @PostMapping("/process-recurring")
    public ResponseEntity<ApiResponse<Integer>> processRecurringTransactions() {
        return ResponseEntity.ok(transactionService.processDueRecurringTransactions());
    }
}
