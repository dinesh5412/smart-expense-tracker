package com.expensetracker.dto;

import com.expensetracker.model.RecurringFrequency;
import com.expensetracker.model.Transaction;
import com.expensetracker.model.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TransactionResponse {
    private Long id;
    private String title;
    private BigDecimal amount;
    private TransactionType type;
    private String category;
    private LocalDate transactionDate;
    private String paymentMethod;
    private String notes;
    private boolean recurring;
    private RecurringFrequency recurringFrequency;
    private LocalDate nextRecurringDate;
    private LocalDateTime createdAt;

    public TransactionResponse() {}

    public static TransactionResponse fromEntity(Transaction t) {
        TransactionResponse r = new TransactionResponse();
        r.setId(t.getId());
        r.setTitle(t.getTitle());
        r.setAmount(t.getAmount());
        r.setType(t.getType());
        r.setCategory(t.getCategory());
        r.setTransactionDate(t.getTransactionDate());
        r.setPaymentMethod(t.getPaymentMethod());
        r.setNotes(t.getNotes());
        r.setRecurring(t.isRecurring());
        r.setRecurringFrequency(t.getRecurringFrequency());
        r.setNextRecurringDate(t.getNextRecurringDate());
        r.setCreatedAt(t.getCreatedAt());
        return r;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDate getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDate transactionDate) {
        this.transactionDate = transactionDate;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public boolean isRecurring() {
        return recurring;
    }

    public void setRecurring(boolean recurring) {
        this.recurring = recurring;
    }

    public RecurringFrequency getRecurringFrequency() {
        return recurringFrequency;
    }

    public void setRecurringFrequency(RecurringFrequency recurringFrequency) {
        this.recurringFrequency = recurringFrequency;
    }

    public LocalDate getNextRecurringDate() {
        return nextRecurringDate;
    }

    public void setNextRecurringDate(LocalDate nextRecurringDate) {
        this.nextRecurringDate = nextRecurringDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
