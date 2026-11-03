package com.expensetracker.service;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.PageResponse;
import com.expensetracker.dto.UserDto;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.model.User;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.TransactionRepository;
import com.expensetracker.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;

    public AdminService(UserRepository userRepository,
                        TransactionRepository transactionRepository,
                        BudgetRepository budgetRepository) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<UserDto> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by("id").descending());
        Page<User> userPage = userRepository.findAll(pageable);

        List<UserDto> dtos = userPage.getContent().stream()
                .map(u -> new UserDto(u.getId(), u.getUsername(), u.getEmail(), u.getRole(), u.isEmailVerified(), u.getCreatedAt()))
                .collect(Collectors.toList());

        PageResponse<UserDto> response = new PageResponse<>();
        response.setContent(dtos);
        response.setPageNumber(userPage.getNumber());
        response.setPageSize(userPage.getSize());
        response.setTotalElements(userPage.getTotalElements());
        response.setTotalPages(userPage.getTotalPages());
        response.setLast(userPage.isLast());

        return response;
    }

    @Transactional
    public ApiResponse<UserDto> toggleUserEmailVerification(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setEmailVerified(!user.isEmailVerified());
        User saved = userRepository.save(user);

        UserDto dto = new UserDto(saved.getId(), saved.getUsername(), saved.getEmail(), saved.getRole(), saved.isEmailVerified(), saved.getCreatedAt());
        return ApiResponse.ok("User email verification status updated to " + saved.isEmailVerified(), dto);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getGlobalStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalTransactions", transactionRepository.count());
        stats.put("totalBudgets", budgetRepository.count());
        return stats;
    }
}
