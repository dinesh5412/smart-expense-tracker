-- Smart Expense & Budget Tracker Database Schema
CREATE DATABASE IF NOT EXISTS expense_tracker_db;
USE expense_tracker_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token VARCHAR(100),
    password_reset_token VARCHAR(100),
    password_reset_expires_at DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME
);

-- 2. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    type VARCHAR(20) NOT NULL,
    category VARCHAR(60) NOT NULL,
    transaction_date DATE NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Cash',
    notes VARCHAR(500),
    recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurring_frequency VARCHAR(20) DEFAULT 'NONE',
    next_recurring_date DATE,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category VARCHAR(60) NOT NULL,
    monthly_limit DECIMAL(12, 2) NOT NULL,
    month_year VARCHAR(7) NOT NULL,
    alert_threshold INT NOT NULL DEFAULT 80,
    created_at DATETIME NOT NULL,
    UNIQUE KEY uk_user_category_month (user_id, category, month_year),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for fast searching & filtering
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_budgets_user_month ON budgets(user_id, month_year);
