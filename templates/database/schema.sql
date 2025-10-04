-- {{COMPANY_NAME}} Database Schema
-- MySQL Database Schema for Virtual Storefront

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `{{DB_NAME}}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `{{DB_NAME}}`;

-- Drop tables if they exist
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;

-- Categories table
CREATE TABLE `categories` (
    `id` VARCHAR(50) PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `icon` VARCHAR(100) NOT NULL,
    `display_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products table
CREATE TABLE `products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `price` VARCHAR(20) NOT NULL,
    `original_price` VARCHAR(20) DEFAULT NULL,
    `discount` INT DEFAULT NULL,
    `image` VARCHAR(500) NOT NULL,
    `description` TEXT,
    `colors` JSON DEFAULT NULL,
    `sizes` JSON DEFAULT NULL,
    `in_stock` BOOLEAN DEFAULT TRUE,
    `featured` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`category`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
    INDEX `idx_category` (`category`),
    INDEX `idx_in_stock` (`in_stock`),
    INDEX `idx_featured` (`featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
