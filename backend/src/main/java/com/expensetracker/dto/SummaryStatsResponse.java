package com.expensetracker.dto;

import java.math.BigDecimal;
import java.util.List;

public class SummaryStatsResponse {
    private BigDecimal totalBalance;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private double savingsRate;
    private long activeBudgetsCount;
    private long totalTransactionsCount;
    private List<TransactionResponse> recentTransactions;

    public SummaryStatsResponse() {}

    public BigDecimal getTotalBalance() {
        return totalBalance;
    }

    public void setTotalBalance(BigDecimal totalBalance) {
        this.totalBalance = totalBalance;
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getTotalExpense() {
        return totalExpense;
    }

    public void setTotalExpense(BigDecimal totalExpense) {
        this.totalExpense = totalExpense;
    }

    public double getSavingsRate() {
        return savingsRate;
    }

    public void setSavingsRate(double savingsRate) {
        this.savingsRate = savingsRate;
    }

    public long getActiveBudgetsCount() {
        return activeBudgetsCount;
    }

    public void setActiveBudgetsCount(long activeBudgetsCount) {
        this.activeBudgetsCount = activeBudgetsCount;
    }

    public long getTotalTransactionsCount() {
        return totalTransactionsCount;
    }

    public void setTotalTransactionsCount(long totalTransactionsCount) {
        this.totalTransactionsCount = totalTransactionsCount;
    }

    public List<TransactionResponse> getRecentTransactions() {
        return recentTransactions;
    }

    public void setRecentTransactions(List<TransactionResponse> recentTransactions) {
        this.recentTransactions = recentTransactions;
    }
}
