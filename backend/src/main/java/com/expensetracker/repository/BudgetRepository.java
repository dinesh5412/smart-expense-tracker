package com.expensetracker.repository;

import com.expensetracker.model.Budget;
import com.expensetracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserAndMonthYear(User user, String monthYear);
    Optional<Budget> findByUserAndCategoryAndMonthYear(User user, String category, String monthYear);
    List<Budget> findByUser(User user);
    boolean existsByUserAndCategoryAndMonthYear(User user, String category, String monthYear);
    long countByUser(User user);
}
