-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 24, 2025 at 05:44 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ikaze`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `startTime` datetime NOT NULL,
  `endTime` datetime NOT NULL,
  `description` text NOT NULL,
  `rpCollege` enum('RPTUMBA','RPKIGALI','RPKARONGI') NOT NULL,
  `department` enum('ADMISSIONS','ACADEMICS','FINANCE','REGISTRAR','GENERAL','OTHER') DEFAULT 'GENERAL',
  `status` enum('PENDING','CONFIRMED','CANCELLED') DEFAULT 'PENDING',
  `attachmentUrls` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachmentUrls`)),
  `deletedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  `guests` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`guests`)),
  `referenceNumber` varchar(255) DEFAULT NULL,
  `aptCode` varchar(255) DEFAULT NULL,
  `aptExpiresAt` datetime DEFAULT NULL,
  `checkedInAt` datetime DEFAULT NULL,
  `checkedInBy` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `type`, `startTime`, `endTime`, `description`, `rpCollege`, `department`, `status`, `attachmentUrls`, `deletedAt`, `createdAt`, `updatedAt`, `UserId`, `guests`, `referenceNumber`, `aptCode`, `aptExpiresAt`, `checkedInAt`, `checkedInBy`) VALUES
(1, 'Admission Inquiry', '2025-12-05 23:58:00', '2025-12-12 23:58:00', 'asdasdadasdas', 'RPKARONGI', 'GENERAL', 'PENDING', '[]', NULL, '2025-12-05 00:16:59', '2025-12-05 00:16:59', 6, '[{\"fullname\":\"Oscar\",\"id\":\"1200280005\"},{\"fullname\":\"Nziza\",\"id\":\"1200280005\"},{\"fullname\":\"John\",\"id\":\"1200280005\"}]', 'APT-25-000001', NULL, NULL, NULL, NULL),
(2, 'Admission Inquiry', '2025-12-06 04:25:00', '2025-12-25 00:27:00', 'Hy there now we are ready to go', 'RPTUMBA', 'GENERAL', 'PENDING', '[]', NULL, '2025-12-05 00:25:42', '2025-12-05 00:25:42', 6, '[{\"fullname\":\"emmanuel Niyonsaba\",\"id\":\"2345678\"},{\"fullname\":\"fkdfhsjkdfh\",\"id\":\"345678\"}]', 'APT-25-000002', NULL, NULL, NULL, NULL),
(3, 'Career Counseling', '2025-12-13 00:33:00', '2025-12-19 02:33:00', 'WERTYUIKL;', 'RPTUMBA', 'GENERAL', 'PENDING', '[]', NULL, '2025-12-05 00:34:06', '2025-12-05 00:34:07', 6, '[{\"fullname\":\"oscarbond\",\"id\":\"34567890\"},{\"fullname\":\"tryuiop\",\"id\":\"4567890\"}]', 'APT-25-000003', NULL, NULL, NULL, NULL),
(4, 'Career Counseling', '2025-12-06 00:39:00', '2025-12-27 00:39:00', 'sdfghjkl', 'RPTUMBA', 'FINANCE', 'PENDING', '[]', NULL, '2025-12-05 00:40:43', '2025-12-05 00:40:43', 6, '[{\"fullname\":\"dfghjkl\",\"id\":\"34567899\"}]', 'APT-25-000004', NULL, NULL, NULL, NULL),
(5, 'Career Counseling', '2025-12-10 00:42:00', '2025-12-26 00:42:00', 'asdfcgbn', 'RPKARONGI', 'ACADEMICS', 'PENDING', '[]', NULL, '2025-12-05 00:42:09', '2025-12-05 00:42:10', 6, '[{\"fullname\":\"dfghjkl\",\"id\":\"34567899\"}]', 'APT-25-000005', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rpCollege` enum('RPTUMBA','RPKIGALI','RPKARONGI') NOT NULL,
  `role` enum('USER','SECURITY','DEAN','ADMIN') NOT NULL DEFAULT 'USER',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `firstName`, `lastName`, `phone`, `email`, `password`, `rpCollege`, `role`, `createdAt`, `updatedAt`) VALUES
