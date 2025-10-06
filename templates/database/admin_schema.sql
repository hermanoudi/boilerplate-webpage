-- {{COMPANY_NAME}} Admin Users Schema
-- Tabela de usuários administrativos

USE `{{DB_NAME}}`;

-- Drop table if exists
DROP TABLE IF EXISTS `admin_users`;

-- Admin users table
CREATE TABLE `admin_users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100),
    `is_active` BOOLEAN DEFAULT TRUE,
    `last_login` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_username` (`username`),
    INDEX `idx_email` (`email`),
    INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (username: admin, password: admin123)
-- Senha hash gerado com PASSWORD_DEFAULT do PHP
INSERT INTO `admin_users` (`username`, `email`, `password_hash`, `full_name`, `is_active`) VALUES
('admin', 'admin@llmagazine.com', '$2y$10$KruCAPPgX8uBZERut0NF0uCggeZgJGGeUEgPOOijVm57A3Ee/kt.O', 'Administrador', TRUE);

-- Nota: A senha padrão é 'admin123' - ALTERE após o primeiro login!