(2, 'Emmanuel1', 'Niyonsaba1', '0788888888', 'emmanuel1@example.com', '$2b$10$1AcU.9jNxs7oDOleoORZuuu2e.DZluOTx6lKtNj.9lEcKgiu6t8iO', 'RPKARONGI', 'USER', '2025-11-30 18:21:00', '2025-11-30 18:21:00'),
(3, 'Emmanuel', 'Niyonsaba', '0788888888', 'emmanuel@example.com', '$2b$10$1ix4hrPXaVcKkFVPMoM1SehqzqzIsDtResCtWZsKcwoJ.7WmO97xS', 'RPTUMBA', 'DEAN', '2025-11-30 18:21:29', '2025-11-30 18:21:29'),
(6, 'emmy12345', 'Niyonsaba', '0788888888', 'halland9@gmail.com', '$2b$10$B2kryY/EWwmVRY.XanmYV.mPNhPDI5sX9kwXNUKBeEAacKvlX4H.u', 'RPTUMBA', 'USER', '2025-11-30 18:33:29', '2025-11-30 18:33:29'),
(7, 'emmy12345', 'Niyonsaba', '0788888888', 'emmy@example.com', '$2b$10$vxeq.qzXv3nKBhUrlWEUUOH4cjhJpmiQLCcp5rGwSuRk8ivP8YEwq', 'RPTUMBA', 'ADMIN', '2025-11-30 18:34:53', '2025-11-30 18:34:53'),
(8, 'Test', 'User', '12345678', 'test3@example.com', '$2b$10$Gpv5BSy3w5x7Ut5Lxw6XeumURtTJHDSCjttHuZaH9lAxxU6I7u2a6', 'RPTUMBA', 'USER', '2025-12-22 20:25:52', '2025-12-22 20:25:52'),
(9, 'Akimana', 'ratifa', '0790231509', 'akimana@gmail.com', '$2b$10$HOT45buUq2/CwGwZZAuepuM7cu04DvVsygAPyzq9JmY.END17a5L2', 'RPTUMBA', 'ADMIN', '2025-12-22 20:46:39', '2025-12-22 20:46:39');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `aptCode` (`aptCode`),
  ADD UNIQUE KEY `aptCode_2` (`aptCode`),
  ADD UNIQUE KEY `aptCode_3` (`aptCode`),
  ADD UNIQUE KEY `aptCode_4` (`aptCode`),
  ADD UNIQUE KEY `aptCode_5` (`aptCode`),
  ADD UNIQUE KEY `aptCode_6` (`aptCode`),
  ADD UNIQUE KEY `aptCode_7` (`aptCode`),
  ADD UNIQUE KEY `aptCode_8` (`aptCode`),
  ADD UNIQUE KEY `aptCode_9` (`aptCode`),
  ADD UNIQUE KEY `aptCode_10` (`aptCode`),
  ADD UNIQUE KEY `aptCode_11` (`aptCode`),
  ADD UNIQUE KEY `aptCode_12` (`aptCode`),
  ADD UNIQUE KEY `aptCode_13` (`aptCode`),
  ADD UNIQUE KEY `aptCode_14` (`aptCode`),
  ADD UNIQUE KEY `aptCode_15` (`aptCode`),
  ADD UNIQUE KEY `aptCode_16` (`aptCode`),
  ADD UNIQUE KEY `aptCode_17` (`aptCode`),
  ADD UNIQUE KEY `aptCode_18` (`aptCode`),
  ADD UNIQUE KEY `aptCode_19` (`aptCode`),
  ADD UNIQUE KEY `aptCode_20` (`aptCode`),
  ADD UNIQUE KEY `aptCode_21` (`aptCode`),
  ADD UNIQUE KEY `aptCode_22` (`aptCode`),
  ADD UNIQUE KEY `aptCode_23` (`aptCode`),
  ADD UNIQUE KEY `aptCode_24` (`aptCode`),
  ADD UNIQUE KEY `aptCode_25` (`aptCode`),
  ADD UNIQUE KEY `aptCode_26` (`aptCode`),
  ADD UNIQUE KEY `aptCode_27` (`aptCode`),
  ADD UNIQUE KEY `aptCode_28` (`aptCode`),
  ADD UNIQUE KEY `aptCode_29` (`aptCode`),
  ADD UNIQUE KEY `aptCode_30` (`aptCode`),
  ADD UNIQUE KEY `aptCode_31` (`aptCode`),
  ADD UNIQUE KEY `aptCode_32` (`aptCode`),
  ADD UNIQUE KEY `aptCode_33` (`aptCode`),
  ADD UNIQUE KEY `aptCode_34` (`aptCode`),
  ADD UNIQUE KEY `aptCode_35` (`aptCode`),
  ADD UNIQUE KEY `aptCode_36` (`aptCode`),
  ADD UNIQUE KEY `aptCode_37` (`aptCode`),
  ADD UNIQUE KEY `aptCode_38` (`aptCode`),
  ADD UNIQUE KEY `aptCode_39` (`aptCode`),
  ADD UNIQUE KEY `aptCode_40` (`aptCode`),
  ADD UNIQUE KEY `aptCode_41` (`aptCode`),
  ADD UNIQUE KEY `aptCode_42` (`aptCode`),
  ADD UNIQUE KEY `aptCode_43` (`aptCode`),
  ADD UNIQUE KEY `aptCode_44` (`aptCode`),
  ADD UNIQUE KEY `aptCode_45` (`aptCode`),
  ADD UNIQUE KEY `aptCode_46` (`aptCode`),
  ADD UNIQUE KEY `aptCode_47` (`aptCode`),
  ADD KEY `appointments_status` (`status`),
  ADD KEY `appointments_start_time` (`startTime`),
  ADD KEY `appointments_rp_college` (`rpCollege`),
  ADD KEY `appointments_rp_college_status` (`rpCollege`,`status`),
  ADD KEY `appointments_start_time_status` (`startTime`,`status`),
  ADD KEY `UserId` (`UserId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD UNIQUE KEY `email_26` (`email`),
  ADD UNIQUE KEY `email_27` (`email`),
  ADD UNIQUE KEY `email_28` (`email`),
  ADD UNIQUE KEY `email_29` (`email`),
  ADD UNIQUE KEY `email_30` (`email`),
  ADD UNIQUE KEY `email_31` (`email`),
  ADD UNIQUE KEY `email_32` (`email`),
  ADD UNIQUE KEY `email_33` (`email`),
  ADD UNIQUE KEY `email_34` (`email`),
  ADD UNIQUE KEY `email_35` (`email`),
  ADD UNIQUE KEY `email_36` (`email`),
  ADD UNIQUE KEY `email_37` (`email`),
  ADD UNIQUE KEY `email_38` (`email`),
  ADD UNIQUE KEY `email_39` (`email`),
  ADD UNIQUE KEY `email_40` (`email`),
  ADD UNIQUE KEY `email_41` (`email`),
  ADD UNIQUE KEY `email_42` (`email`),
  ADD UNIQUE KEY `email_43` (`email`),
  ADD UNIQUE KEY `email_44` (`email`),
  ADD UNIQUE KEY `email_45` (`email`),
  ADD UNIQUE KEY `email_46` (`email`),
  ADD UNIQUE KEY `email_47` (`email`),
  ADD UNIQUE KEY `email_48` (`email`),
  ADD UNIQUE KEY `email_49` (`email`),
  ADD UNIQUE KEY `email_50` (`email`),
  ADD UNIQUE KEY `email_51` (`email`),
  ADD UNIQUE KEY `email_52` (`email`),
  ADD UNIQUE KEY `email_53` (`email`),
  ADD UNIQUE KEY `email_54` (`email`),
  ADD UNIQUE KEY `email_55` (`email`),
  ADD UNIQUE KEY `email_56` (`email`),
  ADD UNIQUE KEY `email_57` (`email`),
  ADD UNIQUE KEY `email_58` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_10` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_100` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_101` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_102` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_103` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_104` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_105` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_106` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_107` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_108` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_109` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_11` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_110` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_111` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_112` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_113` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_114` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_115` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_12` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_13` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_14` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_15` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_16` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_17` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_18` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_19` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_20` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_21` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_22` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_23` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_24` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_25` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_26` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_27` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_28` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_29` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_30` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_31` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_32` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_33` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_34` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_35` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_36` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_37` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_38` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_39` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_4` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_40` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_41` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_42` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_43` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_44` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_45` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_46` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_47` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_48` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_49` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_50` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_51` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_52` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_53` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_54` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_55` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_56` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_57` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_58` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_59` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_6` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_60` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_61` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_62` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_63` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_64` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_65` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_66` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_67` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_68` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_69` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_7` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_70` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_71` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_72` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_73` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_74` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_75` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_76` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_77` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_78` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_79` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_8` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_80` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_81` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_82` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_83` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_84` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_85` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_86` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_87` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_88` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_89` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_9` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_90` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_91` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_92` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_93` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_94` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_95` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_96` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_97` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_98` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_99` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
