-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Sep 16, 2026 at 03:48 AM
-- Server version: 8.4.11-0ubuntu0.26.04.1
-- PHP Version: 8.1.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dbsurvasi`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` bigint NOT NULL,
  `user_id` int DEFAULT NULL COMMENT 'FK ke users.id — NULL jika aksi sistem otomatis',
  `aksi` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Jenis aksi: login, logout, create, update, delete, export, import, reminder_sent',
  `target_tabel` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama tabel yang dimodifikasi (e.g. satuan_pendidikan, responden_survey)',
  `target_id` int DEFAULT NULL COMMENT 'ID record yang dimodifikasi',
  `detail` json DEFAULT NULL COMMENT 'Detail perubahan: { "field": "status", "old": "belum", "new": "sudah" }',
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IPv4/IPv6 address sumber aksi',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit trail semua aktivitas pengguna — untuk keamanan dan traceability';

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`id`, `user_id`, `aksi`, `target_tabel`, `target_id`, `detail`, `ip_address`, `created_at`) VALUES
(1, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36\"}', '::1', '2026-09-10 06:01:26'),
(2, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"node\"}', '::ffff:127.0.0.1', '2026-09-10 06:01:31'),
(3, NULL, 'login', NULL, NULL, '{\"email\": \"20539940@survasi.com\", \"user_agent\": \"node\"}', '::ffff:127.0.0.1', '2026-09-10 06:01:40'),
(4, 2, 'login', NULL, NULL, '{\"email\": \"pengawas@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36\"}', '::1', '2026-09-10 06:51:16'),
(5, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36\"}', '::1', '2026-09-10 06:51:42'),
(6, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36\"}', '::1', '2026-09-10 07:16:37'),
(7, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36\"}', '::1', '2026-09-10 07:22:41'),
(8, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36\"}', '::1', '2026-09-10 07:22:47'),
(9, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36\"}', '::1', '2026-09-10 07:35:27'),
(10, 2, 'login', NULL, NULL, '{\"email\": \"pengawas@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36\"}', '::1', '2026-09-10 07:51:35'),
(11, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 07:56:33'),
(12, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 18:40:09'),
(13, NULL, 'login', NULL, NULL, '{\"email\": \"testing@gmail.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 18:52:54'),
(14, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 18:53:19'),
(15, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"node\"}', '::ffff:127.0.0.1', '2026-09-11 19:00:29'),
(16, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"node\"}', '::ffff:127.0.0.1', '2026-09-11 19:00:38'),
(17, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"node\"}', '::ffff:127.0.0.1', '2026-09-11 19:00:48'),
(18, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"node\"}', '::ffff:127.0.0.1', '2026-09-11 19:00:55'),
(19, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"node\"}', '::ffff:127.0.0.1', '2026-09-11 19:01:00'),
(20, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"node\"}', '::ffff:127.0.0.1', '2026-09-11 19:01:04'),
(21, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"node\"}', '::ffff:127.0.0.1', '2026-09-11 19:01:10'),
(22, 2, 'login', NULL, NULL, '{\"email\": \"pengawas@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 19:06:21'),
(23, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 19:10:49'),
(24, 2, 'login', NULL, NULL, '{\"email\": \"pengawas@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 19:12:12'),
(25, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 19:13:15'),
(26, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 19:16:29'),
(27, NULL, 'login', NULL, NULL, '{\"email\": \"testing@gmail.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 19:16:38'),
(28, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 19:18:21'),
(29, 2, 'login', NULL, NULL, '{\"email\": \"pengawas@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 19:35:14'),
(30, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 19:48:51'),
(31, 2, 'login', NULL, NULL, '{\"email\": \"pengawas@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 19:54:51'),
(32, 2, 'login', NULL, NULL, '{\"email\": \"pengawas@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 19:55:17'),
(33, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 19:56:46'),
(34, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 20:01:23'),
(35, 2, 'login', NULL, NULL, '{\"email\": \"pengawas@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 20:04:58'),
(36, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 20:07:08'),
(37, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1\"}', '::1', '2026-09-11 20:21:59'),
(38, NULL, 'login', NULL, NULL, '{\"email\": \"contoh@sekolah.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 20:31:34'),
(39, NULL, 'login', NULL, NULL, '{\"email\": \"contoh@sekolah.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 20:33:57'),
(40, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 20:34:12'),
(41, NULL, 'login', NULL, NULL, '{\"email\": \"contoh@sekolah.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 20:41:27'),
(42, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-11 20:43:04'),
(43, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-12 07:48:33'),
(44, 2, 'login', NULL, NULL, '{\"email\": \"pengawas@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-12 08:35:10'),
(45, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-12 08:36:33'),
(46, 2, 'login', NULL, NULL, '{\"email\": \"pengawas@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-12 09:00:10'),
(47, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-12 09:00:23'),
(48, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-12 09:54:15'),
(49, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-12 09:54:55'),
(50, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-12 10:04:00'),
(51, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-12 10:11:03'),
(52, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-12 10:45:29'),
(53, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-12 10:45:34'),
(54, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-12 10:46:05'),
(55, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-12 10:47:46'),
(56, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-13 09:07:38'),
(57, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-13 09:14:04'),
(58, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6 Mobile/15E148 Safari/604.1\"}', '::1', '2026-09-13 09:46:39'),
(59, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (iPhone; CPU iPhone OS 18_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.7 Mobile/15E148 Safari/604.1\"}', '::1', '2026-09-14 06:56:01'),
(60, 1255, 'login', NULL, NULL, '{\"email\": \"udinsaif@gmail.com\", \"user_agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0\"}', '::1', '2026-09-14 10:58:35'),
(61, 1255, 'login', NULL, NULL, '{\"email\": \"udinsaif@gmail.com\", \"user_agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0\"}', '::1', '2026-09-15 07:05:15'),
(62, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0\"}', '::1', '2026-09-15 07:48:49'),
(63, 1255, 'login', NULL, NULL, '{\"email\": \"udinsaif@gmail.com\", \"user_agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0\"}', '::1', '2026-09-15 17:05:12'),
(64, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0\"}', '::1', '2026-09-15 17:20:36'),
(65, 1254, 'login', NULL, NULL, '{\"email\": \"marifirfannn@gmail.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-16 00:11:19'),
(66, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-16 00:11:34'),
(67, 1254, 'login', NULL, NULL, '{\"email\": \"marifirfannn@gmail.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-16 00:48:45'),
(68, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-16 01:26:36'),
(69, 2, 'login', NULL, NULL, '{\"email\": \"pengawas@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-16 01:42:12'),
(70, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-16 01:44:06'),
(71, 2, 'login', NULL, NULL, '{\"email\": \"pengawas@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-16 01:45:16'),
(72, 1, 'login', NULL, NULL, '{\"email\": \"admin@survasi.com\", \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36\"}', '::1', '2026-09-16 01:45:53');

-- --------------------------------------------------------

--
-- Table structure for table `alur_tema`
--

CREATE TABLE `alur_tema` (
  `id` int NOT NULL,
  `modul_id` int NOT NULL COMMENT 'FK ke modul_bsan.id',
  `nama_alur` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama alur: Alur 1, Alur 2, Alur 3',
  `nama_tema` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama tema: Tema 1: Tubuhku Istimewa, dst',
  `target_kelas` enum('kelas_awal','kelas_tinggi','semua') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'semua' COMMENT 'Target kelas implementasi modul',
  `urutan` int NOT NULL DEFAULT '0' COMMENT 'Urutan tema dalam alur',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Alur dan tema pembelajaran per modul BSAN — digunakan di Kuisioner dan Proporsi Modul';

-- --------------------------------------------------------

--
-- Table structure for table `bsan_frameworks`
--

CREATE TABLE `bsan_frameworks` (
  `id` int NOT NULL,
  `framework_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtitle_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deskripsi` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `warna` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '#4A57C4',
  `ikon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'brain',
  `urutan` int DEFAULT '1',
  `is_active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bsan_frameworks`
--

INSERT INTO `bsan_frameworks` (`id`, `framework_key`, `nama`, `nama_id`, `subtitle`, `subtitle_id`, `deskripsi`, `warna`, `ikon`, `urutan`, `is_active`, `created_at`) VALUES
(1, 'with_myself', 'With Myself', 'Dengan Diriku', 'Social-Emotional Learning • CASEL Framework', 'Kesadaran Diri, Literasi & Numerasi Dasar', 'Fokus pada pengembangan pondasi literasi, numerasi dasar, keaktifan KBM, dan pengenalan emosi diri murid.', '#4A57C4', 'brain', 1, 1, '2026-09-12 08:29:11'),
(2, 'with_others', 'With Others', 'Dengan Orang Lain', 'Social-Emotional Learning • CASEL Framework', 'Disiplin Positif & Kemitraan Orang Tua', 'Fokus pada budaya anti-perundungan, kesepakatan kelas, serta kolaborasi paguyuban orang tua dan komite.', '#10B981', 'users', 2, 1, '2026-09-12 08:29:11'),
(3, 'with_challenges', 'With Our Challenges', 'Dengan Tantangan Kita', 'Social-Emotional Learning • CASEL Framework', 'Pengelolaan Stres, Emosi & Lingkungan Aman', 'Fokus pada refleksi emosi, kesehatan mental guru-murid, kebersihan fasilitas sanitasi, dan iklim sekolah aman.', '#F59E0B', 'target', 3, 1, '2026-09-12 08:29:11');

-- --------------------------------------------------------

--
-- Table structure for table `jawaban_survey`
--

CREATE TABLE `jawaban_survey` (
  `id` bigint NOT NULL,
  `responden_id` int NOT NULL COMMENT 'FK ke responden_survey.id',
  `pertanyaan_id` int NOT NULL COMMENT 'FK ke pertanyaan_survey.id',
  `jawaban_terstruktur` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Jawaban pilihan tunggal (dropdown/radio)',
  `jawaban_bebas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Jawaban teks bebas/narasi (refleksi, temuan, tantangan)',
  `jawaban_multi` json DEFAULT NULL COMMENT 'Jawaban multi-select/checkbox, e.g. ["Video","LKPD","Poster"]',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Jawaban survei per responden per pertanyaan — data utama analisis';

-- --------------------------------------------------------

--
-- Table structure for table `kabupaten`
--

CREATE TABLE `kabupaten` (
  `id` int NOT NULL,
  `provinsi_id` int NOT NULL COMMENT 'FK ke provinsi.id',
  `nama` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama kabupaten/kota lengkap (e.g. Kab. Sidoarjo)',
  `kode_bps` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kode BPS kabupaten (4 digit)',
  `tipe` enum('kabupaten','kota') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'kabupaten' COMMENT 'Tipe wilayah: kabupaten atau kota',
  `warna_chart` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '#4A57C4' COMMENT 'Hex color untuk identitas di chart/diagram',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master data kabupaten/kota di bawah provinsi';

--
-- Dumping data for table `kabupaten`
--

INSERT INTO `kabupaten` (`id`, `provinsi_id`, `nama`, `kode_bps`, `tipe`, `warna_chart`, `created_at`) VALUES
(1, 1, 'Kab. Sidoarjo', '3515', 'kabupaten', '#4A57C4', '2026-09-10 05:42:46'),
(2, 1, 'Kota Batu', '3579', 'kota', '#6C7AE0', '2026-09-10 05:42:46'),
(3, 1, 'Kab. Tuban', '3523', 'kabupaten', '#2FB344', '2026-09-10 05:42:46');

-- --------------------------------------------------------

--
-- Table structure for table `kecamatan`
--

CREATE TABLE `kecamatan` (
  `id` int NOT NULL,
  `kabupaten_id` int NOT NULL COMMENT 'FK ke kabupaten.id',
  `nama` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama kecamatan (tanpa prefix Kec.)',
  `kode_bps` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kode BPS kecamatan (6 digit)',
  `geojson_path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Path ke file GeoJSON batas wilayah kecamatan',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master data kecamatan — digunakan untuk Peta Kecamatan dan filter global';

--
-- Dumping data for table `kecamatan`
--

INSERT INTO `kecamatan` (`id`, `kabupaten_id`, `nama`, `kode_bps`, `geojson_path`, `created_at`) VALUES
(1, 1, 'Waru', NULL, NULL, '2026-09-10 05:42:46'),
(2, 1, 'Taman', NULL, NULL, '2026-09-10 05:42:46'),
(3, 1, 'Gedangan', NULL, NULL, '2026-09-10 05:42:46'),
(4, 1, 'Sedati', NULL, NULL, '2026-09-10 05:42:46'),
(5, 1, 'Buduran', NULL, NULL, '2026-09-10 05:42:46'),
(6, 1, 'Sukodono', NULL, NULL, '2026-09-10 05:42:46'),
(7, 1, 'Sidoarjo', NULL, NULL, '2026-09-10 05:42:46'),
(8, 1, 'Krian', NULL, NULL, '2026-09-10 05:42:46'),
(9, 1, 'Balong Bendo', NULL, NULL, '2026-09-10 05:42:46'),
(10, 1, 'Tarik', NULL, NULL, '2026-09-10 05:42:46'),
(11, 1, 'Prambon', NULL, NULL, '2026-09-10 05:42:46'),
(12, 1, 'Krembung', NULL, NULL, '2026-09-10 05:42:46'),
(13, 1, 'Porong', NULL, NULL, '2026-09-10 05:42:46'),
(14, 1, 'Jabon', NULL, NULL, '2026-09-10 05:42:46'),
(15, 1, 'Tanggulangin', NULL, NULL, '2026-09-10 05:42:46'),
(16, 1, 'Tulangan', NULL, NULL, '2026-09-10 05:42:46'),
(17, 1, 'Wonoayu', NULL, NULL, '2026-09-10 05:42:46'),
(18, 1, 'Candi', NULL, NULL, '2026-09-10 05:42:46'),
(19, 2, 'Batu', NULL, NULL, '2026-09-10 05:42:46'),
(20, 2, 'Bumiaji', NULL, NULL, '2026-09-10 05:42:46'),
(21, 2, 'Junrejo', NULL, NULL, '2026-09-10 05:42:46'),
(22, 3, 'Tuban', NULL, NULL, '2026-09-10 05:42:46'),
(23, 3, 'Jenu', NULL, NULL, '2026-09-10 05:42:46'),
(24, 3, 'Merakurak', NULL, NULL, '2026-09-10 05:42:46'),
(25, 3, 'Semanding', NULL, NULL, '2026-09-10 05:42:46'),
(26, 3, 'Palang', NULL, NULL, '2026-09-10 05:42:46'),
(27, 3, 'Widang', NULL, NULL, '2026-09-10 05:42:46'),
(28, 3, 'Babat', NULL, NULL, '2026-09-10 05:42:46'),
(29, 3, 'Plumpang', NULL, NULL, '2026-09-10 05:42:46'),
(30, 3, 'Rengel', NULL, NULL, '2026-09-10 05:42:46'),
(31, 3, 'Soko', NULL, NULL, '2026-09-10 05:42:46'),
(32, 3, 'Parengan', NULL, NULL, '2026-09-10 05:42:46'),
(33, 3, 'Singgahan', NULL, NULL, '2026-09-10 05:42:46'),
(34, 3, 'Senori', NULL, NULL, '2026-09-10 05:42:46'),
(35, 3, 'Bangilan', NULL, NULL, '2026-09-10 05:42:46'),
(36, 3, 'Jatirogo', NULL, NULL, '2026-09-10 05:42:46'),
(37, 3, 'Kenduruan', NULL, NULL, '2026-09-10 05:42:46'),
(38, 3, 'Montong', NULL, NULL, '2026-09-10 05:42:46'),
(39, 3, 'Kerek', NULL, NULL, '2026-09-10 05:42:46'),
(40, 3, 'Tambakboyo', NULL, NULL, '2026-09-10 05:42:46'),
(41, 3, 'Bancar', NULL, NULL, '2026-09-10 05:42:46'),
(42, 3, 'Grabagan', NULL, NULL, '2026-09-10 05:42:46');

-- --------------------------------------------------------

--
-- Table structure for table `laporan_export`
--

CREATE TABLE `laporan_export` (
  `id` int NOT NULL,
  `user_id` int NOT NULL COMMENT 'FK ke users.id — siapa yang membuat export',
  `tipe_export` enum('pdf','excel','docx') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Format file output',
  `nama_file` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama file yang di-generate',
  `path_file` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Path/URL ke file yang sudah di-generate',
  `filter_params` json DEFAULT NULL COMMENT 'Parameter filter saat generate: {"kabupaten": "Sidoarjo", "modul": "with_myself"}',
  `status` enum('generating','completed','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'generating' COMMENT 'Status proses generate file',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL COMMENT 'Timestamp selesai generate'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Riwayat laporan yang di-export — halaman Laporan & Ekspor';

-- --------------------------------------------------------

--
-- Table structure for table `modul_bsan`
--

CREATE TABLE `modul_bsan` (
  `id` int NOT NULL,
  `framework_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'with_myself',
  `kode` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Identifier: with_myself, with_others, with_challenges',
  `nama` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama modul Bahasa Indonesia',
  `nama_en` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama modul Bahasa Inggris',
  `subtitle` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Subtitle Bahasa Indonesia',
  `subtitle_en` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Subtitle Bahasa Inggris',
  `warna` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '#4A57C4' COMMENT 'Hex color untuk identitas modul di chart',
  `ikon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'brain' COMMENT 'Nama ikon lucide-react',
  `urutan` int NOT NULL DEFAULT '0' COMMENT 'Urutan tampil di UI (ascending)',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master data 3 modul BSAN (CASEL framework): With Myself, With Others, With Our Challenges';

--
-- Dumping data for table `modul_bsan`
--

INSERT INTO `modul_bsan` (`id`, `framework_key`, `kode`, `nama`, `nama_en`, `subtitle`, `subtitle_en`, `warna`, `ikon`, `urutan`, `is_active`, `created_at`) VALUES
(1, 'with_myself', 'modul_1', 'Modul 1: Literasi & Numerasi Dasar', 'Module 1: Basic Literacy & Numeracy', 'Media ajar, sudut baca & keaktifan KBM', 'Learning media, reading corner & active class', '#4A57C4', 'brain', 1, 1, '2026-09-12 08:29:11'),
(2, 'with_others', 'modul_2', 'Modul 2: Disiplin Positif & Antiperundungan', 'Module 2: Positive Discipline & Anti-Bullying', 'Kesepakatan kelas & penanganan perundungan', 'Class agreements & anti-bullying protocols', '#10B981', 'users', 2, 1, '2026-09-12 08:29:11'),
(3, 'with_challenges', 'modul_3', 'Modul 3: Kesehatan Emosi & Pengelolaan Stres', 'Module 3: Emotional Health & Stress Management', 'Refleksi emosi & roda perasaan', 'Emotional reflection & feeling wheel', '#8B5CF6', 'heart', 3, 1, '2026-09-12 08:29:11'),
(4, 'with_challenges', 'modul_4', 'Modul 4: Kebersihan & Kesehatan Lingkungan', 'Module 4: Sanitation & Environmental Health', 'Fasilitas sanitasi & iklim sekolah aman', 'Sanitation facilities & safe school climate', '#F59E0B', 'target', 4, 1, '2026-09-12 08:29:11'),
(5, 'with_others', 'modul_5', 'Modul 5: Kemitraan Orang Tua & Komite', 'Module 5: Parent & Committee Partnership', 'Kolaborasi paguyuban & refleksi bersama', 'Parent association & collective reflection', '#EC4899', 'users', 5, 1, '2026-09-12 08:29:11');

-- --------------------------------------------------------

--
-- Table structure for table `notifikasi`
--

CREATE TABLE `notifikasi` (
  `id` bigint NOT NULL,
  `user_id` int NOT NULL COMMENT 'FK ke users.id — penerima notifikasi',
  `judul` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Judul singkat notifikasi',
  `pesan` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Isi pesan detail notifikasi',
  `tipe` enum('reminder','report','system','alert') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'system' COMMENT 'Jenis notifikasi untuk filtering & icon',
  `is_read` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Status sudah dibaca atau belum',
  `read_at` timestamp NULL DEFAULT NULL COMMENT 'Timestamp dibaca',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Notifikasi in-app untuk setiap user — ditampilkan di Topbar bell icon';

--
-- Dumping data for table `notifikasi`
--

INSERT INTO `notifikasi` (`id`, `user_id`, `judul`, `pesan`, `tipe`, `is_read`, `read_at`, `created_at`) VALUES
(1, 1, 'tes', 'tes', 'system', 0, NULL, '2026-09-12 08:59:58'),
(2, 1243, 'tes', 'tes', 'system', 0, NULL, '2026-09-12 08:59:58'),
(3, 2, 'tes', 'tes', 'system', 0, NULL, '2026-09-12 08:59:58');

-- --------------------------------------------------------

--
-- Table structure for table `pertanyaan_survey`
--

CREATE TABLE `pertanyaan_survey` (
  `id` int NOT NULL,
  `modul_id` int DEFAULT NULL COMMENT 'FK ke modul_bsan.id — NULL jika bukan pertanyaan modul spesifik',
  `kode_pertanyaan` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kode referensi: Q1, Q2, ... Q37 sesuai Google Form',
  `teks_pertanyaan` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Teks lengkap pertanyaan',
  `tipe` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'text',
  `opsi_jawaban` json DEFAULT NULL COMMENT 'Array opsi jawaban untuk tipe pilihan, e.g. ["Ya","Tidak"]',
  `urutan` int NOT NULL DEFAULT '0' COMMENT 'Urutan tampil dalam form',
  `is_required` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Apakah wajib diisi',
  `skip_to_question` int DEFAULT NULL COMMENT 'ID pertanyaan tujuan skip logic (conditional branching)',
  `section` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'identitas' COMMENT 'Kelompok: identitas, pelatihan, implementasi_awal, implementasi_tinggi, refleksi, kepsek, kontak',
  `target_kelas` enum('semua','kelas_awal','kelas_tinggi','kepala_sekolah') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'semua' COMMENT 'Hanya ditampilkan untuk target kelas tertentu',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Definisi pertanyaan survei BSAN — 37 pertanyaan sesuai Google Form Implementasi BSAN';

--
-- Dumping data for table `pertanyaan_survey`
--

INSERT INTO `pertanyaan_survey` (`id`, `modul_id`, `kode_pertanyaan`, `teks_pertanyaan`, `tipe`, `opsi_jawaban`, `urutan`, `is_required`, `skip_to_question`, `section`, `target_kelas`, `is_active`, `created_at`, `deleted_at`) VALUES
(1, NULL, 'Q1', 'Nama\n', 'text', NULL, 1, 1, NULL, 'identitas', 'semua', 1, '2026-09-10 05:42:56', NULL),
(2, NULL, 'Q2', 'Jenis Kelamin', 'dropdown', '[\"Laki-Laki\", \"Perempuan\"]', 2, 1, NULL, 'identitas', 'semua', 1, '2026-09-10 05:42:56', NULL),
(3, NULL, 'Q3', 'Posisi', 'dropdown', '[\"Kepala Sekolah\", \"Guru kelas 1\", \"Guru kelas 2\", \"Guru kelas 3\", \"Guru kelas 4\", \"Guru kelas 5\", \"Guru kelas 6\", \"Guru PJOK\", \"Guru PAI\", \"Guru seni dan budaya\", \"Lainnya\"]', 3, 1, NULL, 'identitas', 'semua', 1, '2026-09-10 05:42:56', NULL),
(4, NULL, 'Q4', 'Asal Sekolah', 'school_select', NULL, 4, 1, NULL, 'identitas', 'semua', 1, '2026-09-10 05:42:56', NULL),
(5, NULL, 'Q5', 'Kabupaten', 'dropdown', '[\"Tuban\", \"Batu\", \"Sidoarjo\"]', 5, 1, NULL, 'identitas', 'semua', 1, '2026-09-10 05:42:56', NULL),
(6, NULL, 'Q6', 'Kecamatan Kab Tuban', 'dropdown', '[\"Bancar\", \"Bangilan\", \"Grabagan\", \"Jatirogo\", \"Jenu\", \"Kenduruan\", \"Kerek\", \"Merakurak\", \"Montong\", \"Palang\", \"Parengan\", \"Plumpang\", \"Rengel\", \"Semanding\", \"Senori\", \"Singgahan\", \"Soko\", \"Tambakboyo\", \"Tuban\", \"Widang\"]', 6, 1, NULL, 'identitas', 'semua', 0, '2026-09-10 05:42:56', NULL),
(7, 1, 'Q7', 'Kecamatan Kota Batu', 'dropdown', '[\"Batu\", \"Bumiaji\", \"Junrejo\"]', 7, 1, NULL, 'identitas', 'semua', 0, '2026-09-10 05:42:56', NULL),
(8, 1, 'Q8', 'Kecamatan Kab Sidoarjo', 'dropdown', '[\"Banjarbendo\", \"Buduran\", \"Candi\", \"Gedangan\", \"Jabon\", \"Krembung\", \"Krian\", \"Prambon\", \"Porong\", \"Sedati\", \"Sidoarjo\", \"Sukodono\", \"Taman\", \"Tanggulangin\", \"Tarik\", \"Tulangan\", \"Waru\", \"Wonoayu\"]', 8, 1, NULL, 'identitas', 'semua', 0, '2026-09-10 05:42:56', NULL),
(9, 1, 'Q6', 'Apakah Bpk/Ibu sudah pernah mendapatkan materi modul BSAN - Budaya Sekolah Aman dan Nyaman [baik melalui pelatihan KKG/K3S/KKG Sekolah, maupun sosialisasi sesama guru]', 'radio', '[\"Sudah\", \"Belum\", \"Dalam Proses\"]', 9, 1, NULL, 'pelatihan', 'semua', 1, '2026-09-10 05:42:56', NULL),
(10, 1, 'Q10', 'Jika ya siapa yang mengadakan pelatihan', 'checkbox', '[\"INOVASI-DINAS PENDIDIKAN\", \"Diseminasi KKG/KKKS\"]', 10, 1, NULL, 'pelatihan', 'semua', 1, '2026-09-10 05:42:56', NULL),
(11, 2, 'Q11', 'Apakah Bpk/Ibu sudah mengimplementasikan modul BSAN', 'dropdown', '[\"Ya, sudah seluruhnya\", \"Ya, sebagian\", \"Tidak\"]', 11, 1, NULL, 'pelatihan', 'semua', 1, '2026-09-10 05:42:56', NULL),
(12, 2, 'Q12', 'Saat implementasi modul BSAN, Bpk/Ibu mengajar di kelas berapa?', 'dropdown', '[\"Kelas Awal\", \"Kelas Tinggi\", \"Kepala Sekolah\"]', 12, 1, NULL, 'pelatihan', 'semua', 1, '2026-09-10 05:42:56', NULL),
(13, 1, 'Q13', 'Menurut Bpk/Ibu bagian mana dari modul yang cukup mudah penerapannya? (Kelas Awal)', 'checkbox', '[\"Alur 1: Tema 1: Tubuhku Istimewa\", \"Alur 1: Tema 2: Aku Jaga Diri\", \"Alur 1: Tema 3: Perasaanku, Tanggungjawabku\", \"Alur 1: Tema 4: Aku Bisa, Aku Hebat\", \"Alur 1: Tema 5: Aku Gemar Membaca\", \"Alur 2: Tema 6: Aku, Kamu, Kita Unik\", \"Alur 2: Tema 7: Tubuhku Bicara, Emosi Bisa Berubah\", \"Alur 3: Tema 8: Surat Untuk yang tersayang\", \"Alur 3: Tema 9: Jaga Layar, Jaga Diri\", \"Alur 3: Tema 10: Aku Mau Membantu\"]', 13, 1, NULL, 'implementasi_awal', 'kelas_awal', 1, '2026-09-10 05:42:56', NULL),
(14, 1, 'Q14', 'Menurut Bpk/Ibu bagian mana dari modul yang cukup sulit penerapannya? (Kelas Awal)', 'checkbox', '[\"Alur 1: Tema 1: Tubuhku Istimewa\", \"Alur 1: Tema 2: Aku Jaga Diri\", \"Alur 1: Tema 3: Perasaanku, Tanggungjawabku\", \"Alur 1: Tema 4: Aku Bisa, Aku Hebat\", \"Alur 1: Tema 5: Aku Gemar Membaca\", \"Alur 2: Tema 6: Aku, Kamu, Kita Unik\", \"Alur 2: Tema 7: Tubuhku Bicara, Emosi Bisa Berubah\", \"Alur 3: Tema 8: Surat Untuk yang tersayang\", \"Alur 3: Tema 9: Jaga Layar, Jaga Diri\", \"Alur 3: Tema 10: Aku Mau Membantu\"]', 14, 1, NULL, 'implementasi_awal', 'kelas_awal', 1, '2026-09-10 05:42:56', NULL),
(15, 3, 'Q15', 'Media apa saja yang telah Bpk/Ibu gunakan? (Kelas Awal)', 'checkbox', '[\"Video\", \"LKPD\", \"Kartu Afirmasi Positif\", \"Puzzle tubuhku\", \"Media gambar\", \"Papan ular tangga\", \"Peta tubuh buatan murid\", \"Poster Area Pribadi\", \"Poster Menjaga Diri\", \"Poster 6 langkah mencuci tangan\", \"Poster isi piringku\", \"Papan Roda Emosi\", \"Kartu Ekspresi Wajah\", \"Kartu Berhenti\", \"Kartu Berfikir\", \"Kartu Bertindak\", \"Kartu Emosi\", \"Stiker Emoji\", \"Kartu STOP\", \"Kartu Cerita\", \"Peta Jejak\", \"Poster Hak Anak\", \"Poster Tubuh\", \"Kartu Peristiwa\", \"Buku Cerita\", \"Stiker Pembaca Rajin\", \"Kartu Peran\", \"Mainan Tradisional\", \"Kartu Jenis Pekerjaan\", \"Gambar lingkungan dan dampak\"]', 15, 1, NULL, 'implementasi_awal', 'kelas_awal', 1, '2026-09-10 05:42:56', NULL),
(16, 4, 'Q16', 'Keaktifan murid saat implementasi modul BSAN (Kelas Awal)', 'radio', '[\"Lebih dari 70% siswa terlibat aktif\", \"50% siswa terlibat aktif\", \"Kurang dari 50% siswa terlibat aktif\"]', 16, 1, NULL, 'implementasi_awal', 'kelas_awal', 1, '2026-09-10 05:42:56', NULL),
(17, 5, 'Q17', 'Apakah guru melakukan refleksi dengan murid? (Kelas Awal)', 'radio', '[\"Ya, tiap selesai alur\", \"Ya, tiap selesai tema\", \"Ya, tiap selesai aktivitas\", \"Ya, setelah seluruhnya selesai\", \"Tidak\"]', 17, 1, NULL, 'implementasi_awal', 'kelas_awal', 1, '2026-09-10 05:42:56', NULL),
(18, 2, 'Q18', 'Jika ya, sebutkan temuan-temuan pokoknya (Refleksi Murid - Kelas Awal)', 'text', NULL, 18, 1, NULL, 'implementasi_awal', 'kelas_awal', 1, '2026-09-10 05:42:56', NULL),
(19, 2, 'Q19', 'Apakah guru melakukan refleksi dengan guru lain? (Kelas Awal)', 'radio', '[\"Ya, tiap selesai alur\", \"Ya, tiap selesai tema\", \"Ya, tiap selesai aktivitas\", \"Ya, setelah seluruhnya selesai\", \"Tidak\"]', 19, 1, NULL, 'implementasi_awal', 'kelas_awal', 1, '2026-09-10 05:42:56', NULL),
(20, 3, 'Q20', 'Jika ya, sebutkan temuan-temuan pokoknya (Refleksi Guru - Kelas Awal)', 'text', NULL, 20, 1, NULL, 'implementasi_awal', 'kelas_awal', 1, '2026-09-10 05:42:56', NULL),
(21, 3, 'Q21', 'Apakah terdapat kesepakatan kelas (Kelas Awal)', 'radio', '[\"Ya, disusun guru dengan murid\", \"Ya, disiapkan guru\", \"Tidak\"]', 21, 1, NULL, 'implementasi_awal', 'kelas_awal', 1, '2026-09-10 05:42:56', NULL),
(22, 4, 'Q22', 'Menurut Bpk/Ibu bagian mana dari modul yang cukup mudah penerapannya? (Kelas Tinggi)', 'checkbox', '[\"Alur 1: Tema 1: Mengenali Perasaan Diri\", \"Alur 1: Tema 2: Mengelola Perasaan Diri (Kelas 4)\", \"Alur 1: Tema 2: Mengelola Perasaan Diri (Kelas 5-6)\", \"Alur 1: Tema 3: Peta Tubuh Saya (kelas 4)\", \"Alur 1: Peta Tubuh Saya (kelas 5-6)\", \"Alur 1: Tema 4: Afirmasi Positif\", \"Alur 2: Tema 5: Lingkaran Persahabatan\", \"Alur 2: Tema 6: Berbagi Persahabatan\", \"Alur 2: Tema 7: Tanggung Jawab Diri\", \"Alur 2: Tema 8: Ayo Bermain Bersama\", \"Alur 2: Tema 9: Aku dan Kamu Istimewa\", \"Alur 3: Tema 10: Gembira bersama Sahabat\", \"Alur 3: Tema 11: Kampanye Anak Indonesia Hebat\", \"Alur 3: Tema 12: Refleksi dan Tindak Lanjut\"]', 22, 1, NULL, 'implementasi_tinggi', 'kelas_tinggi', 1, '2026-09-10 05:42:56', NULL),
(23, 5, 'Q23', 'Menurut Bpk/Ibu bagian mana dari modul yang cukup sulit penerapannya? (Kelas Tinggi)', 'checkbox', '[\"Alur 1: Tema 1: Mengenali Perasaan Diri\", \"Alur 1: Tema 2: Mengelola Perasaan Diri (Kelas 4)\", \"Alur 1: Tema 2: Mengelola Perasaan Diri (Kelas 5-6)\", \"Alur 1: Tema 3: Peta Tubuh Saya (kelas 4)\", \"Alur 1: Peta Tubuh Saya (kelas 5-6)\", \"Alur 1: Tema 4: Afirmasi Positif\", \"Alur 2: Tema 5: Lingkaran Persahabatan\", \"Alur 2: Tema 6: Berbagi Persahabatan\", \"Alur 2: Tema 7: Tanggung Jawab Diri\", \"Alur 2: Tema 8: Ayo Bermain Bersama\", \"Alur 2: Tema 9: Aku dan Kamu Istimewa\", \"Alur 3: Tema 10: Gembira bersama Sahabat\", \"Alur 3: Tema 11: Kampanye Anak Indonesia Hebat\", \"Alur 3: Tema 12: Refleksi dan Tindak Lanjut\"]', 23, 1, NULL, 'implementasi_tinggi', 'kelas_tinggi', 1, '2026-09-10 05:42:56', NULL),
(24, 5, 'Q24', 'Media apa saja yang telah Bpk/Ibu gunakan? (Kelas Tinggi)', 'checkbox', '[\"Video\", \"LKPD\", \"Kartu Afirmasi Positif\", \"Puzzle tubuhku\", \"Media gambar\", \"Papan ular tangga\", \"Peta tubuh buatan murid\", \"Poster Area Pribadi\", \"Poster Menjaga Diri\", \"Poster 6 langkah mencuci tangan\", \"Poster isi piringku\", \"Papan Roda Emosi\", \"Kartu Ekspresi Wajah\", \"Kartu Berhenti\", \"Kartu Berfikir\", \"Kartu Bertindak\", \"Kartu Emosi\", \"Stiker Emoji\", \"Kartu STOP\", \"Kartu Cerita\", \"Peta Jejak\", \"Poster Hak Anak\", \"Poster Tubuh\", \"Kartu Peristiwa\", \"Buku Cerita\", \"Stiker Pembaca Rajin\", \"Kartu Peran\", \"Mainan Tradisional\", \"Kartu Jenis Pekerjaan\", \"Gambar lingkungan dan dampak\"]', 24, 1, NULL, 'implementasi_tinggi', 'kelas_tinggi', 1, '2026-09-10 05:42:56', NULL),
(25, 5, 'Q25', 'Keaktifan murid saat implementasi modul BSAN (Kelas Tinggi)', 'radio', '[\"Lebih dari 70% siswa terlibat aktif\", \"50% siswa terlibat aktif\", \"Kurang dari 50% siswa terlibat aktif\"]', 25, 1, NULL, 'implementasi_tinggi', 'kelas_tinggi', 1, '2026-09-10 05:42:56', NULL),
(26, 2, 'Q26', 'Apakah guru melakukan refleksi dengan guru lain? (Kelas Tinggi)', 'radio', '[\"Ya, tiap selesai alur\", \"Ya, tiap selesai tema\", \"Ya, tiap selesai aktivitas\", \"Ya, setelah seluruhnya selesai\", \"Tidak\"]', 26, 1, NULL, 'implementasi_tinggi', 'kelas_tinggi', 1, '2026-09-10 05:42:56', NULL),
(27, 4, 'Q27', 'Jika ya, sebutkan temuan-temuan pokoknya (Refleksi Guru - Kelas Tinggi)', 'text', NULL, 27, 1, NULL, 'implementasi_tinggi', 'kelas_tinggi', 1, '2026-09-10 05:42:56', NULL),
(28, 5, 'Q28', 'Apakah guru melakukan refleksi dengan murid? (Kelas Tinggi)', 'radio', '[\"Ya, tiap selesai alur\", \"Ya, tiap selesai tema\", \"Ya, tiap selesai aktivitas\", \"Ya, setelah seluruhnya selesai\", \"Tidak\"]', 28, 1, NULL, 'implementasi_tinggi', 'kelas_tinggi', 1, '2026-09-10 05:42:56', NULL),
(29, 2, 'Q29', 'Jika ya, sebutkan temuan-temuan pokoknya (Refleksi Murid - Kelas Tinggi)', 'text', NULL, 29, 1, NULL, 'implementasi_tinggi', 'kelas_tinggi', 1, '2026-09-10 05:42:56', NULL),
(30, 3, 'Q30', 'Apakah terdapat kesepakatan kelas (Kelas Tinggi)', 'radio', '[\"Ya, disusun guru dengan murid\", \"Ya, disiapkan guru\", \"Tidak\"]', 30, 1, NULL, 'implementasi_tinggi', 'kelas_tinggi', 1, '2026-09-10 05:42:56', NULL),
(31, 5, 'Q31', 'Apa saja dukungan kepala sekolah yang telah dilakukan dalam mewujudkan BSAN', 'checkbox', '[\"Belum ada\", \"Memimpin refleksi guru\", \"Melakukan sosialisasi\", \"Membangun kolaborasi antar pihak\", \"Memasukkan program BSAN ke dalam kurikulum\"]', 31, 1, NULL, 'kepsek', 'semua', 1, '2026-09-10 05:42:56', NULL),
(32, 1, 'Q32', 'Apa saja program sekolah yang sudah disusun dalam mendukung BSAN', 'checkbox', '[\"Belum ada\", \"Membuat kotak aduan\", \"Menyusun SOP pencegahan dan penanganan kekerasan\", \"Membentuk tim penanggulangan kekerasan\", \"Menyusun dan menjalankan program pembiasaan karakter\", \"Memasang poster tentang sekolah aman di dalam dan di luar sekolah\", \"Memasukkan kegiatan Budaya Sekolah Aman dan Nyaman dalam RKS/RKAS\"]', 32, 1, NULL, 'kepsek', 'semua', 1, '2026-09-10 05:42:56', NULL),
(33, 3, 'Q33', 'Ceritakan hal baik/perubahan baik selama implementasi modul BSAN, terkait: 1. Manajemen kelas 2. Perubahan perilaku murid/guru', 'text', NULL, 33, 1, NULL, 'refleksi', 'semua', 1, '2026-09-10 05:42:56', NULL),
(34, 3, 'Q34', 'Apa tantangan dan kendala dalam mewujudkan sekolah aman dan nyaman?', 'text', NULL, 34, 1, NULL, 'refleksi', 'semua', 1, '2026-09-10 05:42:56', NULL),
(35, 1, 'Q35', 'Apakah menurut Bpk/Ibu BSAN sesuai/relevan? Mengapa?', 'text', NULL, 35, 1, NULL, 'refleksi', 'semua', 1, '2026-09-10 05:42:56', NULL),
(36, 1, 'Q36', 'Apakah menurut Bpk/Ibu BSAN membantu pekerjaan Bpk/Ibu? Mengapa?', 'text', NULL, 36, 1, NULL, 'refleksi', 'semua', 1, '2026-09-10 05:42:56', NULL),
(37, NULL, 'Q37', 'No WA responden.\n', 'text', NULL, 37, 1, NULL, 'kontak', 'semua', 1, '2026-09-10 05:42:56', NULL),
(38, NULL, 'Q38', 'adawdawdawdadwa', 'radio', NULL, 99, 1, NULL, 'identitas', 'semua', 0, '2026-09-10 07:30:14', NULL),
(39, NULL, 'Q39', 'awd awdaw dacwevfaw bwawd', 'radio', '[\"vacwa\", \"adwad\", \"adwaw\", \"daw\"]', 99, 1, NULL, 'identitas', 'semua', 0, '2026-09-10 07:32:47', NULL),
(40, NULL, 'Q40', 'tes', 'radio', NULL, 99, 1, NULL, 'sec_1789026517114', 'semua', 0, '2026-09-10 07:48:55', NULL),
(41, NULL, 'Q40', 'tes', 'text', NULL, 99, 1, NULL, 'identitas', 'semua', 0, '2026-09-10 07:49:06', NULL),
(42, NULL, 'Q40', 'awdawd', 'radio', NULL, 99, 1, NULL, 'identitas', 'semua', 0, '2026-09-10 07:50:08', NULL),
(43, NULL, 'Q39', 'adwwa a', 'radio', '[\"adw\", \"awdwa\", \"dawd\", \"awdwa\"]', 99, 1, NULL, 'sec_1789026517114', 'semua', 0, '2026-09-11 20:26:21', NULL),
(44, NULL, 'Q38', 'tes', 'radio', '[\"jahdw\", \"awjdhgwa\", \"ajwhgd\"]', 99, 1, NULL, 'sec_1789158506138', 'semua', 0, '2026-09-11 20:28:33', NULL),
(45, NULL, 'Q6', 'Kecamatan', 'kecamatan_select', NULL, 99, 1, NULL, 'identitas', 'semua', 1, '2026-09-11 20:31:09', NULL),
(46, NULL, 'Q36', 'tes', 'radio', '[\"tes\", \"tes\", \"tes\"]', 99, 1, NULL, 'sec_1789200855539', 'semua', 0, '2026-09-12 08:14:44', NULL),
(47, NULL, 'Q36', 'tesssss', 'radio', '[\"tes\", \"tes\"]', 99, 1, NULL, 'tes', 'semua', 0, '2026-09-12 08:25:02', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `provinsi`
--

CREATE TABLE `provinsi` (
  `id` int NOT NULL,
  `nama` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama provinsi lengkap',
  `kode_bps` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kode BPS provinsi (2 digit)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master data provinsi — saat ini hanya Jawa Timur';

--
-- Dumping data for table `provinsi`
--

INSERT INTO `provinsi` (`id`, `nama`, `kode_bps`, `created_at`) VALUES
(1, 'Jawa Timur', '35', '2026-09-10 05:42:46');

-- --------------------------------------------------------

--
-- Table structure for table `responden_survey`
--

CREATE TABLE `responden_survey` (
  `id` int NOT NULL,
  `nama` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama lengkap responden (huruf besar)',
  `jenis_kelamin` enum('L','P') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Laki-laki / Perempuan',
  `posisi` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Posisi: Kepala Sekolah, Guru kelas 1-6, Guru PJOK, dll',
  `sekolah_id` int NOT NULL COMMENT 'FK ke satuan_pendidikan.id — asal sekolah',
  `npsn` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'NPSN sekolah (redundan untuk quick-lookup)',
  `kabupaten_id` int NOT NULL COMMENT 'FK ke kabupaten.id (denormalisasi untuk performa filter)',
  `kecamatan_id` int NOT NULL COMMENT 'FK ke kecamatan.id (denormalisasi untuk performa filter)',
  `penerima_modul` enum('Ya','Tidak') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Tidak' COMMENT 'Apakah sudah menerima materi modul BSAN',
  `penyelenggara_pelatihan` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Siapa yang mengadakan pelatihan (multi, dipisah koma)',
  `status_implementasi` enum('sudah','sebagian','belum') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Status implementasi modul BSAN — NULL jika belum menerima',
  `kelas_mengajar` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kelas Awal (1-3) / Kelas Tinggi (4-6) / Kepala Sekolah',
  `no_wa` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor WhatsApp untuk kontak follow-up',
  `submitted_at` timestamp NULL DEFAULT NULL COMMENT 'Timestamp pengisian survei',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Data responden survei BSAN (guru & kepsek) — inti Data Responden dan analisis';

--
-- Triggers `responden_survey`
--
DELIMITER $$
CREATE TRIGGER `trg_after_responden_insert` AFTER INSERT ON `responden_survey` FOR EACH ROW BEGIN
  -- Update status pengisian sekolah berdasarkan responden terbaru
  UPDATE satuan_pendidikan
  SET
    status_pengisian = CASE
      WHEN NEW.status_implementasi = 'sudah' THEN 'sudah'
      WHEN NEW.penerima_modul = 'Ya' THEN 'sebagian'
      ELSE status_pengisian
    END,
    last_updated = CURRENT_TIMESTAMP
  WHERE id = NEW.sekolah_id
    AND (
      -- Hanya upgrade status, tidak downgrade
      (status_pengisian = 'belum') OR
      (status_pengisian = 'sebagian' AND NEW.status_implementasi = 'sudah')
    );
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `satuan_pendidikan`
--

CREATE TABLE `satuan_pendidikan` (
  `id` int NOT NULL,
  `npsn` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nomor Pokok Sekolah Nasional — identifier unik nasional',
  `nama` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama resmi satuan pendidikan',
  `kecamatan_id` int NOT NULL COMMENT 'FK ke kecamatan.id',
  `jenjang` enum('SD','SMP','SMA','SMK','MI','MTs','MA') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SD' COMMENT 'Jenjang pendidikan',
  `status_sekolah` enum('Negeri','Swasta') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Negeri' COMMENT 'Status kepemilikan sekolah',
  `akreditasi` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nilai akreditasi: A, B, C, atau Belum Terakreditasi',
  `alamat` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Alamat lengkap sekolah',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email resmi sekolah',
  `telepon` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor telepon sekolah',
  `total_guru` int DEFAULT '0' COMMENT 'Jumlah total guru aktif',
  `total_siswa` int DEFAULT '0' COMMENT 'Jumlah total siswa aktif',
  `latitude` decimal(10,7) DEFAULT NULL COMMENT 'Koordinat GPS latitude',
  `longitude` decimal(10,7) DEFAULT NULL COMMENT 'Koordinat GPS longitude',
  `status_pengisian` enum('belum','sebagian','sudah') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'belum' COMMENT 'Status pengisian survei BSAN: belum/sebagian/sudah',
  `last_updated` timestamp NULL DEFAULT NULL COMMENT 'Terakhir kali status pengisian diperbarui',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master data satuan pendidikan (sekolah) — inti dari seluruh sistem';

--
-- Dumping data for table `satuan_pendidikan`
--

INSERT INTO `satuan_pendidikan` (`id`, `npsn`, `nama`, `kecamatan_id`, `jenjang`, `status_sekolah`, `akreditasi`, `alamat`, `email`, `telepon`, `total_guru`, `total_siswa`, `latitude`, `longitude`, `status_pengisian`, `last_updated`, `created_at`, `deleted_at`) VALUES
(1, '70058276', 'SD AR RAHMAH PEPELEGI', 1, 'SD', 'Swasta', '-', ' JALAN JATISARI NO. 56A RT 03 RW 06 PEPELEGI', '-', '-', 6, 60, NULL, NULL, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(2, '70057704', 'SD PLUS SABILUL ULUM', 8, 'SD', 'Swasta', '-', 'JL. KH SAHLAN RT 001 RW 001', '-', '-', 5, 11, NULL, NULL, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(3, '70056786', 'SDI AL KHOIROH', 11, 'SD', 'Swasta', '-', 'DSN PANDEAN, DESA/KELURAHAN JATI ALUN-ALUN', '-', '-', 2, 11, NULL, NULL, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(4, '70053651', 'SD INSPIRASI SCHOOLS SIDOARJO', 3, 'SD', 'Swasta', '-', 'The Jivana Homes, Jalan Raya Tebel, Tebel Barat', '-', '-', 3, 13, NULL, NULL, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(5, '70045849', 'SD Islam Terbuka Sabilul Huda Candi', 18, 'SD', 'Swasta', '-', 'Jl. Raya Mbah Gongso Durungbedug ', '-', '-', 5, 142, NULL, NULL, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(6, '70036698', 'SD ISLAM AVICENNA FULL DAY SCHOOL', 8, 'SD', 'Swasta', '-', 'Jln. Masjid Ar-Ridho Desa Jatikalang RT 06 RW 02 Krian', '-', '-', 6, 22, NULL, NULL, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(7, '70034633', 'SD ISLAM ALAM BUNAYYA', 11, 'SD', 'Swasta', '-', 'Dusun Bandilan RT 01 RW 06 Simogirang', 'sdialambunayya@gmail.com', '085225303489', 7, 65, NULL, NULL, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(8, '70031247', 'SD CHALIDANA ISLAMIC SCHOOL', 5, 'SD', 'Swasta', 'A', 'Safira Juanda Resort Blok B5/10', 'admin.juanda@chalidanaislamicschool.com', '081211124131', 8, 62, NULL, NULL, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(9, '70013849', 'SDI BUMI DAMAI', 11, 'SD', 'Swasta', 'B', 'Cangkring RT 05 RW 01 Cangkringturi Prambon ', 'bumidamaisdi@gmail.com', '-', 4, 39, -7.4504000, 112.4513000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(10, '70008767', 'SDI ASH SHIDDIQ', 5, 'SD', 'Swasta', 'B', 'Jl. KHR Abbas II RT 25 RW 01 Siwalanpanji', '-', '-', 10, 134, NULL, NULL, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(11, '70008766', 'SD UNGGULAN ZAINUDDIN', 1, 'SD', 'Swasta', 'A', 'Jl. Kolonel Sugiono Kepuh Kiriman', 'sdunggulanzainuddin@gmail.com', '087851261894', 20, 282, -7.3518000, 112.7574000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(12, '70008688', 'SD ISLAM AN NAHL', 2, 'SD', 'Swasta', 'A', 'Jl. Bringinbendo No 2 RT 03 RW 01 Taman', 'sdiislamannahl2019@gmail.com', '081240005957', 6, 87, -7.3747000, 112.6490000, 'belum', '2026-09-12 08:37:58', '2026-09-10 05:44:13', NULL),
(13, '70005491', 'SD ISLAM PLUS AL - HAQIQI', 15, 'SD', 'Swasta', 'B', 'Jl, Kayu Telon Sentul Taggulangin', '-', '-', 10, 121, -7.5139839, 112.7777209, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(14, '70005406', 'SDIT AINUL YAQIN', 11, 'SD', 'Swasta', 'A', 'Dsn. Doplangtretek Desa Bendotretek', 'sditainulyaqin4@gmail.com', '081217017796', 10, 148, -7.4459000, 112.5596000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(15, '70003042', 'SD FUTUHIYAH', 6, 'SD', 'Swasta', 'A', 'Klopo sepuluh RT 20 RW 05 Sukodono', 'sdfutuhiyah@gmail.com', '03199604326', 9, 54, -7.4073274, 112.6916112, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(16, '69988959', 'SD AL FALAH DARUSSALAM 2', 1, 'SD', 'Swasta', 'A', 'Jl. Raya Nusa Indah Blok D-1 Wisma Tropodo', 'alfalah.darussalam2@yahoo.com', '8672828', 26, 579, -7.3551770, 112.7619730, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(17, '69988235', 'SD MUHAMMADIYAH 1 CANDI LABSCHOOL UMSIDA', 18, 'SD', 'Swasta', 'A', 'Jl. Sidodadi no 1983 Sudio Sidodadi Kec. Candi', 'sdm1candilabschoolumsida@gmail.com', '081335535904', 23, 538, -7.4590000, 112.6847000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(18, '69986809', 'SDI RAUDLATUL JANNAH 2', 1, 'SD', 'Swasta', 'A', 'Jl. Jatisari No 14 A RT 04 RW 04 Pepelegi', 'sdiraudlatuljannah2@gmail.com', '8549449', 29, 474, -7.3633000, 112.7189000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(19, '69986805', 'SD JIDDAN QIRAATI', 4, 'SD', 'Swasta', 'B', 'Dukuh Dadap, Semampir, Kec. Sedati, Kabupaten Sidoarjo, Jawa Timur 61253', 'sdjiddanqiraati@gmail.com', '03199688372', 11, 141, -7.3669000, 112.7786000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(20, '69986804', 'SDIT AL AQSHA', 7, 'SD', 'Swasta', 'B', 'Bumi Suko Indah HH 09 - 11 RT 48 RW 11  Sidoarjo', 'sditaqsha390@gmail.com', '082140543007', 10, 85, -7.4443000, 112.6752000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(21, '69985175', 'SDI TARBIYATUL UMMAH', 5, 'SD', 'Swasta', 'A', 'Jl. Sono Indah Utara III RT 04 RW 05', 'sdi.tarbiyatusshibyan@gmail.com', '081252227739', 9, 229, -7.4258320, 112.7104080, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(22, '69983823', 'SDIT MADANI EKSELENSIA', 7, 'SD', 'Swasta', 'A', 'Jalan Kemiri RT. 10/RW. 03', 'madani.sda@gmail.com', '081235597019', 19, 175, -7.4365000, 112.7309000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(23, '69978693', 'SD TAHFIDZ QURAN AL VIRTUE', 1, 'SD', 'Swasta', 'B', 'Jl. Wadungasri Dalem 170 Waru', 'sdtqalviertu@gmail.com', '0318662381', 3, 14, -7.3411810, 112.7703300, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(24, '69978462', 'SD HAFIDZ AL QURAN', 13, 'SD', 'Swasta', 'B', 'Dsn. Gempol Sampurno RT 03 RW 04 Kelurahan Porong', 'sdhafidzquran@gmail.com', '085733073233', 10, 160, -7.5444000, 112.6852000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(25, '69978396', 'SD PLUS FATIMAH AZ ZAHRO', 5, 'SD', 'Swasta', 'A', 'Siwalanpanji RT 06 RW 02 Buduran Sidoarjo', 'sdplusfaz01@gmail.com', '085156432405', 17, 410, -7.4326000, 112.7318000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(26, '69975223', 'SD ISLAM AL - FURQON', 11, 'SD', 'Swasta', 'B', 'Jl. Indrokilo No 401 RT 03 RW 02 Kedungsugo Prambon', 'sdialfurqon1@gmail.com', '085853082083', 9, 76, -7.4636000, 112.5828000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(27, '69973576', 'SD ISLAM TERPADU NURUL HIKMAH', 5, 'SD', 'Swasta', 'B', 'Perum Natura Residence DS Siwalanpanji Cluster', 'sditnurulhikmahbuduran@gmail.com', '082229242291', 27, 645, -7.4330150, 112.7346110, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(28, '69973334', 'SD MUHAMMADIYAH 4 ZAMZAM', 6, 'SD', 'Swasta', 'A', 'Dsn. Kedung RT 21 RW 06 Desa Jumputrejo', 'Sdmuhammadiyah4zamzam@gmail.com', '081216290577', 17, 388, -7.4135000, 112.6887000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(29, '69973257', 'SD MUHAMMADIYAH 2 KRIAN', 8, 'SD', 'Swasta', 'B', 'Perumdam TA-319/320 Barengkrajan', 'admsdm2krian@gmail.com', '081333294053', 23, 293, -7.3714670, 112.6077750, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(30, '69972211', 'SD ISLAMIYAH AT THOHIRIYAH', 8, 'SD', 'Swasta', 'B', 'Jl. KH. Thohir Sholeh NO 220 Jerukgamping', 'sdi.atthohiriyahkrian@yahoo.com', '03199896010', 8, 58, -7.4154000, 112.5837000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(31, '69970981', 'SD INOVATIF AL-WAHYU REWWIN', 1, 'SD', 'Swasta', 'B', 'Jl. Wedoro PP Kav. Utara No. 01 Rewwin Waru', 'alwahyurewwin@yahoo.com', '-', 8, 85, -7.3517000, 112.7467000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(32, '69970843', 'SD ISLAM AULIA', 11, 'SD', 'Swasta', 'A', 'Jl. Ronggolawe No 1 RT 01 RW 01 Desa Prambon', 'sdi.aulia@gmail.com', '087766885947', 8, 119, -7.4728000, 112.5586000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(33, '69970485', 'SD ISLAM AL AZHAR 52', 18, 'SD', 'Swasta', 'A', 'Perum Safira Garden Blok B1/1 Candi Sidoarjo', 'sdialazhar52@gmail.com', '-', 23, 438, -7.4625380, 112.6903100, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(34, '69970483', 'SD ISLAM NURUL HIKAM', 7, 'SD', 'Swasta', 'A', 'Banjarbendo RT. 06 RW. 03', 'sdislamnurulhikam@gmail.com', '081233047131', 13, 207, -7.4549880, 112.7050000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(35, '69968824', 'SD AL-ISLAM PLUS', 8, 'SD', 'Swasta', 'A', 'Jl. Kyai Mojo 18 Jeruk Gamping', 'sdalislamp@gmail.com', '0318986818', 18, 358, -7.4177000, 112.5852000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(36, '69966931', 'SD Islam A-Education', 6, 'SD', 'Swasta', 'A', 'Jl. KH. Al Ahmad Ali Ds. Jogosatru RT 13 RW 04 Sukodono', 'educationsdia@gmail.com', '03199641957', 8, 113, -7.3999000, 112.6354000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(37, '69966930', 'SDI Mambaul Ulum', 1, 'SD', 'Swasta', 'A', 'Jl. Kol. Sugiono 112 Panjunan  Waru', '-', '0318674713', 12, 243, -7.3538550, 112.7548710, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(38, '69965686', 'SD Multilingual Anak Saleh', 4, 'SD', 'Swasta', 'A', 'Jl. Mbah Joyo Suto No 30-33 Bonosari Sedati', 'sdmassedati@gmail.com', '082131646946', 10, 124, -7.3657000, 112.7519000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(39, '69965447', 'SD Plus Cahaya Budaya', 12, 'SD', 'Swasta', 'B', 'Jl. Nusa Indah RT 09 RW 04 Jenggot Krembung', 'sdcahayabudaya@gmail.com', '081332728279', 10, 115, -7.5174000, 112.6570000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(40, '69965440', 'SD Antawirya Islamic Javanese School', 8, 'SD', 'Swasta', 'A', 'Ds. Junwangi RT 09 RW 03 No. 43 C', 'sdantawirya@gmail.com', '03199890253', 21, 354, -7.4017000, 112.6053000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(41, '69965439', 'SD Islam Darul Hikmah', 8, 'SD', 'Swasta', 'A', 'Mojosantren RT 11 RW 03 ', 'sdidarulhikmah@gmail.com', '085730461669', 24, 396, -7.4006430, 112.5882170, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(42, '69964766', 'SD PELITA BANGSA', 16, 'SD', 'Swasta', 'A', 'Perum Tas 3 Blok P-10 No. 40 Kepuh Kemiri', 'sdpelitabangsa2012@gmail.com', '085331322271', 8, 27, -7.4520000, 112.6399000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(43, '69961425', 'SD ALAM AL IZZAH', 8, 'SD', 'Swasta', 'A', 'Jl. Embong Kali  RT 16 RW 04 Krian', 'sdalamalizzah@gmail.com', '085102343411', 15, 291, -7.4029000, 112.5942000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(44, '69960387', 'SD MUHAMMADIYAH 1 KREMBUNG', 12, 'SD', 'Swasta', 'B', 'Jl, Raya Lemujut RT 03 RW 02 Krembung Sidoarjo', 'sdmuhammadiyah1krembung@gmail.com', '03199035799', 8, 116, -7.5041000, 112.6144000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(45, '69957347', 'SD Islam Unggulan Al Maslachah', 6, 'SD', 'Swasta', 'A', 'Dsn. Babatan RT 13 RW 03 Desa Panjunan Kec. Sukodono', 'sdislamunggulanalmaslachah@gmail.com', '082140994802', 18, 344, -7.3838220, 112.6765740, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(46, '69956632', 'SD TAHFIDH QURAN AN NAFIIYAH', 16, 'SD', 'Swasta', 'A', 'Jln. Raya Kenongo RT.01 RW.01', 'sdtahfidhqurantulangan@gmail.com', '03188580015', 9, 75, -7.4870000, 112.6534000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(47, '69952192', 'SD KRISTEN TARUNA RAJAWALI', 7, 'SD', 'Swasta', 'B', 'JL.DIPONEGORO 16', 'tarunarajawali.sda@gmail.com', '8957557', 7, 84, -7.4538000, 112.7146000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(48, '69947215', 'SD VISION', 1, 'SD', 'Swasta', 'A', 'Taman Asri Tengah Pondok Tjandra Indah No.19-21', 'official@visionschool.id', '0318684555', 21, 193, -7.3555000, 112.7884000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(49, '69943724', 'SD Islam Sabilil Falah', 6, 'SD', 'Swasta', 'C', 'Jl. KH. Mansoer RT.20 RW.06', 'sdsabililfalahsukodono@gmail.com', '0318830644', 7, 78, -7.4169580, 112.6708130, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(50, '69942683', 'SD Islam Al Kautsar', 8, 'SD', 'Swasta', 'A', 'Dsn. Sumber RT.1 RW.1', 'sdialkautsarkrian@gmail.com', '8973350', 14, 298, -7.4105000, 112.5997000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(51, '69900159', 'SD ISLAM TERPADU INSAN CENDEKIA', 8, 'SD', 'Swasta', 'B', 'Jalan KH. TOHIR SHOLEH NO.407', 'sdit.icendekia@gmail.com', '0318984130', 14, 227, -7.4151000, 112.5868000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(52, '69873943', 'SD KREATIF INSAN RABBANI', 3, 'SD', 'Swasta', 'A', 'JL.RUPAT 70', 'sdkinsanrabbani2009@gmail.com', '03199042494', 17, 322, -7.3696000, 112.7332000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(53, '60729422', 'SD ISLAM AT TAQWA', 2, 'SD', 'Swasta', 'A', 'Dusun Klutuk RT 05 RW 01', 'sdislamattaqwa7@gmail.com', '085608617980', 10, 99, -7.3939000, 112.6335000, 'belum', '2026-09-12 08:37:58', '2026-09-10 05:44:13', NULL),
(54, '20572081', 'SDIT HASANAH FIDDAROIN', 1, 'SD', 'Swasta', 'A', 'Jalan Berbek III A', 'sdit_hasanahfiddaroin@yahoo.com', '0318684407', 13, 141, -7.3487000, 112.7653000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(55, '20570933', 'SD ISLAM AL-CHUSNAINI', 6, 'SD', 'Swasta', 'A', 'PERUMAHAN PASEGAN ASRI', 'alchusnaini.adm@gmail.com', '03199036933', 36, 657, -7.3955000, 112.6912000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(56, '20570165', 'SD ANUGERAH SCHOOL', 5, 'SD', 'Swasta', 'A', 'Kawasan Sentra Niaga Kav. Re-29, Citra Garden', 'sdanugerahschool@gmail.com', '0318073097', 20, 260, -7.4376000, 112.7002000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(57, '20569647', 'SDIT Al MUNAWWIR', 10, 'SD', 'Swasta', 'B', 'DS KEDUNGBOCOK', 'sditalmunawwir@gmail.com', '085731941547', 6, 67, -7.4544000, 112.4956000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(58, '20569646', 'SD ISLAM KREATIF MUTIARA ANAK SHOLEH', 6, 'SD', 'Swasta', 'A', 'JL. RAYA PEKARUNGAN NO . 5', 'mutiara_sholeh@yahoo.co.id', '03171242599', 22, 487, -7.4047000, 112.6669000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(59, '20569034', 'SD ISLAM PLUS AS-SYAFIIYAH', 15, 'SD', 'Swasta', 'A', 'WATES LAMA', 'assyafiiyahsd@yahoo.co.id', '0318851992', 10, 144, -7.4974000, 112.6935000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(60, '20554530', 'SD NEGERI BALONGGABUS', 18, 'SD', 'Negeri', 'A', 'JL.Kupang putih', 'sdnbalonggabus@gmail.com', '-', 11, 191, -7.4915000, 112.7237000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(61, '20554529', 'SDIT EL HAQ', 5, 'SD', 'Swasta', 'A', 'Banjarsari RT:006 RW:001', 'sditelhaq@gmail.com', '0318012710', 30, 608, -7.4136000, 112.7410000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(62, '20554032', 'SD CINTA HATI', 8, 'SD', 'Swasta', 'B', 'Jl. Gubernur Sunandar P. No. 8', 'sdcintahati@gmail.co.id', '0318971077', 11, 104, -7.4017000, 112.5778000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(63, '20551763', 'SD MUHAMMADIYAH 1 PUCANGANOM SIDOARJO', 7, 'SD', 'Swasta', 'A', 'Jl. Raden Patah 91 F', 'admmuhida@gmail.com', '0318054178', 58, 1054, -7.4565000, 112.7228000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(64, '20551659', 'SD MUHAMMADIYAH 2', 16, 'SD', 'Swasta', 'A', 'JL RAYA KEMANTREN', 'sdmuda_kreatif@yahoo.com', '0318855539', 30, 485, -7.4740000, 112.6487000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(65, '20551657', 'SD ISLAM KREATIF HAWARI', 10, 'SD', 'Swasta', 'B', 'Dusun Songol', 'sdikhawaritarik@gmail.com', '085648311453', 9, 54, -7.4566000, 112.5145000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(66, '20548815', 'SD Muhammadiyah 11 Randegan', 15, 'SD', 'Swasta', 'A', 'Jl. KH. Mukmin No. 106', 'sd.muhammadiyah.randegan@gmail.com', '0318857453', 15, 184, -7.4932000, 112.6847000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(67, '20546547', 'SD PEMBANGUNAN JAYA 2', 3, 'SD', 'Swasta', 'A', 'Kawasan Taman Pasadena C 3 / 5  Perumahan Puri Surya Jaya Gedangan Sidoarjo', 'info@sdpjsidoarjo.sch.id', '0318010801', 25, 369, -7.3923000, 112.7346000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(68, '20539953', 'SD ISLAM WAHID HASYIM', 7, 'SD', 'Swasta', 'A', 'Jl. Jogoyudho No.81', 'sdiwahidhasyimsekardangan@gmail.com', '0318945268', 23, 397, -7.4642000, 112.7218000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(69, '20539952', 'SDK UNTUNG SUROPATI II', 7, 'SD', 'Swasta', 'A', 'Jl Tennis 3', 'sdkuntungsurapati2sda@gmail.com', '8953325', 11, 197, -7.4472000, 112.7095000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(70, '20539951', 'SD KATOLIK UNTUNG SUROPATI 1', 7, 'SD', 'Swasta', 'A', 'Jl. Monginsidi 31', 'grade5unsur1@gmail.com', '8961636', 16, 330, -7.4496000, 112.7238000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(71, '20539949', 'SDSK  YUSTINUS DE YACOBIS ', 8, 'SD', 'Swasta', 'A', 'Jln Ki Hajar Dewantara 35', 'sdkyudeya@gmail.com', '0318973359', 7, 214, -7.4129000, 112.5782000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(72, '20539947', 'SDIT NURUL FIKRI', 6, 'SD', 'Swasta', 'A', 'Jl. Saimbang RT 10 RW 03 ', 'nurulfikri_sdit@yahoo.com', '0318832774', 28, 510, -7.4216000, 112.6717000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(73, '20539944', 'SD HANG TUAH 10 SEDATI', 4, 'SD', 'Swasta', 'A', 'Tangkuban Perahu No.5 Juanda', 'juandahangtuah@ymail.com', '0318667208', 30, 492, -7.3839000, 112.7662000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(74, '20539943', 'SDBUNGA', 1, 'SD', 'Swasta', 'B', 'Delta Sari Indah Bd 01', 'sdbungadeltasari@gmail.com', '03185589342', 5, 18, -7.3614000, 112.7345000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(75, '20539942', 'SD AL MUSLIM', 1, 'SD', 'Swasta', 'A', 'Jalan Raya Wadungasri 39 F Waru Sidoarjo', 'info@almuslim.or.id', '0318681416', 50, 637, -7.3458000, 112.7716000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(76, '20539941', 'SD AL-HUDA', 1, 'SD', 'Swasta', 'A', 'Jl. Raya Wadungasri No. 17', 'yayasanalhudawaru@gmail.com', '0318681911', 9, 104, -7.3439000, 112.7683000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(77, '20539940', 'SD AL FALAH ASSALAM', 1, 'SD', 'Swasta', 'A', 'Jl. Raya Wisma Tropodo FG-20', 'admin@sdalfalahassalam.sch.id', '0318684277', 54, 627, -7.3555000, 112.7557000, 'belum', '2026-09-11 20:42:56', '2026-09-10 05:44:13', NULL),
(78, '20539938', 'SD KRISTEN PETRA 12', 7, 'SD', 'Swasta', 'A', 'Jalan Untung Suropati 27-A', 'sd12@pppkpetra.or.id', '0318924979', 33, 552, -7.4471000, 112.7205000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(79, '20539936', 'SD NEGERI WONOPLINTAHAN 2', 11, 'SD', 'Negeri', 'A', 'Jl. Diponegoro No. 4 Prambon - Sidoarjo', 'sdnwonoplintahandua@gmail.com', '0318987564', 17, 398, -7.4513000, 112.5688000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(80, '20539934', 'SD NEGERI WIROBITING 2', 11, 'SD', 'Negeri', 'A', 'Wirobiting', 'bitingloro@gmail.com', '0318986837', 9, 211, -7.4812000, 112.5839000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(81, '20539933', 'SD NEGERI WEDORO', 1, 'SD', 'Negeri', 'A', 'Jl. Wedoro Pp No.100 Sidoarjo', 'sdnwedoro_521@yahoo.com', '0318541775', 22, 493, -7.3476000, 112.7474000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(82, '20539931', 'SD NEGERI TROMPOASRI 3', 14, 'SD', 'Negeri', 'B', 'JL. AHMAD YANI 589', 'sdntrompoasri3jabon@gmail.com', '-', 8, 178, -7.5641000, 112.7431000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(83, '20539929', 'SD NEGERI TROMPOASRI 1', 14, 'SD', 'Negeri', 'B', 'Trompoasri', 'sdntrompoasrii94@gmail.com', '-', 8, 119, -7.5693000, 112.7361000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(84, '20539928', 'SD NEGERI TAMBAK KALISOGO 2', 14, 'SD', 'Negeri', 'B', 'Tambak Kalisogo', 'sdntambakkalisogo2@gmail.com', '-', 9, 116, -7.5467000, 112.7565000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(85, '20539927', 'SD NEGERI TAMBAK KALISOGO 1', 14, 'SD', 'Negeri', 'B', 'Jl. Kepiting 17 Tambak Kalisogo', 'sdnxsogo1@gmail.com', '085850270691', 8, 68, -7.5406000, 112.7925000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(86, '20539926', 'SD NEGERI SURUH', 6, 'SD', 'Negeri', 'A', 'Jl. Imam Bonjol', 'sdn_suruh@yahoo.com', '0318832233', 13, 264, -7.4074000, 112.6832000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(87, '20539922', 'SD NEGERI SARIROGO', 7, 'SD', 'Negeri', 'A', 'Jl. Raya Sarirogo N0. 2', 'sdnsarirogo@gmail.com', '0318078356', 9, 129, -7.4280000, 112.6814000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(88, '20539921', 'SD NEGERI SAMBUNGREJO', 6, 'SD', 'Negeri', 'A', 'Jl. Raya Sambungrejo', 'sdnsambungrejo.skd@gmail.com', '0318831600', 11, 215, -7.3903000, 112.6488000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(89, '20539920', 'SD NEGERI PRANTI', 4, 'SD', 'Negeri', 'B', 'Jl Kh Hasbullah No 8', 'sdnpranti554@gmail.com', '0318683109', 8, 173, -7.3683000, 112.7810000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(90, '20539919', 'SD NEGERI PEPELEGI 1', 1, 'SD', 'Negeri', 'A', 'Jl. Anjasmoro No. 8', 'sdn_pepelegi1@yahoo.com', '0318534255', 12, 313, -7.3667000, 112.7237000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(91, '20539918', 'SD NEGERI PEKARUNGAN', 6, 'SD', 'Negeri', 'A', 'Jl. Diponegoro No. 34', 'sdn_pekarungan@yahoo.com', '03135919008', 18, 393, -7.4053000, 112.6706000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(92, '20539917', 'SD NEGERI PADEMONEGORO', 6, 'SD', 'Negeri', 'A', 'Pademonegoro ,RT.05 / RW.02', 'sdnpademosda@gmail.com', '0318832626', 16, 291, -7.4014000, 112.6637000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(93, '20539915', 'SD NEGERI NGARES REJO', 6, 'SD', 'Negeri', 'A', 'Jl Raya Ngaresrejo No I', 'sdn.ngaresrejo360@gmail.com', '0318831995', 13, 236, -7.3941000, 112.6378000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(94, '20539914', 'SD NEGERI MASANGAN WETAN', 6, 'SD', 'Negeri', 'A', 'Jl. Balai Desa Masangan Wetan', 'sdn.masangan.wetan00@gmail.com', '03199660811', 15, 248, -7.4047000, 112.6919000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(95, '20539912', 'SD NEGERI MASANGANKULON', 6, 'SD', 'Negeri', 'A', 'Jalan Peterongan', 'sdsnmaskul2053991@gmail.com', '0317871927', 24, 539, -7.3826000, 112.6892000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(96, '20539911', 'SD NEGERI KWANGSAN', 4, 'SD', 'Negeri', 'B', 'Jalan Mangkurejo No. 3a Kwangsan', 'sdnkwangsan1@gmail.com', '0318914696', 17, 375, -7.3976000, 112.7629000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(97, '20539909', 'SD NEGERI KRIAN 1', 8, 'SD', 'Negeri', 'B', 'Jalan Ki Hajar Dewantara', 'sdnkrian1@gmail.com', '03199899135', 8, 96, -7.4132000, 112.5781000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(98, '20539908', 'SD NEGERI KLOPOSEPULUH 2', 6, 'SD', 'Negeri', 'B', 'Kloposepuluh', 'sdnkloposepuluhii@yahoo.com', '0318913925', 8, 202, -7.4012000, 112.6965000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(99, '20539907', 'SD NEGERI KEDUNGREJO 2', 14, 'SD', 'Negeri', 'A', 'Kedungrejo', 'sdn.kedungrejo434@yahoo.com', '085954370688', 8, 145, -7.5698000, 112.7483000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(100, '20539906', 'SD NEGERI KEDUNGPANDAN 1', 14, 'SD', 'Negeri', 'A', 'Jln. Diponegoro No 14 RT. 04 RW. 02', 'sdn.kedungpandan@gmail.com', '03436530550', 8, 170, -7.5700000, 112.7690000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(101, '20539905', 'SD NEGERI KEDUNGCANGKRING', 14, 'SD', 'Negeri', 'A', 'Kedungcangkring', 'sdnkedungcangkringjabonsda@gmail.com', '-', 9, 180, -7.5499000, 112.7185000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(102, '20539904', 'SD NEGERI KEBONAGUNG 2', 6, 'SD', 'Negeri', 'A', 'JL. RAYA KEBONAGUNG, KEC.SUKODONO, KAB.SIDOARJO.', 'sdnkebonagung2sukodono@gmail.com', '03199641040', 16, 330, -7.4559000, 112.6719000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(103, '20539903', 'SD NEGERI KEBOGUYANG', 14, 'SD', 'Negeri', 'B', 'Jl. S. Notodiharjo No 2', 'sdnkeboguyangjabon@gmail.com', '-', 9, 201, -7.5437000, 112.7322000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(104, '20539901', 'SD NEGERI JUMPUTREJO', 6, 'SD', 'Negeri', 'A', 'Jumputrejo', 'sdnjumputrejo1@gmail.com', '0318833195', 23, 514, -7.4135000, 112.6947000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(105, '20539898', 'SD NEGERI JERUKLEGI 1', 9, 'SD', 'Negeri', 'A', 'Jln Trunojoyo Rt 06 Rw 02', 'sdnjeruklegi001@gmail.com', '085852078830', 7, 84, -7.4048000, 112.5656000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(106, '20539897', 'SD NEGERI JATI ALUN ALUN', 11, 'SD', 'Negeri', 'A', 'Jl. Jati Alun Alun', 'sdnjatialunalun1@gmail.com', '085655130378', 9, 127, -7.4670000, 112.6110000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(107, '20539896', 'SD NEGERI GAMPINGROWO 2', 10, 'SD', 'Negeri', 'B', 'Gampingrowo', 'sdngampingrowo2@gmail.com', '-', 8, 98, -7.4460000, 112.4919000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(108, '20539895', 'SD NEGERI GAMPING 2', 8, 'SD', 'Negeri', 'B', 'Jl. Pekalongan', 'sdngamping02@gmail.com', '081234405445', 8, 139, -7.4210000, 112.5965000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(109, '20539894', 'SD NEGERI CEMANDI', 4, 'SD', 'Negeri', 'A', 'Jalan Soponyono RT 1 RW 1 No. 10 ', 'sdncemandi@gmail.com', '8911523', 19, 389, -7.3953000, 112.7873000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(110, '20539892', 'SD NEGERI CANGKRINGSARI ', 6, 'SD', 'Negeri', 'B', 'Jl Raya Cangkringsari', 'sdncangkringsari@gmail.com', '0318831503', 9, 175, -7.4000000, 112.6455000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(111, '20539891', 'SD NEGERI BUNCITAN', 4, 'SD', 'Negeri', 'A', 'JL. RAYA BUNCITAN NO. 76', 'sdnbuncitan@gmail.com', '0318911792', 25, 492, -7.3958000, 112.7792000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(112, '20539889', 'SD NEGERI BANJAR KEMUNING', 4, 'SD', 'Negeri', 'A', 'Jln. Tawes No. 29 ', 'sdnbanjarkemuning123@gmail.com', '0318917280', 8, 119, -7.3852000, 112.8082000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(113, '20539887', 'SD NEGERI BANGSRI', 6, 'SD', 'Negeri', 'A', 'JL. Balai Desa Bangsri', 'sdnbangsrisukodono@gmail.com', '085646518474', 9, 163, -7.3862000, 112.6644000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(114, '20539886', 'SD NEGERI BALONGTANI', 14, 'SD', 'Negeri', 'A', 'Balongtani', 'sdnbalongtani@gmail.com', '089679957788', 9, 152, -7.5518000, 112.7466000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(115, '20539885', 'SD NEGERI BAKUNGPRINGGODANI', 9, 'SD', 'Negeri', 'A', 'Jl. Kenanga Desa Bakung Pringgodani', 'sdnbakungpringgodani@gmail.com', '-', 9, 177, -7.4123000, 112.5080000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(116, '20539884', 'SD NEGERI BAKALAN WRINGINPITU', 9, 'SD', 'Negeri', 'A', 'Jl. PISANG', 'bakalanwr7@gmail.com', '-', 8, 159, -7.4130000, 112.5353000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(117, '20539883', 'SD NEGERI ANGGASWANGI 2', 6, 'SD', 'Negeri', 'A', 'Jl. Putra Bangsa, Ds. Anggaswangi', 'sdnanggas2@gmail.com', '0318831547', 15, 364, -7.4157000, 112.6816000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(118, '20539882', 'SD MUTIARA BUNDA 2', 2, 'SD', 'Swasta', 'A', 'Citra Harmoni Blok B 14 - 16 Trosobo', 'bundasekolahmutiara2@gmail.com', '03199786296', 8, 142, -7.3754887, 112.6441818, 'belum', '2026-09-12 08:37:58', '2026-09-10 05:44:13', NULL),
(119, '20539880', 'SD MUHAMMADIYAH 5 PORONG', 13, 'SD', 'Swasta', 'A', 'Jl. Raya Lajuk ( Timur Pom Bensin )', 'admin@sdmudimaporong.sch.id', '034348450075', 10, 135, -7.5285000, 112.6765000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(120, '20539879', 'SD MUHAMMADIYAH 3 ', 2, 'SD', 'Swasta', 'A', 'Jl. Taruna VIII C Kav. 282-288 RT.05 RW.03', 'sdmuhammadiyahikrom@gmail.com', '0318538441', 39, 628, -7.3693000, 112.7078000, 'belum', '2026-09-12 08:37:58', '2026-09-10 05:44:13', NULL),
(121, '20539876', 'SD LELY', 7, 'SD', 'Swasta', 'A', 'Jl. Jaksa Agung R. Soeprapto No. 15 A', 'sds.lely@gmail.com', '0318945250', 7, 10, -7.4484000, 112.7210000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(122, '20539873', 'SD ISLAM SABILILLAH', 7, 'SD', 'Swasta', 'A', 'Perum Gading Fajar 2 Blok BI - BIII', 'sdislamsabilillahsda@gmail.com', '0318064207', 64, 1057, -7.4657000, 112.7034000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(123, '20539872', 'SD CENDEKIA', 7, 'SD', 'Swasta', 'A', 'Jl Cendekia No 1', 'sdscendekia04@gmail.com', '085174054243', 16, 240, -7.4664000, 112.7148000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(124, '20537092', 'SD NEGERI LEMAHPUTRO 3', 7, 'SD', 'Negeri', 'A', 'Jl. Pahlawan IX', 'sdn.lemahputro3@yahoo.com', '0318056920', 17, 241, -7.4522000, 112.7058000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(125, '20537091', 'SD NEGERI WIROBITING 1', 11, 'SD', 'Negeri', 'A', 'Jl. Penitian', 'sdnwirobiting01@gmail.com', '0318985058', 10, 109, -7.4814000, 112.5836000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(126, '20537089', 'SD NEGERI WATUTULIS 1', 11, 'SD', 'Negeri', 'B', 'Watutulis', 'swatutulis@gmail.com', '0318971340', 8, 107, -7.4355000, 112.5736000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(127, '20537088', 'SD NEGERI WATESARI', 9, 'SD', 'Negeri', 'B', 'Watesari', 'sdnwatesari@gmail.com', '0318983675', 8, 96, -7.4226000, 112.5546000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(128, '20537085', 'SD NEGERI SUMPUT', 7, 'SD', 'Negeri', 'A', 'Jl Raya Sumput', 'sdnsumputsidoarjo@gmail.com', '8070133', 19, 414, -7.4337000, 112.6818000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(129, '20537084', 'SD NEGERI SUMOKEMBANGSRI 1', 9, 'SD', 'Negeri', 'B', 'Jalan Mulyo Utomo ', 'sdnsumokembangsri_1@yahoo.co.id', '0895377177801', 9, 182, -7.4326000, 112.5078000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(130, '20537083', 'SD NEGERI SIMPANG', 11, 'SD', 'Negeri', 'A', 'Desa Simpang', 'sdnsimpangprambon@gmail.com', '-', 8, 96, -7.4878000, 112.5916000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(131, '20537082', 'SD NEGERI SIMOGIRANG 2', 11, 'SD', 'Negeri', 'A', 'Simogirang', 'sdnsimogirang02@gmail.com', '081231256786', 8, 124, -7.4496000, 112.5852000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(132, '20537081', 'SD NEGERI SIDOKARE 4', 7, 'SD', 'Negeri', 'A', 'Jl.Ir.H.Juanda No.12A Taman Jenggala Kec.Sidoarjo', 'sdnsidokareivsda@gmail.com', '0318943731', 17, 291, -7.4657000, 112.7142000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(133, '20537079', 'SD NEGERI SEDURI 1', 9, 'SD', 'Negeri', 'B', 'Desa Seduri', 'sdnseduri1@gmail.com', '-', 7, 89, -7.4148000, 112.5167000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(134, '20537078', 'SD NEGERI SIDOKLUMPUK', 7, 'SD', 'Negeri', 'A', 'Jl. Monginsidi No. 23', 'sdn.sidoklumpuk.sidoarjo@gmail.com', '0318921805', 30, 689, -7.4488000, 112.7248000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(135, '20537076', 'SD NEGERI PEJANGKUNGAN', 11, 'SD', 'Negeri', 'A', 'Ds Pejangkungan', 'sdnpejangkungan@gmail.com', '085731241963', 8, 126, -7.4791000, 112.5919000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(136, '20537075', 'SD NEGERI KEMANGSEN 02', 9, 'SD', 'Negeri', 'A', 'Sirapan Kemangsen', 'sdnkemangsen2@gmail.com', '03199895123', 8, 166, -7.4127000, 112.5616000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(137, '20537074', 'SD NEGERI KEMANGSEN 1', 9, 'SD', 'Negeri', 'A', 'Jl Raya Kemangsen No 66', 'sdnkemangsen001@gmail.com', '-', 11, 272, -7.4119000, 112.5667000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(138, '20537073', 'SD NEGERI KEDUNGSUGO 2', 11, 'SD', 'Negeri', 'A', 'Jl. Nakula No. 05', 'kedungsugo02@gmail.com', '085706678114', 9, 152, -7.4700000, 112.5823000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(139, '20537072', 'SD NEGERI KEDUNGSUGO 1', 11, 'SD', 'Negeri', 'A', 'Jalan Indrokilo No.104 Desa Kedungsugo', 'sdnegerikedungsugo1@gmail.com', '081332660004', 8, 154, -7.4632000, 112.5836000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(140, '20537071', 'SD NEGERI KEDUNGKEMBAR', 11, 'SD', 'Negeri', 'B', 'Jl Embong Wungu No 1', 'sdnkedungkembar2016@gmail.com', '085850425374', 8, 86, -7.4648000, 112.5921000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(141, '20537070', 'SD NEGERI KAJARTENGGULI', 11, 'SD', 'Negeri', 'A', 'Kajartengguli', 'sdnkajartengguli2@gmail.com', '-', 9, 115, -7.4672000, 112.5644000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(142, '20537069', 'SD NEGERI JEDONG CANGKRING', 11, 'SD', 'Negeri', 'B', 'Jl Raya Waringin No 1', 'jedongcangkring@ymail.com', '0318986638', 9, 132, -7.4569000, 112.6051000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(143, '20537067', 'SD NEGERI JATIKALANG', 11, 'SD', 'Negeri', 'A', 'Jatikalang', 'jatikalangsdn@gmail.com', '-', 8, 148, -7.4763000, 112.6083000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(144, '20537065', 'SD NEGERI GEDANGROWO', 11, 'SD', 'Negeri', 'A', 'Gedangrowo', 'sdngedangrowo@gmail.com', '0318985248', 9, 167, -7.4781000, 112.5731000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(145, '20537048', 'SD NEGERI GAMPANG', 11, 'SD', 'Negeri', 'A', 'Jl. Zainal Abidin RT 6 RW 2 Desa Gampang', 'sdn_gampang@yahoo.com', '-', 8, 103, -7.4820000, 112.6038000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(146, '20537047', 'SD NEGERI GAGANGKEPUHSARI', 9, 'SD', 'Negeri', 'B', 'Gagangkepuhsari', 'sdngagangkepuhsari01@gmail.com', '-', 7, 49, -7.4266000, 112.5364000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(147, '20537046', 'SD NEGERI CEMENGKALANG', 7, 'SD', 'Negeri', 'A', 'Jl Raya Cemengkalang', 'sdncemengkalang001@gmail.com', '0318965684', 22, 551, -7.4422000, 112.6863000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(148, '20537045', 'SD NEGERI CEMENGBAKALAN 1', 7, 'SD', 'Negeri', 'B', 'Jl Balai Desa Cemeng Bakalan', 'sdncemengbakalan152@gmail.com', '0318945611', 9, 159, -7.4368000, 112.6780000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(149, '20537044', 'SD NEGERI CEMENGBAKALAN 2', 7, 'SD', 'Negeri', 'A', 'Jl Balai Desa Cemengbakalan', 'sdncemengbakalan02@gmail.com', '03199704986', 8, 115, -7.4358000, 112.6764000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(150, '20537043', 'SD NEGERI BULANG', 11, 'SD', 'Negeri', 'A', 'Jl. Raya Bulang', 'sdnbulang@gmail.com', '-', 11, 166, -7.4894000, 112.5970000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(151, '20537042', 'SD NEGERI BOGEMPINGGIR', 9, 'SD', 'Negeri', 'B', 'Jln Kalimas indah Rt 03 Rw 01', 'sdnbogempinggir2019@gmail.com', '0318984627', 8, 131, -7.4033000, 112.5164000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(152, '20537041', 'SD NEGERI BALONGBENDO', 9, 'SD', 'Negeri', 'B', 'Jln. Ki Hajar Dewantara No. 470', 'sdnbalongbendo213@gmail.com', '-', 7, 136, -7.4116000, 112.5503000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(153, '20537040', 'SD NEGERI BAKUNGTEMENGGUNGAN', 9, 'SD', 'Negeri', 'A', 'Bakungtemenggungan', 'sdn_bakungtemenggungan@yahoo.co.id', '03199894951', 9, 181, -7.4165000, 112.4997000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(154, '20537037', 'SD ISLAM TERPADU INSAN KAMIL', 7, 'SD', 'Swasta', 'A', 'Jl Pecantingan RT 12 RW 4', 'insankamil.sd@gmail.com', '8056948', 37, 731, -7.4697000, 112.7242000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(155, '20537036', 'SD KATOLIK SANTA MARIA 2', 7, 'SD', 'Swasta', 'A', 'Perum Citra Fajar Golf', 'ssanmarsd@yahoo.com', '8969975', 19, 337, -7.4668000, 112.7454000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(156, '20502415', 'SD NEGERI BANJARBENDO', 7, 'SD', 'Negeri', 'A', 'Jl Balai Desa Banjarbendo', 'sdnbendo@gmail.com', '03199715773', 22, 391, -7.4506000, 112.6935000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(157, '20502413', 'SD NEGERI BANGAH', 3, 'SD', 'Negeri', 'A', ' Jl. Singojoyo I No.59', 'sdnbangah@ymail.com', '0318530827', 21, 370, -7.3712000, 112.7192000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(158, '20502412', 'SD NEGERI BALONGMACEKAN', 10, 'SD', 'Negeri', 'B', 'Jln. BALAI DESA RT 06 RW 02', 'sdn.balongmacekan@gmail.com', '-', 8, 82, -7.4516000, 112.5117000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(159, '20502411', 'SD NEGERI BALONGGARUT', 12, 'SD', 'Negeri', 'B', 'Balonggarut Rt 05 Rw 03', 'sdnbalonggarut@gmail.com', '-', 8, 90, -7.5006000, 112.6363000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(160, '20502410', 'SD NEGERI BANJARKEMANTREN 1', 5, 'SD', 'Negeri', 'B', 'Jalan Mangun Diprojo', 'sdnbanjarkemantren1@gmail.com', '0318910206', 8, 90, -7.4134000, 112.7255000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(161, '20502409', 'SD NEGERI BANJARKEMANTREN 2', 5, 'SD', 'Negeri', 'A', 'Jalan Dewa Ruci 57', 'sdnbanjarkemantren2@gmail.com', '0318968297', 16, 333, -7.4146000, 112.7173000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(162, '20502408', 'SD NEGERI BANJARPANJI', 15, 'SD', 'Negeri', 'B', 'Banjarpanji', 'rahma.risalah@gmail.com', '085775331114', 8, 55, -7.5021000, 112.7483000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(163, '20502407', 'SD NEGERI BANJARSARI', 5, 'SD', 'Negeri', 'B', 'Jl Kh. subakir No. 5 Banjarsari Buduran', 'sdnbanjarsari55@gmail.com', '082230978923', 8, 136, -7.4138000, 112.7413000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(164, '20502406', 'SD NEGERI BANJARWUNGU 1', 10, 'SD', 'Negeri', 'B', 'Jl Wungu No 01 Desa Banjarwungu Kecamatan Tarik Kabupaten Sidoarjo', 'sdnbanjarwungu1@gmail.com', '085546289530', 8, 74, -7.4495000, 112.5392000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(165, '20502405', 'SD NEGERI BANJARWUNGU 2', 10, 'SD', 'Negeri', 'B', 'Jalan Bowojati, Dusun Kandangan, Desa Banjarwungu', 'sdnbanjarwungu02@gmail.com', '085645028096', 7, 63, -7.4444000, 112.5366000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(166, '20502404', 'SD NEGERI BARENGKRAJAN 1', 8, 'SD', 'Negeri', 'A', 'Barengkrajan RT 12 RW 04', 'barengkrajan01@gmail.com', '0318988696', 22, 422, -7.3793000, 112.6067000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(167, '20502403', 'SD NEGERI BARENGKRAJAN 2', 8, 'SD', 'Negeri', 'A', 'Jl.sidorono', 'barengkrajansdn2@gmail.com', '0318983531', 15, 272, -7.3789000, 112.6063000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(168, '20502401', 'SD NEGERI BALONGDOWO', 18, 'SD', 'Negeri', 'A', 'JL. Dr SUTOMO 27', 'sdnbalongdowo@yahoo.co.id', '0318963941', 16, 309, -7.4958000, 112.7258000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(169, '20502398', 'SD TPI GEDANGAN', 3, 'SD', 'Swasta', 'B', 'Jl. R Kanjeng Jimat', 'sdtpigedangan1@gmail.com', '0318012308', 6, 45, -7.3879000, 112.7297000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(170, '20502397', 'SD ZAINUDDIN', 1, 'SD', 'Swasta', 'A', 'Jl. Ijen Ngeni', 'sdzainuddin1998@gmail.com', '0318679893', 29, 687, -7.3533000, 112.7549000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(171, '20502396', 'SD ISLAM RAUDLATUL JANNAH', 1, 'SD', 'Swasta', 'A', 'Jl. Jatisari Permai X/2', 'sdiraudlatuljannahsda@gmail.com', '8549449', 32, 648, -7.3634000, 112.7189000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(172, '20502395', 'SD ISLAM SABILIL HUDA', 18, 'SD', 'Swasta', 'A', 'Jl. Singokarso 54', 'sabililhuda.2002@gmail.com', '081227279335', 13, 75, -7.4960000, 112.7100000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(173, '20502394', 'SDIT NURUL ISLAM', 12, 'SD', 'Swasta', 'B', 'Jl. Belakang Ps. Krembung Arah Barat No. 01', 'sditnurulislamkrembung@yahoo.com', '0318852913', 15, 188, -7.5078000, 112.6252000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(174, '20502389', 'SD NEGERI ANGGASWANGI 1', 6, 'SD', 'Negeri', 'A', 'Jl. Anggaswangi', 'sdn_anggaswangi1@yahoo.co.id', '0318832034', 8, 197, -7.4225000, 112.6864000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(175, '20502388', 'SD NEGERI BORO', 15, 'SD', 'Negeri', 'A', 'Jl Mangga No. 02', 'sdnegeriboro@gmail.com', '0318928355', 15, 229, -7.4959000, 112.6988000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(176, '20502387', 'SD MUHAMMADIYAH 2 WARU', 1, 'SD', 'Swasta', 'A', 'Jl. Jend. S. Parman III / 5', 'Sdmduakreatif@gmail.com', '0318543261', 9, 164, -7.3573000, 112.7283000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(177, '20502386', 'SD NEGERI BEBEKAN', 2, 'SD', 'Negeri', 'A', 'Jl. Bebekan Baru Gg Masjid ', 'sdnbebekantaman@gmail.com', '0317871835', 11, 208, -7.3433410, 112.6990550, 'belum', '2026-09-12 08:37:58', '2026-09-10 05:44:13', NULL),
(178, '20502384', 'SD NEGERI BULUSIDOKARE', 7, 'SD', 'Negeri', 'A', 'Jl. Panglima Hidayat No. 6', 'uptsdnbulusidokare@gmail.com', '0318943287', 16, 274, -7.4591000, 112.7234000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(179, '20502383', 'SD NEGERI BUNGURASIH', 1, 'SD', 'Negeri', 'A', 'Jl. Bungurasih Barat No. 156 Waru Sidoarjo', 'sdnbungurasih@gmail.com', '0318538857', 22, 535, -7.3507000, 112.7133000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(180, '20502381', 'SD NEGERI CANDI', 18, 'SD', 'Negeri', 'A', 'Jl Kedungpeluk 41', 'sdncandi@rocketmail.com', '0318057084', 23, 533, -7.4791000, 112.7157000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(181, '20502379', 'SD NEGERI CANDINEGORO', 17, 'SD', 'Negeri', 'A', 'Candinegoro', 'sdncandinegoroofficial@gmail.com', '0318971505', 8, 140, -7.4095000, 112.6195000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(182, '20502378', 'SD NEGERI CANDIPARI 1', 13, 'SD', 'Negeri', 'B', 'Jl. Purbakala N0. 09', 'sdncandipari1@yahoo.com', '0318857695', 10, 109, -7.5297000, 112.6920000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(183, '20502377', 'SD NEGERI CANDIPARI 2', 13, 'SD', 'Negeri', 'A', 'Jl. Purbakala No. 86', 'sdncandipari2@yahoo.com', '0318857692', 12, 200, -7.5165000, 112.6818000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(184, '20502376', 'SD NEGERI CANGKRING 1', 12, 'SD', 'Negeri', 'B', 'Cangkring', 'sdncangkring1@gmail.com', '03199624509', 8, 92, -7.5009000, 112.6115000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(185, '20502375', 'SD NEGERI CANGKRING 2', 12, 'SD', 'Negeri', 'A', 'Cangkring', 'sdncangkringduad@yahoo.com', '0318857654', 8, 48, -7.4968000, 112.6083000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(186, '20502374', 'SD NEGERI CANGKRINGTURI', 11, 'SD', 'Negeri', 'A', 'Jl. Achmad Yani', 'cangkringturi@gmail.com', '085706064708', 8, 108, -7.4487000, 112.5922000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(187, '20502373', 'SD NEGERI CELEP', 7, 'SD', 'Negeri', 'B', 'Jl. Mojopahit no. 135', 'sdncelepsaja@gmail.com', '0318942504', 8, 112, -7.4654000, 112.7169000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(188, '20502372', 'SD NEGERI BUDURAN', 5, 'SD', 'Negeri', 'A', 'Jalan Raya Buduran', 'buduran_sdn@yahoo.co.id', '0318961970', 13, 235, -7.4272000, 112.7222000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(189, '20502371', 'SD NEGERI BRINGINBENDO 2', 2, 'SD', 'Negeri', 'A', 'JL. INDUSTRI NO. 03', 'sdnbringinbendo2@gmail.com', '0317860914', 9, 136, -7.3728000, 112.6598000, 'belum', '2026-09-12 08:37:58', '2026-09-10 05:44:13', NULL),
(190, '20502367', 'SD NEGERI BENDOTRETEK 1', 11, 'SD', 'Negeri', 'A', 'Jl. Balai Desa', 'sdnbendotretek@gmail.com', '082257173720', 16, 307, -7.4453000, 112.5663000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(191, '20502365', 'SD NEGERI BERBEK', 1, 'SD', 'Negeri', 'A', 'Jl. Berbek  I G  No. 1', 'sdnberbek@yahoo.co.id', '0318672553', 25, 432, -7.3449000, 112.7606000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(192, '20502363', 'SD NEGERI BETRO', 4, 'SD', 'Negeri', 'A', 'Jln. Garuda No. 74', 'Sdnbetrosedati494@gmail.com', '0318676485', 16, 281, -7.3893000, 112.7601000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(193, '20502362', 'SD NEGERI BLIGO', 18, 'SD', 'Negeri', 'A', 'Jl. Wijaya Kusuma 45', 'sdnbligo.candi1sidoarjo@gmail.com', '0318052992', 15, 301, -7.4753000, 112.7218000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(194, '20502359', 'SD NEGERI BOHAR', 2, 'SD', 'Negeri', 'A', 'Jl Raya Bohar No. 96', 'sdnbohar96.taman@gmail.com', '0318557449', 7, 155, -7.3860000, 112.7032000, 'belum', '2026-09-12 08:37:58', '2026-09-10 05:44:13', NULL),
(195, '20502358', 'SD NEGERI BRINGINBENDO 1', 2, 'SD', 'Negeri', 'A', 'BRINGINBENDO RT.04 RW.01', 'sdn_bringinbendo1@yahoo.co.id', '0317879694', 14, 368, -7.3752000, 112.6529000, 'belum', '2026-09-12 08:37:58', '2026-09-10 05:44:13', NULL),
(196, '20502314', 'SD AL ISHLAH', 12, 'SD', 'Swasta', 'A', 'Rejeni', 'sd.alishlahrejeni@gmail.com', '0318854890', 30, 622, -7.5126000, 112.6398000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(197, '20502313', 'SD DARUL ULUM', 1, 'SD', 'Swasta', 'A', 'Jl. Bungurasih Tengah No. 5', 'sd.darululum74@gmail.com', '0318541349', 18, 310, -7.3516000, 112.7200000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(198, '20502311', 'SD HANG TUAH 11 GEDANGAN', 3, 'SD', 'Swasta', 'A', 'JL. RENCONG NO. 7 RUMDIS TNI - AL', 'sdhangtuah11_sidoarjo@yahoo.co.id', '0318911570', 18, 251, -7.4026000, 112.7249000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(199, '20502310', 'SD HANGTUAH 9', 18, 'SD', 'Swasta', 'A', 'Perum TNI AL Blok B XVI/16', 'sdhangtuah9@ymail.com', '0318953326', 17, 194, -7.4785000, 112.6995000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(200, '20502309', 'SDI PANCASILA', 8, 'SD', 'Swasta', 'A', 'Ponokawan Rt 08 Rw 03', 'sdislampancasila@gmail.com', '0318970989', 15, 248, -7.3963000, 112.5980000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(201, '20502308', 'SD KATOLIK SANTO YUSUP', 1, 'SD', 'Swasta', 'A', 'Jl Brantas Wisma Tropodo', 'sdksantoyusuptropodo@gmail.com', '0318661746', 32, 676, -7.3623000, 112.7593000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(202, '20502305', 'SD MAARIF KETEGAN', 2, 'SD', 'Swasta', 'B', 'Jl. Raya Ketegan No. 31', 'sdmaarifketegan@yahoo.co.id', '0317872310', 15, 325, -7.3472000, 112.7016000, 'belum', '2026-09-12 08:37:58', '2026-09-10 05:44:13', NULL),
(203, '20502304', 'SD MAARIF TAMAN', 2, 'SD', 'Swasta', 'B', 'Jl.Raya Taman Gg.II ', 'sdmaariftamanyes@gmail.com', '03199782096', 8, 182, -7.3532000, 112.6997000, 'belum', '2026-09-12 08:37:58', '2026-09-10 05:44:13', NULL),
(204, '20502303', 'SD MAARIF YPM Wonocolo', 2, 'SD', 'Swasta', 'A', 'Wonocolo VI / 103 Taman Sepanjang', 'sdypm@ymail.com', '0317874737', 17, 266, -7.3457000, 112.6935000, 'belum', '2026-09-12 08:37:58', '2026-09-10 05:44:13', NULL),
(205, '20502302', 'SD MUHAMMADIYAH 1 KRIAN', 8, 'SD', 'Swasta', 'A', 'Jl. Kihajar Dewantara No 1 Krian', 'sd.mutukrian@gmail.com', '0318977007', 30, 606, -7.4149000, 112.5782000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(206, '20502301', 'SD AL FALAH DARUSSALAM', 1, 'SD', 'Swasta', 'A', 'Jl. Anggrek No.1 Wisma Tropodo', 'alfalah.darussalam@yahoo.com', '8672828', 31, 732, -7.3553000, 112.7618000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(207, '20502286', 'SD MUHAMMADIYAH 10', 9, 'SD', 'Swasta', 'A', 'Jl. Mayjend Bambang Yuwono', 'sd.muhammadiyah@gmail.com', '0318983775', 15, 266, -7.4209000, 112.4883000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(208, '20502283', 'SD NEGERI KALISAMPURNO 2', 15, 'SD', 'Negeri', 'B', 'Jl Diponegoro 08', 'sdnegerikalisampurno2@gmail.com', '0318850859', 7, 90, -7.5113000, 112.6927000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(209, '20502282', 'SD NEGERI KALITENGAH 1', 15, 'SD', 'Negeri', 'A', 'Kalitengah', 'sdnegeri.kalitengah1@gmail.com', '0318947547', 22, 363, -7.5040000, 112.7121000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(210, '20502279', 'SD NEGERI KANDANGAN', 12, 'SD', 'Negeri', 'B', 'Jl. Raya Kandangan', 'sdnkandangan45@gmail.com', '-', 9, 74, -7.5101000, 112.6345000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(211, '20502278', 'SD NEGERI KARANGTANJUNG', 18, 'SD', 'Negeri', 'A', 'Desa Karangtanjung', 'sdnkarangtanjung91@gmail.com', '0318060973', 7, 168, -7.4885000, 112.6945000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(212, '20502277', 'SD NEGERI KARANGBONG ', 3, 'SD', 'Negeri', 'A', 'Jl. Ontosari', 'Sdnkarangbong22@gmail.com', '8911085', 19, 408, -7.4058000, 112.7142000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(213, '20502275', 'SD NEGERI KARANG PURI 2', 17, 'SD', 'Negeri', 'A', 'Karangpuri', 'sdn.karangpuri2@gmail.com', '0318833695', 9, 111, -7.4131000, 112.6319000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(214, '20502274', 'SD NEGERI KARANGPURI 1', 17, 'SD', 'Negeri', 'A', 'Karangpuri', 'sdkarangpuri1@gmail.com', '0318975800', 11, 229, -7.4043000, 112.6326000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(215, '20502273', 'SD NEGERI KATERUNGAN', 8, 'SD', 'Negeri', 'A', 'Katerungan', 'sdnkaterungan@gmail.com', '0318971767', 21, 462, -7.4184000, 112.5834000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(216, '20502272', 'SD NEGERI KEBAKALAN', 13, 'SD', 'Negeri', 'A', 'Jl. Margo Utomo No.22 ,Kebakalan, Kecamatan Porong', 'sdnkebakalan@yahoo.co.id', '0343850239', 12, 208, -7.5306000, 112.6748000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(217, '20502271', 'SD NEGERI KEBARON', 16, 'SD', 'Negeri', 'B', 'Kebaron', 'sdnkebaron443@gmail.com', '8850774', 10, 216, -7.4890000, 112.6258000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(218, '20502269', 'SD NEGERI KALIPECABEAN', 18, 'SD', 'Negeri', 'A', 'Kalipecabean', 'SDNKALIPECABEAN@GMAIL.COM', '03199700825', 26, 479, -7.4830000, 112.7387000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(219, '20502268', 'SD NEGERI JIMBARAN WETAN', 17, 'SD', 'Negeri', 'A', 'Jimbaran Wetan', 'sdn_jimbaranwetan@yahoo.co.id', '-', 15, 318, -7.4442000, 112.6336000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(220, '20502267', 'SD NEGERI JUNWANGI', 8, 'SD', 'Negeri', 'A', 'Jl. Raya Junwangi No. 2', 'sdnjunwangi@gmail.com', '0318975419', 16, 359, -7.4053000, 112.6053000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(221, '20502265', 'SD NEGERI JUWETKENONGO', 13, 'SD', 'Negeri', 'A', 'Jln. Bhayangkari No. 328 Porong', 'sdjporong328@gmail.com', '0343852527', 20, 355, -7.5400000, 112.6893000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(222, '20502263', 'SD NEGERI KAJEKSAN', 16, 'SD', 'Negeri', 'B', 'Kajeksan', 'sdnegerikajeksan@gmail.com', '0318852218', 8, 60, -7.4713000, 112.6371000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(223, '20502261', 'SD NEGERI KALANGANYAR', 4, 'SD', 'Negeri', 'A', 'Jl. Raya Kalanganyar No. 35', 'sdnkalanganyarsedati@yahoo.co.id', '8911551', 8, 181, -7.3974000, 112.7937000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(224, '20502260', 'SD NEGERI KALIDAWIR', 15, 'SD', 'Negeri', 'A', 'KALIDAWIR, RT.02 RW.I', 'sdnkalidawir.tga@gmail.com', '-', 9, 208, -7.5086000, 112.7301000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(225, '20502259', 'SD NEGERI KALIJATEN', 2, 'SD', 'Negeri', 'A', 'JL.KALIJATEN IB NO. 94', 'sdnkalijaten@yahoo.co.id', '0317872022', 8, 133, -7.3514000, 112.6944000, 'belum', '2026-09-12 08:37:58', '2026-09-10 05:44:13', NULL),
(226, '20502258', 'SD NEGERI KALIMATI', 10, 'SD', 'Negeri', 'A', 'Jl. A. Yani', 'SDNKALIMATII@GMAIL.COM', '-', 8, 125, -7.4559000, 112.5595000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(227, '20502256', 'SD NEGERI KALIMATI 2', 10, 'SD', 'Negeri', 'B', 'Jln. A. Yani Kalimati', 'sdn.kalimati02@gmail.com', '081252480340', 8, 149, -7.4535000, 112.5462000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(228, '20502254', 'SD NEGERI KEBOANANOM', 3, 'SD', 'Negeri', 'A', 'Jl Sukodono 51 Gedangan', 'sdnkeboananom132@gmail.com', '0318536790', 26, 597, -7.3936000, 112.7154000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(229, '20502253', 'SD NEGERI KEDENSARI 2', 15, 'SD', 'Negeri', 'A', 'Jl Utama Kedensari No. 6 Kedensari RT/RW : 12/05', 'sdnkedensari2@yahoo.co.id', '0318850655', 16, 298, -7.5058000, 112.6928000, 'belum', NULL, '2026-09-10 05:44:13', NULL);
INSERT INTO `satuan_pendidikan` (`id`, `npsn`, `nama`, `kecamatan_id`, `jenjang`, `status_sekolah`, `akreditasi`, `alamat`, `email`, `telepon`, `total_guru`, `total_siswa`, `latitude`, `longitude`, `status_pengisian`, `last_updated`, `created_at`, `deleted_at`) VALUES
(230, '20502252', 'SD NEGERI KEDINDING', 10, 'SD', 'Negeri', 'B', 'Jl. A. Yani 65 Kedinding', 'sdnkedinding@gmail.com', '-', 8, 101, -7.4383000, 112.5497000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(231, '20502250', 'SD NEGERI KEDONDONG 1', 16, 'SD', 'Negeri', 'A', 'Kedondong', 'sdnkedondongsatu@gmail.com', '0318850792', 8, 116, -7.4789000, 112.6736000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(232, '20502249', 'SD NEGERI KEDONDONG 2', 16, 'SD', 'Negeri', 'A', 'Jln. Kedondong Indah', 'sdnkedondongdua@gmail.com', '0318851075', 10, 199, -7.4787000, 112.6731000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(233, '20502248', 'SD NEGERI KEDUNGSUKODANI', 9, 'SD', 'Negeri', 'B', 'Kedungsukodani', 'sdnkedungsukodani@gmail.com', '-', 8, 145, -7.4165000, 112.4925000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(234, '20502247', 'SD NEGERI KEDUNGBANTENG', 15, 'SD', 'Negeri', 'C', 'Desa Kedungbanteng', 'sdn.kedungbanteng@gmail.com', '0318965972', 7, 137, -7.5071000, 112.7456000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(235, '20502243', 'SD NEGERI KEDUNGBOCOK', 10, 'SD', 'Negeri', 'B', 'Kedungbocok', 'sdnkedungbocok@rocketmail.com', '0', 8, 139, -7.4543000, 112.4928000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(236, '20502241', 'SD NEGERI KEDUNGBOTO', 13, 'SD', 'Negeri', 'B', 'Kedungboto', 'SDN_KEDUNGBOTO_428@YAHOO.CO.ID', '0343842954', 8, 93, -7.5163000, 112.6681000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(237, '20502239', 'SD NEGERI KEBONSARI', 18, 'SD', 'Negeri', 'A', 'Kebonsari', 'sdnkebonsari62@yahoo.co.id', '0318056240', 12, 195, -7.4832000, 112.7232000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(238, '20502236', 'SD NEGERI KEBOANSIKEP 1', 3, 'SD', 'Negeri', 'B', 'Jl. Sukodono No.03', 'sdnkeboansikep1gedangan@gmail.com', '0318915810', 14, 245, -7.3901000, 112.7264000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(239, '20502231', 'SD NEGERI KEBOHARAN', 8, 'SD', 'Negeri', 'B', 'Jl Raya Keboharan', 'sdnkeboharan@gmail.com', '0318986393', 14, 369, -7.3942000, 112.6090000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(240, '20502230', 'SD NEGERI KEBONAGUNG 1', 6, 'SD', 'Negeri', 'A', 'Jl. Raya Kebonagung', 'sdnkebonagung1sda@gmail.com', '0318832577', 16, 311, -7.4599000, 112.6764000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(241, '20502219', 'SD NEGERI KEBONAGUNG 1', 13, 'SD', 'Negeri', 'A', 'Jl. SIDOMULYO NO.1 Kebonagung Porong', 'sdnkba1prg@gmail.com', '0343850380', 13, 221, -7.5494000, 112.6921000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(242, '20502218', 'SD NEGERI KEBONAGUNG 2', 13, 'SD', 'Negeri', 'A', 'Jl. Sidomulyo No. 83 Kebonagung', 'Kebonagung.dua83@gmail.com', '0343850660', 9, 160, -7.4559000, 112.6719000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(243, '20502214', 'SD NEGERI KEDUNGKENDO', 18, 'SD', 'Negeri', 'A', 'Jl. Kedungkendo 66', 'sdnegerikedungkendo@gmail.com', '-', 9, 180, -7.4762000, 112.6939000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(244, '20502213', 'SD NEGERI DUKUH SARI 1', 14, 'SD', 'Negeri', 'A', 'Rt 04, Rw 01', 'sdndukuhsari1jabon@gmail.com', '-', 7, 195, -7.5475000, 112.7243000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(245, '20502212', 'SD NEGERI GEDANGAN', 3, 'SD', 'Negeri', 'A', 'Jl Jenggala No 68', 'sdngedangan11@gmail.com', '0318910068', 23, 380, -7.3885000, 112.7308000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(246, '20502210', 'SD NEGERI GELAM 1', 18, 'SD', 'Negeri', 'A', 'Gelam', 'sekolahgelamsatu@gmail.com', '0318962877', 7, 124, -7.4879000, 112.7123000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(247, '20502209', 'SD NEGERI GELAM 2', 18, 'SD', 'Negeri', 'A', 'Gelam', 'sdngelamdua@yahoo.co.id', '0318925675', 25, 463, -7.4878000, 112.7127000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(248, '20502208', 'SD NEGERI GELANG 1', 16, 'SD', 'Negeri', 'A', 'Jl Amd Manunggal 3', 'sdngelang@gmail.com', '8850776', 8, 101, -7.4958000, 112.6474000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(249, '20502207', 'SD NEGERI GELANG 2', 16, 'SD', 'Negeri', 'A', 'Jln AMD Manunggal III Gelang', 'sdn_gelang2@yahoo.com', '0318851360', 8, 121, -7.4969000, 112.6556000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(250, '20502206', 'SD NEGERI GELURAN 1', 2, 'SD', 'Negeri', 'A', 'Jl Raya Geluran No 27', 'gelusatmn@gmail.com', '0317886623', 25, 532, -7.3554000, 112.6911000, 'belum', '2026-09-12 08:37:58', '2026-09-10 05:44:13', NULL),
(251, '20502205', 'SD NEGERI GELURAN 2', 2, 'SD', 'Negeri', 'A', 'Jl.raya Geluran', 'sd.negerigeluran2@gmail.com', '0317887008', 13, 204, -7.3552000, 112.6913000, 'belum', '2026-09-12 08:37:58', '2026-09-10 05:44:13', NULL),
(252, '20502204', 'SD NEGERI GELURAN 3', 2, 'SD', 'Negeri', 'A', 'Jl. Nangka II', 'sdngelurantiga@gmail.com', '0317887084', 23, 544, -7.3647000, 112.6949000, 'belum', '2026-09-12 08:37:58', '2026-09-10 05:44:13', NULL),
(253, '20502203', 'SD NEGERI GEMPOL KLUTUK', 10, 'SD', 'Negeri', 'B', 'Gempolklutuk', 'sdngempolklutuk@gmail.com', '-', 7, 69, -7.4470000, 112.5468000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(254, '20502202', 'SD NEGERI GEMPOLSARI 1', 15, 'SD', 'Negeri', 'A', 'Gempolsari', 'gempolsarisatusdn@gmail.com', '-', 8, 157, -7.5132000, 112.7224000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(255, '20502200', 'SD NEGERI GEMURUNG', 3, 'SD', 'Negeri', 'B', 'Jl. R. Qosim No. 4 Desa Gemurung', 'sdngemurung@gmail.com', '0318913803', 11, 209, -7.4053000, 112.7469000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(256, '20502198', 'SD NEGERI GEDANG 1', 13, 'SD', 'Negeri', 'A', 'Jl. Wr. Supratman 35', 'sdngedang1.porong@gmail.com', '-', 12, 291, -7.5355000, 112.6994000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(257, '20502197', 'SD NEGERI DUKUHSARI 2', 14, 'SD', 'Negeri', 'A', 'Dukuhsari', 'sdndukuhsari2@gmail.com', '0343856274', 7, 134, -7.5494000, 112.7300000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(258, '20502196', 'SD NEGERI DUKUH TENGAH', 5, 'SD', 'Negeri', 'A', 'Jl. Raya Prasung - Dukuhtengah', 'sdn.dukuhtengah.02@gmail.com', '0318013388', 11, 250, -7.4172000, 112.7520000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(259, '20502195', 'SD NEGERI DURUNGBANJAR', 18, 'SD', 'Negeri', 'A', 'Durungbanjar', 'uptsdndurungbanjar92@gmail.com', '0318855272', 7, 132, -7.4741000, 112.6845000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(260, '20502194', 'SD NEGERI DURUNGBEDUG', 18, 'SD', 'Negeri', 'B', 'Durungbedug', 'durungbedug95@gmail.com', '0318856121', 8, 124, -7.4648000, 112.6672000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(261, '20502193', 'SD NEGERI ENTALSEWU', 5, 'SD', 'Negeri', 'B', 'Entalsewu', 'sdnental1000@gmail.com', '0318958520', 20, 405, -7.4318000, 112.7034000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(262, '20502191', 'SD NEGERI GADING', 12, 'SD', 'Negeri', 'B', 'DESA GADING RT 07 RW 04', 'sdngading988@gmail.com', '082131744732', 8, 145, -7.5197000, 112.6430000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(263, '20502190', 'SD NEGERI GAMPING 1', 8, 'SD', 'Negeri', 'A', 'Jl Desa Gamping', 'uptsdngamping1@gmail.com', '0318983391', 9, 214, -7.4164000, 112.5929000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(264, '20502189', 'SD NEGERI GAMPINGROWO 1', 10, 'SD', 'Negeri', 'A', 'Jln. Kenanga 89', 'sdngampingrowo1@gmail.com', '-', 8, 119, -7.4482000, 112.5075000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(265, '20502188', 'SD NEGERI GANGGANGPANJANG', 15, 'SD', 'Negeri', 'A', 'Jl. Nolodiwongso ', 'sdnganggangpanjangtga@gmail.com', '03199035262', 16, 241, -7.4822000, 112.6734000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(266, '20502186', 'SD NEGERI GANTING', 3, 'SD', 'Negeri', 'A', 'Jl. Sukodono No.36', 'sdnegeriganting25@gmail.com', '0318912495', 15, 299, -7.3989000, 112.7079000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(267, '20502185', 'SD NEGERI GEBANG 1', 7, 'SD', 'Negeri', 'A', 'Jl Teluk Delta No 2', 'gebang1977@gmail.com', '99705986', 9, 162, -7.4689000, 112.7307000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(268, '20502184', 'SD NEGERI GILANG 1', 2, 'SD', 'Negeri', 'B', 'Jl. Raya Gilang Gg. Kamboja RW. 02', 'sdngilang1@gmail.com', '0317876599', 9, 165, -7.3629000, 112.6733000, 'belum', '2026-09-12 08:37:58', '2026-09-10 05:44:13', NULL),
(269, '20502183', 'SD NEGERI GILANG 2', 2, 'SD', 'Negeri', 'B', 'Jl. Raya Gilang No. 136 Kec. Taman Kab. Sidoarjo', 'sdngilang2@gmail.com', '-', 6, 39, -7.3634000, 112.6670000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(270, '20502182', 'SD NEGERI JATI', 7, 'SD', 'Negeri', 'A', 'Jl Raya Jati No 12 Sidoarjo', 'sdnegerijati22@gmail.com', '0318950871', 18, 409, -7.4458000, 112.6946000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(271, '20502181', 'SD NEGERI JATIKALANG 1', 8, 'SD', 'Negeri', 'A', 'Jl. Manunggal Jati', 'sdnegerijatikalang01@gmail.com', '-', 11, 204, -7.3904000, 112.6204000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(272, '20502180', 'SD NEGERI JATIKALANG 2', 8, 'SD', 'Negeri', 'A', 'Jatikalang', 'sdnjatikalang2@gmail.com', '0318971309', 8, 173, -7.3927000, 112.6251000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(273, '20502176', 'SD NEGERI JEMIRAHAN', 14, 'SD', 'Negeri', 'A', 'Jl. Ds Jemirahan', 'jemirahan@gmail.com', '085855547900', 11, 228, -7.5513000, 112.7438000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(274, '20502175', 'SD NEGERI JEMUNDO 1', 2, 'SD', 'Negeri', 'B', 'Jl Sawunggaling No 1', 'sdnjemundo1@gmail.com', '0317872182', 10, 222, -7.3692000, 112.6787000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(275, '20502174', 'SD NEGERI JEMUNDO 2', 2, 'SD', 'Negeri', 'A', 'Jl. Raya Sawunggaling No. 06 Jemundo - Taman', 'sekolahdasarjemundoii@yahoo.co.id', '0317889078', 15, 323, -7.3646000, 112.6796000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(276, '20502173', 'SD NEGERI JENGGOT', 12, 'SD', 'Negeri', 'B', 'Jl. Raya Jenggot', 'sdnjenggot180@gmail.com', '03438450862', 8, 104, -7.5196000, 112.6550000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(277, '20502172', 'SD NEGERI JERUK GAMPING', 8, 'SD', 'Negeri', 'A', 'Jl. Kh. Tohir Sholeh', 'sdnjerukgamping@yahoo.co.id', '0318978321', 15, 309, -7.4155000, 112.5878000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(278, '20502171', 'SD NEGERI JERUKLEGI 2', 9, 'SD', 'Negeri', 'A', 'Dsn. Melati Rt 04 Rw 03', 'sdnjeruklegi02@gmail.com', '081249575977', 7, 67, -7.4000000, 112.5610000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(279, '20502170', 'SD NEGERI JIKEN', 16, 'SD', 'Negeri', 'B', 'Jiken', 'uptsdnjiken@gmail.com', '-', 8, 76, -7.5062000, 112.6550000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(280, '20502169', 'SD NEGERI JANTI 2', 1, 'SD', 'Negeri', 'A', 'Jl. Brigjen Katamso VI no. 234', 'sdnjanti2@gmail.com', '0318543571', 10, 180, -7.3481000, 112.7436000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(281, '20502168', 'SD NEGERI JANTI 2', 16, 'SD', 'Negeri', 'A', 'Jalan Pemuda no. 02', 'sdn_janti2@yahoo.co.id', '0318856562', 7, 93, -7.4821000, 112.6195000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(282, '20502167', 'SD NEGERI GISIK CEMANDI', 4, 'SD', 'Negeri', 'B', 'Jl. Sekardadu No.83', 'gisikcemandi409@gmail.com', '-', 8, 134, -7.3896000, 112.8057000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(283, '20502161', 'SD NEGERI GROGOL', 16, 'SD', 'Negeri', 'A', 'Grogol', 'sdngrogolkabsidoarjo@gmail.com', '0318855917', 23, 473, -7.4580000, 112.6546000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(284, '20502160', 'SD NEGERI JABARAN', 9, 'SD', 'Negeri', 'A', 'Jln. Mayjend Bambang Yuwono', 'sdnjabaran12@gmail.com', '-', 14, 194, -7.4147000, 112.5508000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(285, '20502159', 'SD NEGERI JAMBANGAN', 18, 'SD', 'Negeri', 'B', 'Jl. Sawah Sidomulyo 1', 'sdnjambangancandi@gmail.com', '03199010057', 9, 143, -7.4660000, 112.6826000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(286, '20502158', 'SD NEGERI JANTI 1', 10, 'SD', 'Negeri', 'A', 'Desa Janti', 'sdnjantitarik@gmail.com', '-', 8, 66, -7.4330000, 112.5139000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(287, '20502157', 'SD NEGERI JANTI 2', 10, 'SD', 'Negeri', 'A', 'Desa Janti RT 02 RW 01 Kecamatan Tarik Kabupaten Sidoarjo', 'sdnegerijantiii@ymail.com', '-', 8, 86, -7.4348000, 112.5226000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(288, '20502156', 'SD NEGERI JANTI 1', 16, 'SD', 'Negeri', 'B', 'Jln. Raya Janti', 'sdnjanti01@gmail.com', '0318853369', 8, 82, -7.4777000, 112.6146000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(289, '20502155', 'SD NEGERI JANTI 1', 1, 'SD', 'Negeri', 'A', 'Jl. Brigjen Katamso 227a', 'sdnjanti1.390@gmail.com', '0318543158', 23, 464, -7.3502000, 112.7395000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(290, '20501907', 'SD NEGERI WONOAYU 1', 17, 'SD', 'Negeri', 'A', 'Raya Wonoayu', 'sdn.wonoayu1@gmail.com', '085641558749', 10, 176, -7.4363000, 112.6171000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(291, '20501906', 'SD NEGERI WUNUT 2', 13, 'SD', 'Negeri', 'A', 'Jln. Sumber Mulyo', 'sdn.wunut2@gmail.com', '0318857779', 13, 221, -7.5191000, 112.6940000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(292, '20501905', 'SD AL ISLAMIYAH PUTAT', 15, 'SD', 'Swasta', 'A', 'Jl Putat Utara No. 25', 'sd.alislamiyahputat@gmail.com', '0318945351', 8, 71, -7.5041000, 112.7318000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(293, '20501903', 'SD MUHAMMADIYAH 2 SIDOARJO', 7, 'SD', 'Swasta', 'A', 'Jl Pasar Jetis 28', 'sdamada@gmail.com', '0318966695', 24, 424, -7.4565000, 112.7157000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(294, '20501901', 'SD KEMALA BHAYANGKARI 10', 13, 'SD', 'Swasta', 'A', 'Jl. Bhayangkari No.36-b Porong', 'sdbhayangkari10porong@gmail.com', '0343855266', 16, 246, -7.5412000, 112.6973000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(295, '20501900', 'SD MUHAMMADIYAH 9', 15, 'SD', 'Swasta', 'A', 'Jl Ngaban', 'sdm9ngaban@gmail.com', '0318050948', 12, 253, -7.5062000, 112.7260000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(296, '20501899', 'SD TAMAN PENDIDIKAN ISLAM PORONG', 13, 'SD', 'Swasta', 'A', 'Jl Pesantren 176 Porong', 'sdtpiporong@yahoo.com', '082143887812', 19, 323, -7.5445000, 112.6956000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(297, '20501893', 'SD NEGERI WUNUT 1', 13, 'SD', 'Negeri', 'B', 'Jalan Sumbermulyo No 75', 'sdnwunutiporong@yahoo.com', '0318857503', 13, 243, -7.5177000, 112.6883000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(298, '20501892', 'SD NEGERI WONOPLINTAHAN 1', 11, 'SD', 'Negeri', 'A', 'Jl. Wonoplintahan', 'sdnwonoplintahan1@gmail.com', '-', 8, 146, -7.4531000, 112.5848000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(299, '20501891', 'SD NEGERI WONOAYU 2', 17, 'SD', 'Negeri', 'B', 'Jl. Raya Wonoayu', 'sdnwonoayu2.rek@gmail.com', '0318975029', 8, 100, -7.4362000, 112.6192000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(300, '20501889', 'SD NEGERI WONOCOLO 1', 2, 'SD', 'Negeri', 'A', 'Jl Stasiun 35 Sepanjang', 'sdnwonocolo1@gmail.com', '0317873000', 16, 269, -7.3488000, 112.6959000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(301, '20501887', 'SD NEGERI WONOCOLO 2', 2, 'SD', 'Negeri', 'A', 'Jl. Ir. Anwari No. 01 Wonocolo', 'wonocolosdn2@gmail.com', '0317877451', 8, 94, -7.3463000, 112.6980000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(302, '20501885', 'SD NEGERI WONOCOLO 4', 2, 'SD', 'Negeri', 'A', 'JL. STASIUN NO. 7 TAMAN-SIDOARJO', 'sekolahdasarnegeriwonocolo4@gmail.com', '0317889563', 9, 90, -7.3476000, 112.6963000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(303, '20501883', 'SD NEGERI WONOKARANG ', 9, 'SD', 'Negeri', 'B', 'Jalan Kenanga', 'sdnwonokarang230@gmail.com', '085748866603', 7, 158, -7.4116000, 112.5135000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(304, '20501882', 'SD NEGERI WONOKASIAN 1', 17, 'SD', 'Negeri', 'A', 'JL. GUNDHO WIJOYO NO 01', 'sdnwonokasian17@gmail.com', '03199037448', 8, 120, -7.4291000, 112.6566000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(305, '20501881', 'SD NEGERI WONOKASIAN 2', 17, 'SD', 'Negeri', 'A', 'Jl. Raya Ds Wonokasian', 'wonokasiandua@yahoo.co.id', '085852797176', 8, 93, -7.4357000, 112.6504000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(306, '20501880', 'SD NEGERI WONOKUPANG', 9, 'SD', 'Negeri', 'B', 'Jl Wiryo Susastro', 'sdnwonokupang17@gmail.com', '-', 15, 222, -7.4148000, 112.5214000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(307, '20501845', 'SD NEGERI TAMBAKOSO', 1, 'SD', 'Negeri', 'A', 'Jl. Pasar No. 39', 'sdn514@gmail.com', '0318709725', 8, 200, -7.3579000, 112.8124000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(308, '20501844', 'SD NEGERI TEBEL', 3, 'SD', 'Negeri', 'A', 'Jl. Raya Tebel no. 01', 'sdn_tebel@yahoo.com', '0318914453', 26, 521, -7.4077000, 112.7262000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(309, '20501841', 'SD NEGERI TEMPEL', 8, 'SD', 'Negeri', 'A', 'Jl Kali Pelayaran No 202 Tempel', 'sdntempelkrian@gmail.com', '03199894760', 12, 226, -7.3732000, 112.5927000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(310, '20501839', 'SD NEGERI TEMU 2', 11, 'SD', 'Negeri', 'B', 'Jl. Raya Temu', 'Sdntemu02@gmail.com', '0318986824', 9, 56, -7.4470000, 112.5705000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(311, '20501838', 'SD NEGERI TENGGULUNAN', 18, 'SD', 'Negeri', 'A', 'Tenggulunan RT 05 RW 02', 'sdntenggulunan@gmail.com', '0318960971', 22, 418, -7.4710000, 112.7098000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(312, '20501836', 'SD NEGERI TERIK', 8, 'SD', 'Negeri', 'A', 'JL. KH. GHOFAR NADI No.02', 'teriksdn@gmail.com', '0318987193', 10, 148, -7.4133000, 112.6018000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(313, '20501835', 'SD NEGERI TERUNGWETAN', 8, 'SD', 'Negeri', 'B', 'Jl. Garuda Selatan No.02', 'sdnterungwetan@gmail.com', '-', 8, 157, -7.3969000, 112.6168000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(314, '20501834', 'SD NEGERI TERUNGKULON', 8, 'SD', 'Negeri', 'B', 'Jln. Garuda Barat Terungkulon Kode Pos 61262', 'sdn.terungkulon.208@gmail.com', '085895676283', 8, 147, -7.3975000, 112.6103000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(315, '20501832', 'SD NEGERI TLASIH', 16, 'SD', 'Negeri', 'A', 'Jln. Raya Tlasih', 'sdntlasih457@gmail.com', '0318850779', 8, 87, -7.4735000, 112.6218000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(316, '20501831', 'SD NEGERI TAWANGSARI 3', 2, 'SD', 'Negeri', 'A', 'JL. Tawangsari Permai No. 1', 'sdntawangsari3@gmail.com', '0317887981', 15, 308, -7.3569000, 112.6743000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(317, '20501828', 'SD NEGERI TAMBAKSUMUR', 1, 'SD', 'Negeri', 'A', 'Jl. Zainal Abidin No 66', 'sdn_tambaksumur@yahoo.co.id', '0318676536', 15, 315, -7.3504000, 112.7756000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(318, '20501827', 'SD NEGERI TAMBAKREJO', 1, 'SD', 'Negeri', 'A', 'Jl. Tambak Rejo Sekolahan', 'sdntambakrejo479@gmail.com', '0318673733', 29, 709, -7.3566000, 112.7795000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(319, '20501826', 'SD NEGERI TAMBAK REJO 1', 12, 'SD', 'Negeri', 'B', 'Jl. PARANG TIRTO TAMBAKREJO', 'sdn.tambakrejo177@gmail.com', '081554722243', 11, 146, -7.5398000, 112.6603000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(320, '20501824', 'SD NEGERI TAMBAK REJO 2', 12, 'SD', 'Negeri', 'A', 'Jalan Desa Tambakrejo', 'sdn.tambakrejo2.krembung@gmail.com', '03216815673', 13, 209, -7.5426000, 112.6626000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(321, '20501822', 'SD NEGERI TANJEKWAGIR', 12, 'SD', 'Negeri', 'B', 'Jl. Balai Desa Tanjekwagir No. 1', 'tanjekwagirsdn@gmail.com', '0343859316', 8, 129, -7.5269000, 112.6283000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(322, '20501821', 'SD NEGERI TANJUNGSARI 1', 2, 'SD', 'Negeri', 'A', 'Jln. Kh. Mas Mansyur', 'sdn_tanjungsari1@yahoo.com', '0317888463', 14, 292, -7.3651000, 112.6461000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(323, '20501820', 'SD NEGERI TANJUNGSARI 2', 2, 'SD', 'Negeri', 'A', 'Desa Tanjungsari', 'sdn_tanjungsari2@yahoo.com', '7882280', 10, 180, -7.3646000, 112.6529000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(324, '20501819', 'SD NEGERI TARIK 1', 10, 'SD', 'Negeri', 'A', 'Tarik', 'sdntarik01@gmail.com', '-', 8, 136, -7.4617000, 112.5159000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(325, '20501818', 'SD NEGERI TARIK 2', 10, 'SD', 'Negeri', 'A', 'Tarik', 'sdntarik2@gmail.com', '-', 9, 94, -7.4538000, 112.5186000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(326, '20501817', 'SD NEGERI TAWANGSARI 1', 2, 'SD', 'Negeri', 'A', 'Jl. Raya Tawangsari No. 19 RT 04 RW 01 Kecamatan Taman Kabupaten Sidoarjo', 'sdntawangsariwan@gmail.com', '03199785934', 27, 607, -7.3494000, 112.6817000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(327, '20501816', 'SD NEGERI TROPODO', 8, 'SD', 'Negeri', 'A', 'Tropodo', 'sdntropodo.krian08@gmail.com', '-', 16, 326, -7.4300000, 112.5749000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(328, '20501814', 'SD NEGERI WANGKAL', 12, 'SD', 'Negeri', 'B', 'WANGKAL', 'sdnwangkalkrembung@gmail.com', '0343842323', 8, 122, -7.5258000, 112.6593000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(329, '20501813', 'SD NEGERI WARU 1', 1, 'SD', 'Negeri', 'A', 'Jl. Jendral S. Parman V/130', 'sdn.waru1@gmail.com', '0318552896', 20, 383, -7.3620000, 112.7230000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(330, '20501812', 'SD NEGERI WARU 2', 1, 'SD', 'Negeri', 'A', 'Jl. Letjen S Parman No. 23', 'sdnwaru2@gmail.com', '0318533188', 17, 318, -7.3592000, 112.7296000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(331, '20501809', 'SD NEGERI WARUBERON', 9, 'SD', 'Negeri', 'B', 'Waruberon', 'sdnwaruberon@gmail.com', '082331639602', 8, 105, -7.4239000, 112.5284000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(332, '20501808', 'SD NEGERI WATUGOLONG 1', 8, 'SD', 'Negeri', 'B', 'Jln. Pancasila N0.14 Dusun Tenggulunan RT.04 RW.02 ', 'sdnwatugolong01@gmail.com', '03177103969', 10, 188, -7.3858000, 112.5919000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(333, '20501807', 'SD NEGERI WATUGOLONG 2', 8, 'SD', 'Negeri', 'A', 'Jl Pahlawan No 1', 'sdn.watugolong02@gmail.com', '03158204420', 18, 316, -7.3890000, 112.5937000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(334, '20501804', 'SD NEGERI WAUNG', 12, 'SD', 'Negeri', 'B', 'Waung', 'sdnwaung@yahoo.co.id', '0318856553', 8, 109, -7.5110000, 112.6603000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(335, '20501801', 'SD NEGERI WAGE 2', 2, 'SD', 'Negeri', 'A', 'Jl. Taruna Inpres No. 2', 'admin@sdnwage.sch.id', '0318538274', 29, 686, -7.3695000, 112.7067000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(336, '20501800', 'SD NEGERI WAGE 1', 2, 'SD', 'Negeri', 'A', 'Jl. Mangga No. 15', 'sdwage1@gmail.com', '03185593090', 25, 456, -7.3712000, 112.7091000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(337, '20501799', 'SD NEGERI TROPODO 1', 1, 'SD', 'Negeri', 'A', 'Jl. Tropodo 1 No 201', 'sdntropodo1@yahoo.co.id', '8673796', 16, 357, -7.3624000, 112.7558000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(338, '20501798', 'SD NEGERI TROPODO 2', 1, 'SD', 'Negeri', 'A', 'Jl. Anggrek 1 Wisma Tropodo', 'sdn.tropododua@yahoo.co.id', '0318668069', 28, 566, -7.3557000, 112.7618000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(339, '20501796', 'SD NEGERI TROSOBO 1', 2, 'SD', 'Negeri', 'B', 'Jl. Raya Trosobo No. 2', 'sdntrosobosatu@gmail.com', '7884760', 6, 119, -7.3740000, 112.6394000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(340, '20501795', 'SD NEGERI TROSOBO 2', 2, 'SD', 'Negeri', 'A', 'Jl Raya Trosobo', 'sdntrosobo02@gmail.com', '7878476', 14, 258, -7.3779000, 112.6305000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(341, '20501793', 'SD NEGERI TULANGAN 1', 16, 'SD', 'Negeri', 'A', 'Tulangan Rt. 02 Rw. 4', 'sdntulangan1@gmail.com', '0318851613', 9, 173, -7.4806000, 112.6492000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(342, '20501792', 'SD NEGERI TULANGAN 2', 16, 'SD', 'Negeri', 'A', 'Jln. Ra Kartini No. 10', 'sdntulangan2@gmail.com', '03188580826', 8, 128, -7.4741000, 112.6502000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(343, '20501791', 'SD NEGERI URANGAGUNG', 7, 'SD', 'Negeri', 'A', 'Jl. Balai Kelurahan Urangagung', 'sdnurangagung27@gmail.com', '03170547494', 13, 281, -7.4304000, 112.6685000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(344, '20501790', 'SD NEGERI WADUNGASIH 1', 5, 'SD', 'Negeri', 'B', 'Jalan Raya Wadungasih', 'sdnwadungasih001@gmail.com', '0318968768', 17, 257, -7.4217000, 112.7356000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(345, '20501788', 'SD NEGERI WADUNGASIH 2', 5, 'SD', 'Negeri', 'B', 'Jalan Jawa 121', 'sdn.wadungasih02@gmail.com', '0318948761', 16, 306, -7.4191000, 112.7283000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(346, '20501787', 'SD NEGERI WADUNGASRI', 1, 'SD', 'Negeri', 'A', 'Jl. Blimbing V, No. 1-a, Pondok Tjandra Indah', 'sdnwadungasri@yahoo.co.id', '0318663259', 25, 489, -7.3445000, 112.7690000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(347, '20501785', 'SD NEGERI WEDOROKLURAK', 18, 'SD', 'Negeri', 'A', 'Jalan Veteran', 'sdnwedoroklurakcandi@gmail.com', '0318965267', 7, 98, -7.4753000, 112.7335000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(348, '20501660', 'SD NEGERI KRAMATTEMENGGUNG 2', 10, 'SD', 'Negeri', 'B', 'Kanigoro', 'kramatt02.sdn@gmail.com', '-', 6, 40, -7.4328000, 112.4704000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(349, '20501659', 'SD NEGERI LARANGAN', 18, 'SD', 'Negeri', 'A', 'Jl. Raya Larangan 6', 'sdnlaranganno48@gmail.com', '03199706812', 20, 372, -7.4684000, 112.7174000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(350, '20501658', 'SD NEGERI LEBO', 7, 'SD', 'Negeri', 'A', 'Jl. Wachid Hasyim No 02', 'sdnlebo05@gmail.com', '8961035', 21, 411, -7.4526000, 112.6738000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(351, '20501657', 'SD NEGERI LEMAHPUTRO 1', 7, 'SD', 'Negeri', 'A', 'Lemahputro Gang Kelurahan 152 B', 'sdnlemahputro1.sda@gmail.com', '0318923671', 16, 289, -7.4534000, 112.7126000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(352, '20501656', 'SD NEGERI LEMUJUT KREMBUNG', 12, 'SD', 'Negeri', 'B', 'Jl. Raya Lemujut  No.03', 'sdnlemujut.krembung@gmail.com', '0318853300', 8, 122, -7.5043000, 112.6159000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(353, '20501655', 'SD NEGERI KEPADANGAN 2', 16, 'SD', 'Negeri', 'A', 'Jl Raya Kepadangan No 99', 'sdnkepadangan@gmail.com', '081331396198', 8, 82, -7.4768000, 112.6383000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(354, '20501654', 'SD NEGERI MAGERSARI', 7, 'SD', 'Negeri', 'A', 'Jl Kelurahan Gajah Magersari', 'sdnmagersarisidoarjo@gmail.com', '0318942025', 19, 441, -7.4473000, 112.7118000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(355, '20501652', 'SD NEGERI MEDAENG 1', 1, 'SD', 'Negeri', 'A', 'Jl Joyoboyo No 49 Medaeng', 'Sdnmedaeng1resmi@gmail.com', '0318543628', 16, 324, -7.3561000, 112.7205000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(356, '20501649', 'SD NEGERI MEDALEM', 16, 'SD', 'Negeri', 'A', 'Ds. Medalem', 'sdnmedalem@yahoo.com', '0318851311', 8, 171, -7.4690000, 112.6599000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(357, '20501648', 'SD NEGERI MERGOBENER', 10, 'SD', 'Negeri', 'B', 'Mergobener', 'sdn.mergobener@yahoo.co.id', '-', 8, 98, -7.4671000, 112.5267000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(358, '20501647', 'SD NEGERI MERGOSARI 1', 10, 'SD', 'Negeri', 'B', 'mergosari', 'sdnmergosari01@gmail.com', '-', 8, 89, -7.4558000, 112.5288000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(359, '20501645', 'SD NEGERI LAMBANGAN', 17, 'SD', 'Negeri', 'A', 'Lambangan', 'sdnlambangan1@gmail.com', '03181694901', 7, 123, -7.4204000, 112.6406000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(360, '20501644', 'SD NEGERI KRAMATTEMENGGUNG 1', 10, 'SD', 'Negeri', 'B', 'Jl. Raya Surabaya Mojokerto Km 44', 'sdnkramattemenggung1@gmail.com', '-', 7, 23, -7.4333000, 112.4646000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(361, '20501643', 'SD NEGERI KRATON', 8, 'SD', 'Negeri', 'A', 'Jl. Kraton', 'sdnkraton44@gmail.com', '0318973112', 15, 338, -7.4076000, 112.5683000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(362, '20501642', 'SD NEGERI KREMBANGAN', 2, 'SD', 'Negeri', 'A', 'Jl. H. Achmad Rois', 'sdnkrembangan357@gmail.com', '0317876949', 14, 271, -7.3534000, 112.6641000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(363, '20501640', 'SD NEGERI KREMBUNG 2', 12, 'SD', 'Negeri', 'B', 'Jl. Raya Krembung', 'sdnkrembung2@gmail.com', '03199625001', 8, 57, -7.5102000, 112.6245000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(364, '20501639', 'SD NEGERI KRIAN 2', 8, 'SD', 'Negeri', 'B', 'Jalan Jagalan II', 'sdnkrian2@gmail.com', '0318986033', 7, 148, -7.4082000, 112.5797000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(365, '20501638', 'SD NEGERI KRIAN 3', 8, 'SD', 'Negeri', 'A', 'Jl.Gub. Soenandar PS No.18 Kel. Krian', 'sdnkrian3@gmail.com', '0318978123', 22, 489, -7.4089000, 112.5779000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(366, '20501637', 'SD NEGERI KRIAN 4', 8, 'SD', 'Negeri', 'A', 'Jln. Gubernur Sunandar Priyosudarmo No. 20', 'sdn_krian4@ymail.com', '0318976932', 29, 721, -7.4088000, 112.5780000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(367, '20501634', 'SD NEGERI KUPANG 3', 14, 'SD', 'Negeri', 'A', 'Tanjungsari', 'sdnkupang3@gmail.com', '081265592204', 8, 68, -7.5313000, 112.8210000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(368, '20501633', 'SD NEGERI KUREKSARI', 1, 'SD', 'Negeri', 'A', 'Jl. Anggrek Inpres No. 15 A', 'kureksari.sdn@gmail.com', '0318533293', 14, 261, -7.3601000, 112.7344000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(369, '20501632', 'SD NEGERI LAJUK', 13, 'SD', 'Negeri', 'A', 'Jln. Joyo Leksono Rt. 03 Rw. 02 Desa Lajuk Kecamatan Porong', 'sdnlajuk@yahoo.co.id', '0343842865', 15, 259, -7.5225000, 112.6716000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(370, '20501631', 'SD NEGERI MERGOSARI 2', 10, 'SD', 'Negeri', 'A', 'Jln.Unsuri', 'sdnmergosari380@gmail.com', '-', 8, 140, -7.4563000, 112.5296000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(371, '20501629', 'SD NEGERI PABEAN 2', 4, 'SD', 'Negeri', 'A', 'Jln. Abd. Rahman No. 65', 'sdnpabean2@gmail.com', '0318675417', 15, 246, -7.3665000, 112.7485000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(372, '20501627', 'SD NEGERI PABEAN 1', 4, 'SD', 'Negeri', 'A', 'Jl. Raya Pabean 69', 'sdnpabean1sedati@gmail.com', '0318670024', 33, 639, -7.3683000, 112.7633000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(373, '20501626', 'SD NEGERI PAGER NGUMBUK 1', 17, 'SD', 'Negeri', 'A', 'Pagerngumbuk', 'sdnpagerngumbuk1.wonoayu@gmail.com', '-', 9, 74, -7.4215000, 112.6203000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(374, '20501624', 'SD NEGERI PAGERWOJO', 5, 'SD', 'Negeri', 'A', 'Jalan Raya Pagerwojo No 1', 'sdnpagerwojobuduran1@gmail.com', '0318940889', 32, 668, -7.4401000, 112.7098000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(375, '20501620', 'SD NEGERI PANGGREH 1', 14, 'SD', 'Negeri', 'B', 'Panggreh', 'greenadadeblaza@gmail.com', '085704020359', 8, 97, -7.5552000, 112.7263000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(376, '20501618', 'SD NEGERI PANGKEMIRI 1', 16, 'SD', 'Negeri', 'A', 'Jln. Raya Pangkemiri', 'sdnpangkemiri1@gmail.com', '99625686', 9, 153, -7.4934000, 112.6691000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(377, '20501617', 'SD NEGERI PANGKEMIRI 2', 16, 'SD', 'Negeri', 'A', 'Desa Pangkemiri', 'pangkemirisdn2@gmail.com', '085231265675', 8, 105, -7.4936000, 112.6628000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(378, '20501615', 'SD NEGERI NGINGAS', 1, 'SD', 'Negeri', 'A', 'Jl. Ambeng Ambeng Selatan No. 83', 'sdnngingas@yahoo.co.id', '0318542083', 19, 408, -7.3585000, 112.7510000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(379, '20501613', 'SD NEGERI MINDUGADING', 10, 'SD', 'Negeri', 'A', 'Mindugading', 'sdnmindugading@gmail.com', '085733836999', 8, 117, -7.4396000, 112.4995000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(380, '20501612', 'SD NEGERI MLIRIPROWO', 10, 'SD', 'Negeri', 'B', 'Jln. Pahlawan No. 12', 'sdnmliriprowo1@yahoo.co.id', '0', 8, 104, -7.4445000, 112.4708000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(381, '20501607', 'SD NEGERI MOJORUNTUT 2', 12, 'SD', 'Negeri', 'B', 'Jl. Pemuda No.02', 'sdn.mojoruntut2@gmail.com', '0318852411', 8, 101, -7.5149000, 112.6204000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(382, '20501606', 'SD NEGERI MOJORUNTUT 3', 12, 'SD', 'Negeri', 'A', 'Jalan Raya Kecamatan No.16A Ds.Mojoruntut', 'mojoruntut03krb@gmail.com', '-', 8, 163, -7.5140000, 112.6250000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(383, '20501605', 'SD NEGERI MULYODADI', 17, 'SD', 'Negeri', 'A', 'Mulyodadi', 'sdnmulyodadi13@gmail.com', '03170968068', 8, 120, -7.4263000, 112.6239000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(384, '20501604', 'SD NEGERI NGABAN', 15, 'SD', 'Negeri', 'A', 'Ngaban  Rt. 17 Rw. 06', 'sdngaban@gmail.com', '-', 13, 216, -7.5038000, 112.7242000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(385, '20501603', 'SD NEGERI NGAMPELSARI', 18, 'SD', 'Negeri', 'A', 'JL. NGAMPELSARI ', 'sdnngampelsari99@gmail.com', '0318057901', 16, 356, -7.4953000, 112.7203000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(386, '20501602', 'SD NEGERI NGELOM', 2, 'SD', 'Negeri', 'A', 'Jl Megare Ngelom Taman', 'sdn.ngelom.544@gmail.com', '0317879482', 7, 141, -7.3477000, 112.6865000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(387, '20501601', 'SD NEGERI PANJUNAN', 6, 'SD', 'Negeri', 'A', 'Jl. Raya Panjunan', 'sdnpanjunan1@yahoo.com', '0317879868', 17, 349, -7.3838000, 112.6778000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(388, '20501600', 'SD NEGERI KEDUNGPANDAN 2', 14, 'SD', 'Negeri', 'B', 'Jalan Tambak Tlocor', 'sdnkedungpandanii@gmail.com', '085855555403', 8, 93, -7.5387000, 112.8206000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(389, '20501598', 'SD NEGERI KEMASAN', 8, 'SD', 'Negeri', 'B', 'Desa Kemasan', 'upt.sdnkemasan@gmail.com', '03199892012', 8, 159, -7.4020000, 112.5891000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(390, '20501597', 'SD NEGERI KEMIRI', 7, 'SD', 'Negeri', 'A', 'JL. BALAI DESA KEMIRI', 'sdnkemiri19@gmail.com', '0318969301', 12, 229, -7.4402000, 112.7304000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(391, '20501596', 'SD NEGERI KEMUNING', 10, 'SD', 'Negeri', 'A', 'Jl.Raya Kemuning - Tarik', 'sdnkemuning90@gmail.com', '0', 24, 485, -7.4457000, 112.5215000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(392, '20501594', 'SD NEGERI KENDALPECABEAN', 18, 'SD', 'Negeri', 'A', 'KENDALPECABEAN', 'sdnkendalpecabean@gmail.com', '-', 9, 178, -7.4929250, 112.7372410, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(393, '20501593', 'SD NEGERI KENDALSEWU', 10, 'SD', 'Negeri', 'B', 'Jln.DIPONEGORO', 'sdnkendalsewu73@gmail.com', '-', 11, 189, -7.4610000, 112.5416000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(394, '20501591', 'SD NEGERI KENONGO 1', 16, 'SD', 'Negeri', 'A', 'Jln. Raya Kenongo 25', 'sdnkenongo1@gmail.com', '8850117', 21, 462, -7.4822000, 112.6485000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(395, '20501590', 'SD NEGERI KENONGO 2', 16, 'SD', 'Negeri', 'A', 'Jln. Rajawali', 'sdn_kenongo2_kenongo@yahoo.co.id', '8852371', 9, 147, -7.4835000, 112.6485000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(396, '20501588', 'SD NEGERI KEPADANGAN 1', 16, 'SD', 'Negeri', 'A', 'Jl Raya Kepadangan', 'sdn.kepadangan1@gmail.com', '8852675', 8, 115, -7.4765000, 112.6392000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(397, '20501587', 'SD NEGERI KEPATIHAN 1', 16, 'SD', 'Negeri', 'A', 'Kepatihan', 'sdn.kepatihan1@gmail.com', '8853290', 7, 145, -7.4884000, 112.6547000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(398, '20501586', 'SD NEGERI KEMANTREN 1', 16, 'SD', 'Negeri', 'A', 'Jln. Raya Kemantren', 'sdnkemantrensatu@gmail.com', '0318850584', 8, 191, -7.4718000, 112.6487000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(399, '20501584', 'SD NEGERI KEDUNGPELUK 1', 18, 'SD', 'Negeri', 'A', 'Kedungpeluk', 'sdnkedungpeluk1@gmail.com', '0318922525', 8, 165, -7.4825000, 112.7555000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(400, '20501582', 'SD NEGERI KEDUNGRAWAN 1', 12, 'SD', 'Negeri', 'B', 'Jl. Raya Kedung Rawan', 'sdnkedungrawan1@gmail.com', '0343851493', 8, 77, -7.5328000, 112.6437000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(401, '20501581', 'SD NEGERI KEDUNGRAWAN 2', 12, 'SD', 'Negeri', 'A', 'Dusun Kedunglo', 'kedungrawan2.sdn@gmai.com', '-', 8, 67, -7.5331000, 112.6482000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(402, '20501580', 'SD NEGERI KEDUNGREJO ', 1, 'SD', 'Negeri', 'A', 'Jl.Raya Waru No. 39', 'sdnkedungrejo39.waru@gmail.com', '0318543354', 19, 310, -7.5708000, 112.7477000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(403, '20501576', 'SD NEGERI KEDUNGSOLO', 13, 'SD', 'Negeri', 'A', 'JL. RADEN WIJAYA NO. 2', 'sdnkedungsolo@yahoo.com', '0343851742', 13, 223, -7.5417000, 112.6754000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(404, '20501575', 'SD NEGERI KEDUNGSUMUR 3', 12, 'SD', 'Negeri', 'B', 'Kedungsumur', 'sdnegerikedungsumur3@gmail.com', '03438452483', 7, 100, -7.5303000, 112.6568000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(405, '20501574', 'SD NEGERI KEDUNGTURI ', 2, 'SD', 'Negeri', 'A', 'JL.GAJAH MADA NOMOR 02 ', 'sdnegeri.kedungturi@gmail.com', '0317886602', 24, 600, -7.3582000, 112.7034000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(406, '20501572', 'SD NEGERI KEDUNGWONOKERTO', 11, 'SD', 'Negeri', 'A', 'Kedungwonokerto', 'kedungwonokertosdn@gmail.com', '03199892195', 24, 503, -7.4610000, 112.5660000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(407, '20501571', 'SD NEGERI KEPATIHAN 2', 16, 'SD', 'Negeri', 'A', 'Rt. 01 Rw. 02 Desa Kepatihan Kec. Tulangan Kab. Sidoarjo 61273', 'sdnkepatihan2tulangan@gmail.com', '0318851604', 8, 168, -7.4881000, 112.6561000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(408, '20501570', 'SD NEGERI KEPER', 12, 'SD', 'Negeri', 'A', 'Keper', 'sdnkeperkrembung@gmail.com', '03438451092', 8, 145, -7.5366000, 112.6674000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(409, '20501569', 'SD NEGERI KETEGAN 1', 2, 'SD', 'Negeri', 'A', 'Jl.Raya Ketegan No.10', 'sekolahdasarnegeri.ketegan1@gmail.com', '03199790413', 16, 340, -7.3484000, 112.7032000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(410, '20501566', 'SD NEGERI KETEGAN 3', 2, 'SD', 'Negeri', 'A', 'Jl. Satria Ctn 4 No. 33', 'sdnegeriketegan3@gmail.com', '0317872754', 8, 125, -7.3451000, 112.7040000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(411, '20501565', 'SD NEGERI KETIMANG', 17, 'SD', 'Negeri', 'A', 'Ketimang', 'sdnegeriketimang@gmail.com', '0318854619', 9, 113, -7.4451000, 112.6492000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(412, '20501564', 'SD NEGERI KLAGEN', 6, 'SD', 'Negeri', 'A', 'Jl. Raya Klagen No. 29', 'sdn.klagen354@gmail.com', '8832921', 16, 353, -7.4194000, 112.6623000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(413, '20501563', 'SD NEGERI KLANTINGSARI 1', 10, 'SD', 'Negeri', 'B', 'Klantingsari', 'sdn.klantingsari.1@gmail.com', '03177286191', 9, 151, -7.4592000, 112.5489000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(414, '20501562', 'SD NEGERI KLANTINGSARI 2', 10, 'SD', 'Negeri', 'B', 'Klantingsari', 'klantingsari2@gmail.com', '-', 8, 68, -7.4594000, 112.5487000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(415, '20501561', 'SD NEGERI KLETEK', 2, 'SD', 'Negeri', 'A', 'Jl. Raya Kletek Rt 12 Rw 06', 'sdnkletek@gmail.com', '0317887215', 9, 105, -7.3589000, 112.6802000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(416, '20501560', 'SD NEGERI KLOPOSEPULUH 1', 6, 'SD', 'Negeri', 'A', 'Kloposepuluh Rt 10 Rw 02', 'sdn_klopox_1@yahoo.co.id', '7883673', 8, 156, -7.3953000, 112.6863000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(417, '20501559', 'SD NEGERI KLUDAN', 15, 'SD', 'Negeri', 'A', 'Jl. Raya Kludan No.48', 'newkludan@gmail.com', '0318955192', 20, 370, -7.5021000, 112.7068000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(418, '20501558', 'SD NEGERI KLURAK', 18, 'SD', 'Negeri', 'A', 'Klurak', 'sdnklurak99@gmail.com', '0318057950', 16, 375, -7.4815000, 112.7296000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(419, '20501557', 'SD NEGERI KRAGAN', 3, 'SD', 'Negeri', 'A', 'Jl. Ambrali', 'sdnkragan@ymail.com', '0318913900', 7, 185, -7.4093000, 112.7450000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(420, '20501556', 'SD NEGERI KRAMATJEGU 1', 2, 'SD', 'Negeri', 'A', 'Desa Kramatjegu', 'sdnkramatjegu1@gmail.com', '0317870653', 12, 318, -7.3810000, 112.6353000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(421, '20501554', 'SD NEGERI KETEGAN', 15, 'SD', 'Negeri', 'B', 'Jl. KH. Mujtahid No. 33', 'sdnketegan.tga@gmail.com', '03199035464', 8, 110, -7.4956000, 112.6871000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(422, '20501551', 'SD NEGERI KEPUH KEMIRI', 16, 'SD', 'Negeri', 'B', 'Jl Kauman No 461 Kepuhkemiri', 'sdnkepuhkemiri@gmail.com', '031709617', 8, 197, -7.4545000, 112.6367000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(423, '20501550', 'SD NEGERI KEPUHKIRIMAN 1', 1, 'SD', 'Negeri', 'A', 'Jl. Kenari No.1 Rewwin', 'kepuhkiriman1sdn@gmail.com', '0318666054', 28, 555, -7.3501000, 112.7540000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(424, '20501548', 'SD NEGERI KEPUH KIRIMAN 2', 1, 'SD', 'Negeri', 'A', 'Jl Gunung Agung P6', 'sdnkepuhkiriman2@gmail.com', '0318676951', 16, 237, -7.3524000, 112.7648000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(425, '20501546', 'SD NEGERI KERET ', 12, 'SD', 'Negeri', 'A', 'Jalan Raya Keret', 'sdnkeret_krembung@yahoo.com', '03199623440', 16, 233, -7.4840000, 112.6102000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(426, '20501544', 'SD NEGERI KESAMBI', 13, 'SD', 'Negeri', 'A', 'Jl. Cendrawasih ', 'sdkesambi@gmail.com', '0343858220', 11, 215, -7.5338000, 112.6803000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(427, '20501542', 'SD NEGERI KETAJEN 1', 3, 'SD', 'Negeri', 'B', 'Jl.ketajen No.21', 'sdnketajen1@ymail.com', '0318912854', 7, 111, -7.3867000, 112.7338000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(428, '20501541', 'SD NEGERI KETAJEN 2', 3, 'SD', 'Negeri', 'A', 'Jl. Raya Ketajen No:24', 'sdnketajen_2@yahoo.com', '0318913467', 16, 303, -7.3866000, 112.7360000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(429, '20501539', 'SD NEGERI KRAMAT JEGU 2', 2, 'SD', 'Negeri', 'A', 'Jl Kramat Jegu', 'sdnkeramatjegu2@gmail.com', '03199780172', 15, 327, -7.3804000, 112.6353000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(430, '20501536', 'SD NEGERI SIDOKARE 3', 7, 'SD', 'Negeri', 'A', 'Jl. Sekolahan Sidokare', 'sdnsidokare3sidoarjo@gmail.com', '0318965532', 16, 385, -7.4608000, 112.7073000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(431, '20501535', 'SD NEGERI SIDOKEPUNG 1', 5, 'SD', 'Negeri', 'A', 'Jalan Balai Desa Sidokepung No.1', 'sidokepung01.sdn@gmail.com', '0318925674', 17, 347, -7.4237000, 112.7048000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(432, '20501534', 'SD NEGERI SIDOKEPUNG 2', 5, 'SD', 'Negeri', 'A', 'Jln Raya Sidokepung No.2', 'sdnsidokepung@gmail.com', '0318066117', 16, 365, -7.4234000, 112.6965000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(433, '20501533', 'SD NEGERI SIDOKERTO', 5, 'SD', 'Negeri', 'A', 'Jalan Ksatrian No.21', 'sdn.sidokerto.buduran.sda@gmail.com', '0318946469', 25, 507, -7.4283000, 112.7142000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(434, '20501530', 'SD NEGERI SIDOKUMPUL', 7, 'SD', 'Negeri', 'A', 'Jl Diponegoro No 23', 'sdnsidokumpul6@gmail.com', '0318969658', 14, 239, -7.4522000, 112.7152000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(435, '20501528', 'SD NEGERI SIDOMOJO', 8, 'SD', 'Negeri', 'A', 'Ds. Sidomojo', 'sdnegerisidomojo@gmail.com', '0318987240', 8, 139, -7.4004000, 112.5862000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(436, '20501527', 'SD NEGERI SIDOMULYO', 5, 'SD', 'Negeri', 'B', 'Sidomulyo', 'sdnsidomulyobuduran12@gmail.com', '0318050844', 8, 135, -7.4251000, 112.7301000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(437, '20501526', 'SD NEGERI SIDOMULYO 1', 8, 'SD', 'Negeri', 'A', 'Dusun Patuk Desa Sidomulyo', 'sidomulyo1sd@gmail.com', '-', 8, 114, -7.4001000, 112.5686000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(438, '20501525', 'SD NEGERI SIDOMULYO 2', 8, 'SD', 'Negeri', 'A', 'Jl. Gub. Soenandar P.S', 'sdnsidomulyoii@gmail.com', '0318976020', 17, 336, -7.3919000, 112.5776000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(439, '20501524', 'SD NEGERI SIDOREJO', 8, 'SD', 'Negeri', 'A', 'Desa Sidorejo, Dusun Madubronto', 'sdnsidorejo@rocketmail.com', '8989091', 26, 465, -7.3755000, 112.6154000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(440, '20501522', 'SD NEGERI SIDOKARE 1', 7, 'SD', 'Negeri', 'A', 'Jl. Diponegoro No. 145 B', 'sdnsidokare1sidoarjo@gmail.com', '0318053585', 8, 109, -7.4591000, 112.7137000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(441, '20501521', 'SD NEGERI SEMAMBUNG', 17, 'SD', 'Negeri', 'A', 'Semambung', 'sdnsemambung296wonoayu@gmail.com', '03199891146', 13, 259, -7.4361000, 112.6094000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(442, '20501520', 'SD NEGERI SEMAMBUNG', 14, 'SD', 'Negeri', 'A', 'JL. MBAH RONO WIJOYO', 'sdnsemambungjabon@gmail.com', '-', 8, 115, -7.5668000, 112.7682000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(443, '20501519', 'SD NEGERI SEMAMBUNG 1', 3, 'SD', 'Negeri', 'A', 'Jl. Mandala Iv No. 445', 'sdnsemambungi@gmail.com', '0318677061', 14, 249, -7.3775000, 112.7452000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(444, '20501518', 'SD NEGERI SEMAMBUNG 2', 3, 'SD', 'Negeri', 'A', 'Jl. Garuda No. 150', 'sdnsemambung2@gmail.com', '0318548263', 13, 244, -7.3753000, 112.7398000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(445, '20501516', 'SD NEGERI SEMAMPIR 1', 4, 'SD', 'Negeri', 'B', 'JL. Semampir No. 74', 'semampirsdn@gmail.com', '8670811', 8, 193, -7.3723000, 112.7732000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(446, '20501515', 'SD NEGERI SENTUL', 15, 'SD', 'Negeri', 'B', 'Jln. Mojopahit No. 17', 'sentulsdn400@gmail.com', '081332154947', 7, 135, -7.5286000, 112.7342000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(447, '20501514', 'SD NEGERI SEPANDE', 18, 'SD', 'Negeri', 'A', 'Sepande', 'sdnsepande61@gmail.com', '0318928697', 14, 297, -7.4626000, 112.6957000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(448, '20501513', 'SD NEGERI SEPANJANG 1', 2, 'SD', 'Negeri', 'A', 'Jl. Raya Sepanjang No 23 Taman Sidoarjo', 'sdnsepanjang001@gmail.com', '03199788106', 11, 223, -7.3405000, 112.7035000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(449, '20501512', 'SD NEGERI SEPANJANG 2', 2, 'SD', 'Negeri', 'B', 'Jl. Kenari No 1 RT 9 RW 6', 'sdnspj2@gmail.com', '0317876581', 16, 321, -7.3415000, 112.7057000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(450, '20501511', 'SD NEGERI SIDODADI', 18, 'SD', 'Negeri', 'A', 'JL. RAYA SIDODADI DESA SIDODADI - CANDI - SIDOARJO', 'sdnsidodadi65@gmail.com', '0895419940088', 16, 319, -7.4595000, 112.6832000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(451, '20501510', 'SD NEGERI SIDODADI 1', 2, 'SD', 'Negeri', 'A', 'Jl. Mawar Rt 07 Rw 02 ', 'sdnsidodadi1sambirono@gmail.com', '03199781564', 15, 340, -7.3826000, 112.6470000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(452, '20501509', 'SD NEGERI SIDODADI 2', 2, 'SD', 'Negeri', 'A', 'Jl. Trosobo Utama No. 1', 'sdn.sidodadi2@yahoo.com', '0317885528', 16, 296, -7.3728000, 112.6448000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(453, '20501508', 'SD NEGERI SIMO ANGIN ANGIN', 17, 'SD', 'Negeri', 'A', 'Simoangin Angin', 'sdnsimoangin@gmail.com', '03199891431', 15, 294, -7.4355000, 112.6017000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(454, '20501507', 'SD NEGERI SIMOGIRANG 1', 11, 'SD', 'Negeri', 'A', 'Simogirang', 'sdnsimogirangsiji@gmail.com', '03158255823', 16, 294, -7.4427000, 112.5819000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(455, '20501506', 'SD NEGERI SUKOREJO', 5, 'SD', 'Negeri', 'B', 'Sukorejo', 's.sukorejo2020@gmail.com', '0318056712', 16, 251, -7.4223000, 112.7147000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(456, '20501505', 'SD NEGERI SUMBEREJO 2', 17, 'SD', 'Negeri', 'A', 'Sumberejo', 'sdn_sumberejoii@yahoo.com', '03170004804', 8, 102, -7.4389000, 112.6536000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(457, '20501504', 'SD NEGERI SUMBEREJO 1', 17, 'SD', 'Negeri', 'A', 'Desa Sumberejo', 'sdnsumberejo1wny@gmail.com', '-', 8, 163, -7.4410000, 112.6596000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(458, '20501503', 'SD NEGERI SUMOKALI', 18, 'SD', 'Negeri', 'A', 'Jl. Raya Sumokali', 'sumokalisdn@gmail.com', '0318064130', 9, 183, -7.4671000, 112.7007000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(459, '20501502', 'SD NEGERI SUMOKEMBANGSRI 3', 9, 'SD', 'Negeri', 'B', 'Sumokembangsri', 'sdnsumokembangsri03@gmail.com', '-', 7, 146, -7.4269000, 112.4969000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(460, '20501501', 'SD NEGERI SUMORAME', 18, 'SD', 'Negeri', 'A', 'Jl. Singokarso no. 2 - 4', 'sumorame.sdn104@gmail.com', '0318960932', 25, 510, -7.4931000, 112.7049000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(461, '20501499', 'SD NEGERI SUWALUH 1', 9, 'SD', 'Negeri', 'A', 'Desa Suwaluh', 'sdnsuwaluh1@ymail.com', '0318986001', 8, 159, -7.4234000, 112.5406000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(462, '20501498', 'SD NEGERI SUWALUH 2', 9, 'SD', 'Negeri', 'A', 'Jl. Karya Taruna', 'sdnsuwaluh.02@gmail.com', '-', 8, 145, -7.4167000, 112.5409000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(463, '20501496', 'SD NEGERI TANGGUL', 17, 'SD', 'Negeri', 'A', 'Jalan. Raya Tanggul', 'sdntanggul@yahoo.co.id', '8983934', 12, 200, -7.4298000, 112.5926000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(464, '20501495', 'SD NEGERI TAMAN', 2, 'SD', 'Negeri', 'A', 'Jl. Raya Taman No 81', 'sekolahdsrnegeritaman@gmail.com', '99782355', 8, 73, -7.3519000, 112.6991000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(465, '20501494', 'SD NEGERI TAMBAK KEMERAAN', 8, 'SD', 'Negeri', 'A', 'Jl. Garuda No. 1 Kelurahan Tambak Kemeraan Kecamatan Krian', 'sdntambakkemeraan@gmail.com', '0318976280', 17, 275, -7.4023000, 112.5840000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(466, '20501493', 'SD NEGERI SUKODONO 1', 6, 'SD', 'Negeri', 'A', 'Jl. Raya Sukodono No. 4', 'sukodono1@yahoo.co.id', '0318831641', 12, 209, -7.4014000, 112.6729000, 'belum', NULL, '2026-09-10 05:44:13', NULL);
INSERT INTO `satuan_pendidikan` (`id`, `npsn`, `nama`, `kecamatan_id`, `jenjang`, `status_sekolah`, `akreditasi`, `alamat`, `email`, `telepon`, `total_guru`, `total_siswa`, `latitude`, `longitude`, `status_pengisian`, `last_updated`, `created_at`, `deleted_at`) VALUES
(467, '20501492', 'SD NEGERI SUKO 2', 7, 'SD', 'Negeri', 'A', 'Jl Sungon Suko No 1', 'sdnegerisukodua@gmail.com', '0318945467', 24, 616, -7.4487000, 112.6816000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(468, '20501491', 'SD NEGERI SIMOKETAWANG', 17, 'SD', 'Negeri', 'A', 'Jl. Pendidikan No. 03', 'sdnsimoketawang@gmail.com', '-', 8, 167, -7.4463000, 112.6038000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(469, '20501490', 'SD NEGERI SINGKALAN', 9, 'SD', 'Negeri', 'B', 'Singkalan', 'sdnsingkalan236@gmail.com', '085706760316', 7, 163, -7.4202000, 112.4845000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(470, '20501489', 'SD NEGERI SINGOGALIH', 10, 'SD', 'Negeri', 'A', 'Jln. Raya Singogalih', 'sdnsingogalih01@gmail.com', '0', 8, 157, -7.4569000, 112.5048000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(471, '20501488', 'SD NEGERI SINGOPADU', 16, 'SD', 'Negeri', 'A', 'Singopadu', 'singopadusdn@gmail.com', '0318850824', 13, 212, -7.4753000, 112.6413000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(472, '20501485', 'SD NEGERI SIWALANPANJI', 5, 'SD', 'Negeri', 'A', 'Jl. Raya Siwalanpanji No.13', 'sdn42siwalanpanji@gmail.com', '0318927140', 19, 389, -7.4323000, 112.7284000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(473, '20501483', 'SD NEGERI SRUNI 1', 3, 'SD', 'Negeri', 'A', 'Jl. Jambu No.475', 'sdnsruni1@gmail.com', '03199603514', 10, 215, -7.3999000, 112.7171000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(474, '20501482', 'SD NEGERI SRUNI 2', 3, 'SD', 'Negeri', 'A', 'Jl. Kramat No. 393', 'sdn_sruni2@yahoo.com', '0318010685', 21, 432, -7.3989000, 112.7195000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(475, '20501481', 'SD NEGERI SUDIMORO', 16, 'SD', 'Negeri', 'A', 'Jl. Balai Desa', 'sdnsudimoro660@gmail.com', '0318850773', 7, 174, -7.4710000, 112.6651000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(476, '20501480', 'SD NEGERI SUGIHWARAS', 18, 'SD', 'Negeri', 'A', 'Jl. H Nur No. 14', 'sdn.sugihwaras.56@gmail.com', '0318969657', 34, 671, -7.4780000, 112.7040000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(477, '20501479', 'SD NEGERI SUKO 1', 7, 'SD', 'Negeri', 'A', 'Jl Raya Suko No 102 Suko Sidoarjo', 'sdnsuko1@gmail.com', '8940643', 17, 268, -7.4461000, 112.6786000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(478, '20501477', 'SD NEGERI PENAMBANGAN', 9, 'SD', 'Negeri', 'A', 'Jl. Pisang No.1', 'sdnpenambangan@gmail.com', '-', 15, 318, -7.4088000, 112.5306000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(479, '20501476', 'SD NEGERI PLUMBUNGAN', 6, 'SD', 'Negeri', 'A', 'Jl Raya Plumbungan No 1', 'sdnplumbungans90@gmail.com', '8833430', 13, 289, -7.3906000, 112.6606000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(480, '20501475', 'SD NEGERI PONOKAWAN', 8, 'SD', 'Negeri', 'A', 'Jl. Raya Ponokawan - Krian', 'sdnpunokawan@gmail.com', '0318983974', 9, 147, -7.3950000, 112.5970000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(481, '20501474', 'SD NEGERI POPOH', 17, 'SD', 'Negeri', 'A', 'Popoh', 'sdnpopoh@gmail.com', '-', 8, 76, -7.4437000, 112.6141000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(482, '20501472', 'SD NEGERI PORONG', 13, 'SD', 'Negeri', 'A', 'Porong', 'sdnporong@gmail.com', '03438450640', 15, 230, -7.5447000, 112.6913000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(483, '20501471', 'SD NEGERI PRAMBON 1', 11, 'SD', 'Negeri', 'B', 'Prambon', 'prambon1sdn@gmail.com', '-', 8, 95, -7.4732000, 112.5524000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(484, '20501470', 'SD NEGERI PRASUNG', 5, 'SD', 'Negeri', 'B', 'Jalan Mbah Sholeh No.421', 'sdnprasung001@gmail.com', '03199712850', 8, 171, -7.4275000, 112.7442000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(485, '20501469', 'SD NEGERI PUCANGANOM', 7, 'SD', 'Negeri', 'A', 'Jl. Raden Patah No.06', 'sdnpucanganom234@gmail.com', '0318968778', 15, 225, -7.4564000, 112.7228000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(486, '20501467', 'SD NEGERI PUCANG 2', 7, 'SD', 'Negeri', 'A', 'Jl A. Yani No 6', 'sdn_pucang2@gmail.com', '0318950867', 23, 534, -7.4447000, 112.7189000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(487, '20501466', 'SD NEGERI PUCANG 3', 7, 'SD', 'Negeri', 'A', 'Jl Cokronegoro No 2', 'sdnpucangtiga@gmail.com', '0318950882', 16, 381, -7.4451000, 112.7188000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(488, '20501465', 'SD NEGERI PUCANG 4', 7, 'SD', 'Negeri', 'A', 'Jl. A. Yani  No. 6A Sidoarjo', 'sdn_pucang_4@yahoo.co.id', '0318964093', 14, 294, -7.4448000, 112.7185000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(489, '20501461', 'SD NEGERI PENATAR SEWU', 15, 'SD', 'Negeri', 'B', 'Penatar Sewu', 'sdnpenatarsewu369@gmail.com', '085852633889', 8, 109, -7.5202000, 112.7385000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(490, '20501460', 'SD NEGERI PEPE', 4, 'SD', 'Negeri', 'A', 'Jl. A. Faqih no.1', 'pepe.sdn@gmail.com', '0318914521', 23, 519, -7.3983000, 112.7696000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(491, '20501459', 'SD NEGERI PEPELEGI 2', 1, 'SD', 'Negeri', 'A', 'Jl Jatisari Permai IX/1-A', 'sdnpepelegi2@gmail.com', '0318542375', 21, 475, -7.3633000, 112.7192000, 'belum', '2026-09-12 08:37:57', '2026-09-10 05:44:13', NULL),
(492, '20501458', 'SD NEGERI PERMISAN', 14, 'SD', 'Negeri', 'A', 'Jln. Kihajar Dewantara No.45', 'sdnpermisan@gmail.com', '-', 8, 66, -7.5426000, 112.7439000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(493, '20501457', 'SD NEGERI PERTAPANMADURETNO', 2, 'SD', 'Negeri', 'A', 'Pertapanmaduretno Rt 03 Rw 01', 'sdn.pertapanmd@gmail.com', '0317877605', 11, 219, -7.3699000, 112.6269000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(494, '20501453', 'SD NEGERI PILANG 1', 17, 'SD', 'Negeri', 'A', 'Pilang', 'sdnpilangsatuwny@gmail.com', '0318850484', 18, 281, -7.4467000, 112.6517000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(495, '20501452', 'SD NEGERI PILANG 2', 17, 'SD', 'Negeri', 'B', 'Jl. Raya Pilang No. 12 Rame', 'sdn_pilang_2@yahoo.co.id', '0318957374', 9, 75, -7.4471000, 112.6603000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(496, '20501451', 'SD NEGERI PLAOSAN 2', 17, 'SD', 'Negeri', 'B', 'Plaosan', 'plaosansdn2@gmail.com', '-', 8, 77, -7.4121000, 112.6268000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(497, '20501450', 'SD NEGERI PLAOSAN 1', 17, 'SD', 'Negeri', 'B', 'Plaosan', 'sdnplaosan0@gmail.com', '0', 9, 76, -7.4175000, 112.6258000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(498, '20501449', 'SD NEGERI PLOSO', 12, 'SD', 'Negeri', 'A', 'Jl. Raya Ploso Krembung', 'sdnplosokrembung@gmail.com', '0343858033', 9, 143, -7.5144000, 112.6508000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(499, '20501446', 'SD NEGERI SEKETI', 9, 'SD', 'Negeri', 'A', 'Seketi', 'sdnseketi@gmail.com', '081249234277', 15, 265, -7.4288000, 112.5682000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(500, '20501445', 'SD NEGERI SAWOTRATAP 2', 3, 'SD', 'Negeri', 'A', 'Jl Raden Wijaya Gg Sekolahan', 'sdnsawotratap2@gmail.com', '8543961', 12, 180, -7.3736000, 112.7313000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(501, '20501441', 'SD NEGERI GRINTING', 16, 'SD', 'Negeri', 'A', 'Grinting', 'sdngrintingt@gmail.com', '0318854911', 8, 161, -7.4710000, 112.6338000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(502, '20501440', 'SD NEGERI SEBANI 1', 10, 'SD', 'Negeri', 'A', 'Sebani', 'sdnsebaniisatu@yahoo.co.id', '-', 7, 128, -7.4418000, 112.4832000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(503, '20501439', 'SD NEGERI SEBANI 2', 10, 'SD', 'Negeri', 'A', 'Jl.Kahuripan No.01', 'sdnsebanidua@gmail.com', '-', 8, 153, -7.4417000, 112.4826000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(504, '20501438', 'SD NEGERI SEDATI AGUNG', 4, 'SD', 'Negeri', 'A', 'Jl. Raya Sedati Agung No.23', 'sdnsedatiagung402@gmail.com', '0318673720', 18, 355, -7.3837000, 112.7616000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(505, '20501437', 'SD NEGERI SEDATI GEDE 1', 4, 'SD', 'Negeri', 'A', 'Jln. Raya Sedati Gede 130', 'wahyunierlief@yahoo.co.id', '8669431', 24, 552, -7.3779000, 112.7624000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(506, '20501436', 'SD NEGERI SEDATI GEDE 2', 4, 'SD', 'Negeri', 'A', 'Jln. H. Syukur', 'sdnsedatigede2@gmail.com', '8673467', 25, 590, -7.3777000, 112.7574000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(507, '20501435', 'SD NEGERI SEDENGANMIJEN', 8, 'SD', 'Negeri', 'A', 'Jl. Raya Sedenganmijen No. 01', 'sdnsedenganmijen@yahoo.co.id', '0318973021', 13, 261, -7.4246000, 112.5869000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(508, '20501434', 'SD NEGERI SEGODOBANCANG', 10, 'SD', 'Negeri', 'B', 'Jl RONO MENGGOLO', 'sdn_segodobancang@yahoo.com', '085655180255', 8, 95, -7.4351000, 112.5344000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(509, '20501433', 'SD NEGERI SEGORO TAMBAK', 4, 'SD', 'Negeri', 'B', 'Jln. Segoro Tambak No.1', 'sdn.segorotambak@yahoo.co.id', '8912420', 8, 73, -7.3679000, 112.8076000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(510, '20501432', 'SD NEGERI SEKARDANGAN', 7, 'SD', 'Negeri', 'A', 'Jl Wijaya Kusuma 83 Sidoarjo', 'sdn.sekardanganq@gmail.com', '0318951238', 18, 428, -7.4645000, 112.7247000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(511, '20501431', 'SD NEGERI SAWOTRATAP 1', 3, 'SD', 'Negeri', 'A', 'Jl. Hayam Wuruk 73', 'sdn_sawotratap1@yahoo.com', '0318546523', 32, 626, -7.3713000, 112.7339000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(512, '20501430', 'SD NEGERI SAWOHAN 2', 5, 'SD', 'Negeri', 'B', 'Kepetingan', 'sdn2sawohanbuduran@gmail.com', '081703455366', 7, 28, -7.4654000, 112.7955000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(513, '20501429', 'SD NEGERI PUNGGUL 1', 3, 'SD', 'Negeri', 'A', 'Jl. Rajawali No. 10 Rt.6 Rw. 1', 'sdnpunggul1@gmail.com', '0318916606', 14, 290, -7.3993000, 112.7317000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(514, '20501428', 'SD NEGERI PUNGGUL 2', 3, 'SD', 'Negeri', 'A', 'Jl Rajawali No 51', 'punggul.dua@gmail.com', '0318917847', 20, 409, -7.3989000, 112.7331000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(515, '20501427', 'SD NEGERI PUTAT', 15, 'SD', 'Negeri', 'B', 'Jl Anggrek No 2', 'sdnputat27@gmail.com', '-', 8, 101, -7.5065000, 112.7336000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(516, '20501425', 'SD NEGERI RANGKAH KIDUL', 7, 'SD', 'Negeri', 'A', 'Jl P. Jawa No 06', 'sdnrangkid@gmail.com', '0318968980', 14, 244, -7.4626000, 112.7357000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(517, '20501424', 'SD NEGERI REJENI', 12, 'SD', 'Negeri', 'A', 'Rejeni', 'sdn.rejenikrb@gmail.com', '082245286481', 9, 127, -7.5143000, 112.6367000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(518, '20501417', 'SD NEGERI SAMBIBULU', 2, 'SD', 'Negeri', 'A', 'SAMBIBULU', 'sdnsambibulu_ab@yahoo.co.id', '0317873471', 16, 279, -7.3682000, 112.6684000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(519, '20501416', 'SD NEGERI SADANG', 2, 'SD', 'Negeri', 'A', 'Jl.raya Sadang', 'sdnsadang365@gmail.com', '0317876975', 7, 149, -7.3769000, 112.6779000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(520, '20539910', 'SD NEGERI KUPANG 4', 14, 'SD', 'Negeri', 'C', 'Jl. Tambak Kalilalo No 66', 'sdnkupang.empat@gmail.com', '0', 7, 17, -7.5115000, 112.8239000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(521, '20502361', 'SD NEGERI BLURU KIDUL 1', 7, 'SD', 'Negeri', 'B', 'Jl. Raya Bluru Kidul NO. 11', 'blurukidulone@gmail.com', '8944566', 8, 119, -7.4479000, 112.7305000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(522, '20537090', 'SD NEGERI WATUTULIS 2', 11, 'SD', 'Negeri', 'A', 'Jl. Untung Suropati Ds. Watutulis Kec. Prambon', 'sdn.watutulis2oke@gmail.com', '085745617861', 9, 162, -7.4401000, 112.5723000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(523, '20539924', 'SD NEGERI SUKODONO 2', 6, 'SD', 'Negeri', 'A', 'Jl. Raya Dungus No.14', 'sdnsukodono485@gmail.com', '0317887686', 8, 110, -7.3917000, 112.6749000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(524, '20502399', 'SD TAMAN HARAPAN', 3, 'SD', 'Swasta', 'A', 'Jl. Mandala VI / 576 A', 'sdtamanharapan576@gmail.com', '8680049', 9, 51, -7.3780000, 112.7493000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(525, '20539881', 'SD MUTIARA BUNDA', 7, 'SD', 'Swasta', 'B', 'Perum Pondok Mutiara Mec 1-11', 'sdmutiarabunda@yahoo.com', '8054311', 2, 28, -7.4502000, 112.7026000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(526, '20501468', 'SD NEGERI PUCANG 1', 7, 'SD', 'Negeri', 'A', 'Jl A. Yani No 2 Sidoarjo', 'pucang1_sdn@yahoo.co.id', '0318921521', 22, 576, -7.4438000, 112.7193000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(527, '20501447', 'SD NEGERI PULUNGAN', 4, 'SD', 'Negeri', 'B', 'Jl. Perintis 2  no 34/B  RT.02 RW. 01 PULUNGAN, SEDATI - SIDOARJO', 'sdnegeripulungan@gmail.com', '0318912440', 8, 166, -7.3956000, 112.7677000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(528, '20539937', 'SD PASAR IKAN', 7, 'SD', 'Swasta', 'A', 'Jl. Pasar Ikan No. 15 Sidoarjo', 'sds.pasiki15@gmail.com', '0318054977', 9, 47, -7.4536000, 112.7211000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(529, '70000954', 'SD ISLAM AR - RAHMAH', 6, 'SD', 'Swasta', 'A', 'Dsn. Lengki Suruh Kec. Sidoarjo', 'sdislamarrahmah45@gmail.com', '081332806043', 15, 263, -7.4027069, 112.6655532, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(530, '20539939', 'SDSABILUR ROSYAD', 7, 'SD', 'Swasta', 'A', 'Jl Hang Tuah Pulo 22 Sidoarjo Jawa Timur', 'ssbilurrosyad@gmail.com', '0318959727', 10, 91, -7.4546000, 112.7198000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(531, '20502400', 'SD MUHAMMADIYAH 8 TULANGAN', 16, 'SD', 'Swasta', 'A', 'Jl Raya Kenongo', 'sdmuhdelta@yahoo.com', '0318850184', 21, 336, -7.4831000, 112.6486000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(532, '20501609', 'SD NEGERI MOJORANGAGUNG', 17, 'SD', 'Negeri', 'B', 'SDN Mojorangagung', 'sdn.mojorangagung@yahoo.co.id', '082230461352', 8, 128, -7.4315000, 112.6690000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(533, '20502416', 'SD NEGERI BANJARASRI', 15, 'SD', 'Negeri', 'B', 'Jl. Desa Banjarasri RT. 03 RW. 01', 'sdnbanjarasri11@gmail.com', '087882587896', 8, 86, -7.5094000, 112.7448000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(534, '20501840', 'SD NEGERI TEMU 1', 11, 'SD', 'Negeri', 'B', 'Jl. Pertukangan', 'sdntemu001@gmail.com', '-', 8, 89, -7.4446000, 112.5757000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(535, '20501464', 'SD NEGERI PUCANG 5', 7, 'SD', 'Negeri', 'A', 'Jl. Jenggolo III No. 65 Sidoarjo', 'sdn.pucang.5@gmail.com', '0', 9, 167, -7.4427000, 112.7215000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(536, '20502235', 'SD NEGERI KEBOANSIKEP 2', 3, 'SD', 'Negeri', 'A', 'Jl. Balai Desa Perum Permata', 'sdnkeboansikep2@ymail.com', '03185582494', 23, 468, -7.3878000, 112.7222000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(537, '20502281', 'SD NEGERI KALITENGAH 2', 15, 'SD', 'Negeri', 'A', 'Jl. Lapangan', 'sdnkalitengah2kectanggulangin@gmail.com', '0318050774', 8, 182, -7.5079000, 112.7101000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(538, '20501463', 'SD NEGERI PLUMBON 2', 13, 'SD', 'Negeri', 'B', 'Jl Balai Desa Plumbon No.01', 'sdnplumbonporong2@gmail.com', '081274599716', 8, 74, -7.5339000, 112.7375000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(539, '20502216', 'SD NEGERI KEBONAGUNG 4', 13, 'SD', 'Negeri', 'B', 'Kebonagung', 'sdnkb.agungiv@yahoo.com', '-', 8, 66, -7.5458000, 112.6791000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(540, '20501879', 'SD NEGERI WONOMLATI', 12, 'SD', 'Negeri', 'B', 'Wonomlati', 'sdnegeriwonomlati@gmail.com', '0318852276', 8, 124, -7.4949000, 112.6253000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(541, '20501829', 'SD NEGERI TAMBAKSAWAH', 1, 'SD', 'Negeri', 'A', 'Jl. Jabon No 1-2', 'sdn.tambaksawah@gmail.com', '0318676737', 15, 312, -7.3612000, 112.7800000, 'belum', '2026-09-12 08:37:58', '2026-09-10 05:44:13', NULL),
(542, '20501419', 'SD NEGERI SAWOCANGKRING', 17, 'SD', 'Negeri', 'A', 'JL. RAYA SAWOCANGKRING', 'sawocangkringsdn6@gmail.com', '0318832361', 9, 146, -7.4156000, 112.6523000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(543, '20576103', 'SD KHAZANAH ILMU', 2, 'SD', 'Swasta', 'A', 'Jl. Ubi II No. 23 Wage Taman Sidoarjo', 'institusi.khazanahilmu@gmail.com', '0318553790', 29, 541, -7.3755000, 112.7091000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(544, '60702938', 'SD ISLAM SARI BUMI', 7, 'SD', 'Swasta', 'A', 'JL.RAYA LINGKAR TIMUR KM 06', 'sdisaribumi@gmail.com', '0318071631', 40, 656, -7.4499000, 112.7377000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(545, '20501621', 'SD NEGERI PAMOTAN', 13, 'SD', 'Negeri', 'B', 'Beringin RT 007 RW 003, Desa Pamotan Kec. Porong, Kab. Sidoarjo', 'sdnpamotan7@gmail.com', '0343858987', 8, 107, -7.5248000, 112.6932000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(546, '20501803', 'SD NEGERI WEDI', 3, 'SD', 'Negeri', 'A', 'Jl. Pasir Tengah No.01 RT.01 RW.02 Wedi, Kec. Gedangan', 'sdnwedi377@gmail.com', '03199601445', 15, 252, -7.3871000, 112.7473000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(547, '20539899', 'SD NEGERI JOGOSATRU', 6, 'SD', 'Negeri', 'B', 'Jl. Jogosatru No. 04', 'sdnjogosatru@gmail.com', '03199641898', 8, 147, -7.3977000, 112.6310000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(548, '20502199', 'SD NEGERI GEDANG 2', 13, 'SD', 'Negeri', 'A', 'Jl. Wr. Supratman No 72', 'sdn_gedang2@ymail.com', '0343857789', 9, 114, -7.5353000, 112.6985000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(549, '20502312', 'SD DARUSSALAMAH', 8, 'SD', 'Swasta', 'B', 'Jl. Kyai Mojo', 'darussalamah.sd@gmail.com', '085648623465', 2, 24, -7.4148000, 112.5829000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(550, '20539950', 'SD MUHAMMADIYAH 01 WARU', 1, 'SD', 'Swasta', 'A', 'Jl. Anggrek VI No. 36-38', 'sdmuhammadiyahsatuwaru@yahoo.co.id', '0318543285', 21, 499, -7.3630000, 112.7370000, 'belum', '2026-09-12 08:37:58', '2026-09-10 05:44:13', NULL),
(551, '20501426', 'SD NEGERI RANDEGAN', 15, 'SD', 'Negeri', 'A', 'Jl Raya Randegan', 'sdn_randegan@yahoo.com', '0318853406', 12, 199, -7.4956000, 112.6796000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(552, '20502163', 'SD NEGERI GRABAGAN', 16, 'SD', 'Negeri', 'A', 'Jln. Patmosari', 'sdngrabagan@gmail.com', '03177058033', 19, 376, -7.4500000, 112.6237000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(553, '20501651', 'SD NEGERI MEDAENG 2', 1, 'SD', 'Negeri', 'A', 'Jl Nugroho No 69 Medaeng', 'sdn.medaeng.02@gmail.com', '0318535490', 15, 273, -7.3584000, 112.7105000, 'belum', '2026-09-12 08:37:58', '2026-09-10 05:44:13', NULL),
(554, '20502307', 'SD KRISTEN PETRA 13', 1, 'SD', 'Swasta', 'A', 'Jl. Taman Asri Utara 59 Pondok Tjandra Indah', 'sdkristenpetra13@gmail.com', '0318672442', 44, 665, -7.3405000, 112.7765000, 'belum', '2026-09-12 08:37:58', '2026-09-10 05:44:13', NULL),
(555, '20501619', 'SD NEGERI PANGGREH 2', 14, 'SD', 'Negeri', 'A', 'Panggreh', 'sdnpanggreh2jabon@gmail.com', '0343658380', 10, 223, -7.5628000, 112.7332000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(556, '20537077', 'SD NEGERI PRAMBON 2', 11, 'SD', 'Negeri', 'A', 'Jl. Pahlawan No.2', 'sdnprambon2@gmail.com', '0318975296', 8, 76, -7.4725000, 112.5599000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(557, '20537057', 'SD NEGERI GEBANG 2', 7, 'SD', 'Negeri', 'C', 'Kampung Desa Pucukan', 'sdngebang2@yahoo.co.id', '081231408048', 5, 13, -7.4923000, 112.8040000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(558, '20539878', 'SD MUHAMMADIYAH 2 TAMAN', 2, 'SD', 'Swasta', 'A', 'Jl. Husein Idris 14', 'sdmuhsepanjang@ymail.com', '0317877760', 37, 636, -7.3420000, 112.6990000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(559, '20502270', 'SD NEGERI KALISAMPURNO 1', 15, 'SD', 'Negeri', 'A', 'Jl Secoboyo No 6', 'sdnkalsam1@gmail.com', '0318853122', 9, 185, -7.5137000, 112.6963000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(560, '20551658', 'SD KREATIF THE NAFF', 18, 'SD', 'Swasta', 'A', 'Perum Palem Putri N24-28', 'thenaff.sd.kreatif@gmail.com', '031806184', 32, 225, -7.4948000, 112.7223000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(561, '20501884', 'SD NEGERI WONOKALANG', 17, 'SD', 'Negeri', 'B', 'Wonokalang', 'sdnwonokalang501wonoayu@gmail.com', '03181470909', 8, 84, -7.4263000, 112.6044000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(562, '20502166', 'SD NEGERI GLAGAHARUM', 13, 'SD', 'Negeri', 'A', 'Jln Ranupati 09', 'sdnglagaharumkita@gmail.com', '-', 15, 229, -7.5314000, 112.7271000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(563, '20501636', 'SD NEGERI KUPANG', 14, 'SD', 'Negeri', 'A', 'Kupang Lor', 'sdkupang@gmail.id', '0343858928', 8, 138, -7.5513000, 112.7540000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(564, '20537080', 'SD NEGERI SEDURI 2', 9, 'SD', 'Negeri', 'B', 'Seduri', 'seduri2babe@gmail.com', '081233788093', 9, 122, -7.4159000, 112.5099000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(565, '20558953', 'SDWIDYA WIYATA', 7, 'SD', 'Swasta', 'A', 'Jl. Sekawan Ayu No. 9 - 17 Perum. BCF Sidoarjo', 'widyawiyataschool@yahoo.com', '0318926033', 16, 130, -7.4585000, 112.7278000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(566, '20501625', 'SD NEGERI PAGERNGUMBUK 2', 17, 'SD', 'Negeri', 'B', 'Pagerngumbuk', 'sdnpagerngumbuk2@yahoo.com', '03199890265', 10, 79, -7.4312000, 112.6170000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(567, '20501599', 'SD NEGERI KEMANTREN 2', 16, 'SD', 'Negeri', 'A', 'Jln. Balai Desa', 'sdnkemantren2oke@gmail.com', '8851389', 12, 232, -7.4709000, 112.6449000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(568, '20501641', 'SD NEGERI KREMBUNG 1', 12, 'SD', 'Negeri', 'A', 'Jl. Raya Krembung', 'www.sdnkrembung1@yahoo.com', '0318854624', 17, 287, -7.5074000, 112.6215000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(569, '20501523', 'SD NEGERI SIDOKARE 2', 7, 'SD', 'Negeri', 'A', 'Jl. Kutuk Barat Sidokare', 'sdnsidokare2@gmail.com', '8962712', 19, 421, -7.4596000, 112.7085000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(570, '20501904', 'SDS MAARIF NU NGABAN', 15, 'SD', 'Swasta', 'B', 'Jl. Raya Ngaban No. 23', 'sdmaarifnungaban@gmail.com', '0318056932', 14, 265, -7.5047000, 112.7207000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(571, '69899722', 'SD Muhammadiyah 1 Sedati', 4, 'SD', 'Swasta', 'B', 'Jl. H. Syukur No.65', 'sdmusada16@gmail.com', '03135942057', 22, 380, -7.3783000, 112.7595000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(572, '20502284', 'SD NEGERI JIMBARAN KULON', 17, 'SD', 'Negeri', 'A', 'Jl. Raya Jimbaran Kulon Rt.002 Rw. 001', 'sdn_jimbaran_kulon@ymail.com', '0318983880', 24, 459, -7.4407000, 112.6305000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(573, '20501579', 'SD NEGERI KEDUNGREJO 1', 14, 'SD', 'Negeri', 'B', 'Jl. Gayam No.97', 'sdnkedungrejo1no97@gmail.com', '-', 8, 109, -7.5708000, 112.7477000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(574, '20501454', 'SD NEGERI PESAWAHAN', 13, 'SD', 'Negeri', 'A', 'Pesawahan', 'sdnpesawahanporong@gmail.com', '0318857475', 8, 106, -7.5140000, 112.6800000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(575, '20501547', 'SD NEGERI KEPUNTEN', 16, 'SD', 'Negeri', 'A', 'Kepunten', 'sdnkepunten450@gmail.com', '-', 12, 216, -7.4585000, 112.6244000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(576, '69853498', 'SD NEGERI KALISAMPURNO 3', 15, 'SD', 'Negeri', 'A', 'PERUMTAS II Blok R', 'sdnkalisampurno3@gmai.com', '0', 17, 326, -7.5071000, 112.7039000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(577, '20501421', 'SD NEGERI SAWOHAN 1', 5, 'SD', 'Negeri', 'B', 'Sawohan', 'sdnsawohan1@gmail.com', '-', 7, 110, -7.4264000, 112.7682000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(578, '20501610', 'SD NEGERI MODONG', 16, 'SD', 'Negeri', 'A', 'Jl Raya Modong', 'sdnmodongtln@gmail.com', '-', 8, 137, -7.4600000, 112.6491000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(579, '20501448', 'SD NEGERI PLOSO', 17, 'SD', 'Negeri', 'A', 'Ploso-wonoayu', 'sdnploso.wonoayu@gmail.com', '085730593999', 7, 124, -7.4345000, 112.6390000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(580, '20502369', 'SD NEGERI BECIRONGENGOR', 17, 'SD', 'Negeri', 'A', 'Becirongengor', 'sdnbecirongengor123@gmail.com', '0318833808', 16, 309, -7.4142000, 112.6425000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(581, '20502240', 'SD NEGERI KEDENSARI 1', 15, 'SD', 'Negeri', 'A', 'Jl. Raya Kedensari Tanggulangin', 'sdnkedensari1@yahoo.co.id', '0318853146', 8, 117, -7.4980000, 112.6908000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(582, '20539877', 'SD MUHAMMADIYAH 1 TAMAN', 2, 'SD', 'Swasta', 'A', 'Jl. Raya Bebekan 269', 'sdmuhsepanjang01@gmail.com', '0317881549', 41, 637, -7.3452000, 112.6980000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(583, '20502285', 'SD NEGERI DAMARSI', 5, 'SD', 'Negeri', 'B', 'Jalan Ir. H Juanda', 'sdndamarsi@yahoo.com', '0318913973', 16, 336, -7.4149000, 112.7587000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(584, '20502360', 'SD NEGERI BLURU KIDUL 2', 7, 'SD', 'Negeri', 'A', 'Jl Balai Desa No 51 Sidoarjo', 'sdnblurukidul2@gmail.com', '8953860', 14, 291, -7.4491000, 112.7334000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(585, '20539923', 'SD NEGERI SUKO', 6, 'SD', 'Negeri', 'A', 'Jl. Raya Suko No. 1', 'sdnsukosukodono@gmail.com', '0318549275', 31, 647, -7.3786000, 112.7027000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(586, '20501543', 'SD NEGERI KEDUNGSUMUR 1', 12, 'SD', 'Negeri', 'B', 'Kedungsumur', 'sdnkedungsumur1@gmail.com', '0343857865', 8, 123, -7.5365000, 112.6596000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(587, '20501608', 'SD NEGERI MOJORUNTUT 1', 12, 'SD', 'Negeri', 'B', 'Mojoruntut', 'sdnmojoruntut1@gmail.com', '0343851667', 8, 96, -7.5233000, 112.6310000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(588, '20539930', 'SD NEGERI TROMPOASRI 2', 14, 'SD', 'Negeri', 'A', 'Trompoasri', 'sdntrompo2@gmail.com', '0343658320', 10, 155, -7.5694000, 112.7361000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(589, '70056864', 'SDIT Bina Karakter Luhur', 19, 'SD', 'Swasta', '-', 'Jl. Argopuro No.354 Kel. Sisir Kec. Batu Kota Batu', '-', '-', 1, 28, NULL, NULL, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(590, '70006761', 'SD ISLAM AL-FALAH', 21, 'SD', 'Swasta', 'A', 'JL. PANGLIMA BESAR SUDIRMAN RT.02 RW.06', 'sdislamalfalahbatu@gmail.com', '0341513909', 13, 150, -7.9110000, 112.5390000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(591, '69989068', 'SD ISLAM ABI', 20, 'SD', 'Swasta', 'B', 'JL. MATASIM NO.3 DESA BULUKERTO RT 01 RW.02', '450sdiabi@gmail.com', '-', 9, 121, -7.8459000, 112.5315000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(592, '69984572', 'SD MUSLIM CENDEKIA', 19, 'SD', 'Swasta', 'A', 'Jl. Imam Bonjol Gg.2 No. 6A RT.01 RW.01', 'muslimcendekiabatu@gmail.com', '-', 27, 468, -7.8787000, 112.5309000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(593, '69974458', 'SD INTEGRAL AL-FATTAH ', 19, 'SD', 'Swasta', 'B', 'Jl. Cemara Intan Gg. II Kampung Ladu RT.04,RW.03 ', 'sd@alfattahbatu.sch.id', '03415104041', 24, 416, -7.8431230, 112.5274210, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(594, '69969378', 'SDIT TAHFIDZ AL MUNAWWAR', 19, 'SD', 'Swasta', 'A', 'Jl. Melati No 11 RT.01 RW 05', 'almunawwar16@gmail.com', '085856552909', 10, 135, -7.8671890, 112.5053935, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(595, '69727596', 'SDI SABILUL KHOIR BEJI', 21, 'SD', 'Swasta', 'B', 'Jl. Makam No.33 RT.03 RW.04', 'sdsabilulkhoir@gmail.com', '0341513443', 13, 213, -7.8892000, 112.5488000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(596, '20571506', 'SD-IT IBNU HAJAR', 19, 'SD', 'Swasta', 'B', 'Jl. Perum Puri Indah Gondorejo', 'sditibnuhajar@yahoo.co.id', '03413016238', 17, 287, -7.8947733, 112.5428050, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(597, '20554537', 'SD NEGERI TULUNGREJO 05', 20, 'SD', 'Negeri', 'B', 'Jl. Anjarnyoto no 01 Dusun Kekep Desa Tulungrejo', 'sdtulung_rejo05@yahoo.co.id', '0341598640', 8, 69, -7.8200567, 112.5220200, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(598, '20551660', 'SD NEGERI PESANGGRAHAN 02', 19, 'SD', 'Negeri', 'B', 'Jl. Cempaka Atas 1', 'sekolahdasarnegeripesanggrahan@gmail.com', '082245296711', 7, 90, -7.8838233, 112.5015000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(599, '20539422', 'SD K SANG TIMUR', 19, 'SD', 'Swasta', 'A', 'Jl. Panglima Sudirman 59A', 'sdksangtimurbatu@yahoo.com', '0341593778', 17, 311, -7.8693000, 112.5196000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(600, '20539420', 'SD NEGERI NGAGLIK 2', 19, 'SD', 'Negeri', 'A', 'Jl. Ikhwan Hadi No. 41', 'ngaglik.02.sdn@gmail.com', '0341592587', 18, 320, -7.8730767, 112.5206950, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(601, '20536910', 'SD NEGERI SISIR 04', 19, 'SD', 'Negeri', 'B', 'Jl. Imam Bonjol III / 15', 'sdn.sisir.04batu@gmail.com', '0341595678', 6, 58, -7.8786200, 112.5297717, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(602, '20536909', 'SD NEGERI ORO-ORO OMBO 01', 19, 'SD', 'Negeri', 'B', 'Jl. Raya Oro-oro Ombo', 'sdnoroombosatu@yahoo.co.id', '0341512291', 8, 85, -7.8908433, 112.5332850, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(603, '20536908', 'SD NEGERI NGAGLIK 04', 19, 'SD', 'Negeri', 'B', 'Jl. Darsono Barat 27', 'sdnngagliknolempat@gmail.com', '03413370007', 8, 72, -7.8705317, 112.5159700, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(604, '20536907', 'SD NEGERI NGAGLIK 03', 19, 'SD', 'Negeri', 'B', 'Jl. Abdul Gani IV / 29', 'ngaglik03@gmail.com', '596643', 7, 69, -7.8766000, 112.5194000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(605, '20536906', 'SD NEGERI NGAGLIK 01', 19, 'SD', 'Negeri', 'A', 'Jl. Abdul Rahman 23', 'sdn.ngagliksatu@gmail.com', '0341593768', 23, 476, -7.8726000, 112.5208000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(606, '20536905', 'SD NEGERI MOJOREJO 02', 21, 'SD', 'Negeri', 'A', 'Jl. Masjid No. 23', 'sdmojorejodua@gmail.com', '0341590640', 9, 150, -7.8999000, 112.5588000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(607, '20536904', 'SD NEGERI MOJOREJO 01', 21, 'SD', 'Negeri', 'A', 'Jl. Mojopahit No. 02', 'mojorejosdn1@gmail.com', '0341464602', 19, 410, -7.9053767, 112.5690450, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(608, '20536903', 'SD NEGERI JUNREJO 02', 21, 'SD', 'Negeri', 'A', 'Jl. RA. KARTINI NO. 27 JUNREJO', 'sdn.junrejo02@gmail.com', '0341462322', 14, 330, -7.9109400, 112.5574100, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(609, '20536901', 'SD NEGERI JUNREJO 01', 21, 'SD', 'Negeri', 'A', 'Jl. Hasanudin 57', 'sdnjunsa@yahoo.com', '0341464241', 18, 355, -7.9083000, 112.5529000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(610, '20536900', 'SD NEGERI GUNUNGSARI 04 BATU', 20, 'SD', 'Negeri', 'B', 'Jl. Argomulyo 20 Brau', 'sdngnsari04@gmail.com', '-', 6, 41, -7.8461000, 112.4951483, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(611, '20536899', 'SD NEGERI GUNUNGSARI 03', 20, 'SD', 'Negeri', 'B', 'Dsn. Kandangan', 'sdngunungsari03ku@gmail.com', '0341590240', 7, 110, -7.8429383, 112.5126600, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(612, '20536898', 'SD NEGERI GUNUNGSARI 02', 20, 'SD', 'Negeri', 'A', 'Jl. Wongso 45 Pagergunung', 'gngsari02@gmail.com', '03413382453', 8, 106, -7.8361650, 112.5193167, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(613, '20536897', 'SD NEGERI GUNUNGSARI 01', 20, 'SD', 'Negeri', 'B', 'Jl. Brumbung 73', '01gunungsari@gmail.com', '0341590150', 7, 141, -7.8415583, 112.5146500, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(614, '20536896', 'SD NEGERI ORO-ORO OMBO 02', 19, 'SD', 'Negeri', 'B', 'Jl. Raya Oro - Oro Ombo 36', 'sdrombo2@gmail.com', '0341595238', 16, 379, -7.8915183, 112.5328000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(615, '20536895', 'SD NEGERI ORO ORO OMBO 03', 19, 'SD', 'Negeri', 'B', 'Jl. Tvri Rt 03 Rw 10 Dresel', 'sdoroombo03@gmail.com', '0341513859', 7, 113, -7.9059033, 112.5229300, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(616, '20536894', 'SD NEGERI PANDANREJO 01', 20, 'SD', 'Negeri', 'A', 'Jl. Raya Pandanrejo No.1A', 'sdnpandanrejo01batu@gmail.com', '0341594290', 8, 143, -7.8636767, 112.5364150, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(617, '20536893', 'SD NEGERI SISIR 03', 19, 'SD', 'Negeri', 'A', 'Jl. Imam Bonjol III / 13.D', 'sdnsisir03@gmail.com', '0341595733', 11, 158, -7.8782000, 112.5293000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(618, '20536892', 'SD NEGERI SISIR 02', 19, 'SD', 'Negeri', 'C', 'Jl Arjuno No 40 D', 'sisirtwo@gmail.com', '0341595959', 0, 0, -7.8690567, 112.5298417, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(619, '20536891', 'SD NEGERI SISIR 01', 19, 'SD', 'Negeri', 'A', 'Jl. Arjuno 40 D', 'sdnsisir01batu@yahoo.com', '0341597710', 10, 196, -7.8691000, 112.5299000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(620, '20536889', 'SD NEGERI SIDOMULYO 03', 19, 'SD', 'Negeri', 'B', 'Jl. Mawar Putih 141 Rt. 03 Rw. 12', 'sdnsidomulyo03@yahoo.co.id', '0341596566', 15, 259, -7.8430483, 112.5237750, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(621, '20536887', 'SD NEGERI SIDOMULYO 02', 19, 'SD', 'Negeri', 'B', 'Jl. Cemara Kipas 120', 'sidomulyo02@mail.com', '599044', 8, 164, -7.8512050, 112.5259183, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(622, '20536886', 'SD NEGERI SIDOMULYO 01', 19, 'SD', 'Negeri', 'B', 'Jl. Bukit Berbunga 70', 'sidomulyo.elementaryschool.01@gmail.com', '0341594221', 8, 87, -7.8508000, 112.5278417, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(623, '20536884', 'SD NEGERI PUNTEN 01', 20, 'SD', 'Negeri', 'A', 'Jl. Raya Punten  24', 'espunsakotabatu@gmail.com', '0341597550', 21, 443, -7.8382000, 112.5286000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(624, '20536883', 'SD NEGERI PESANGGRAHAN 01', 19, 'SD', 'Negeri', 'B', 'Jl. Suropati 123', 'arie_dagingku@yahoo.com', '0341592934', 7, 106, -7.8733250, 112.5140583, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(625, '20536881', 'SD NEGERI PENDEM 02', 21, 'SD', 'Negeri', 'B', 'Jl. Dr. Moh. Hatta No. 134', 'pendem_02@ymail.com', '0341531114', 13, 310, -7.9022000, 112.5802000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(626, '20536880', 'SD NEGERI PENDEM 01', 21, 'SD', 'Negeri', 'A', 'Jl. Drs. Moh. Hatta No. 118', 'sdnpendem01@gmail.com', '0341463166', 24, 583, -7.9018833, 112.5822667, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(627, '20536879', 'SD NEGERI PANDANREJO 02', 20, 'SD', 'Negeri', 'B', 'Jl. Raya Pandanrejo 122', 'sdn.pandanrejo02@gmail.com', '0341590430', 9, 153, -7.8645983, 112.5455567, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(628, '20536878', 'SD NEGERI GIRIPURNO 03', 20, 'SD', 'Negeri', 'B', 'Jl. Indrokilo No 01', 'sdngiripurno03@gmail.com', '0341595043', 11, 177, -7.8621250, 112.5523700, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(629, '20536877', 'SD NEGERI GIRIPURNO 02', 20, 'SD', 'Negeri', 'B', 'Jl. Arjuno 9', 'sdgiripurno2@gmail.com', '0341513880', 17, 332, -7.8636000, 112.5591000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(630, '20536876', 'SD NEGERI GIRIPURNO 01', 20, 'SD', 'Negeri', 'B', 'Jl. Raya Giripurno 221', 'sdngrp01@gmail.com', '0341599565', 16, 281, -7.8666000, 112.5619000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(631, '20536875', 'SD ISLAM AL HUDA', 19, 'SD', 'Swasta', 'B', 'Jl. Abdul Gani Atas', 'sdalhuda94@gmail.com', '082233950186', 7, 44, -7.8842700, 112.5167700, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(632, '20536874', 'SD IMMANUEL', 19, 'SD', 'Swasta', 'A', 'Jl. Wukir Batu', 'sekolahdasar.immanuel84@gmail.com', '0341599317', 19, 290, -7.8789283, 112.5361533, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(633, '20536873', 'SD CITRA BUNDA', 19, 'SD', 'Swasta', 'B', 'Jl. Sudiro 12', 'SD_citrabunda12@yahoo.com', '591089', 9, 74, -7.8737733, 112.5263000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(634, '20536859', 'SD NEGERI DADAPREJO 02', 21, 'SD', 'Negeri', 'A', 'Jl. Martorejo', 'dadaprejo.02@gmail.com', '03415056384', 8, 107, -7.9087000, 112.5727000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(635, '20536858', 'SD NEGERI DADAPREJO 01', 21, 'SD', 'Negeri', 'A', 'Jl. Martorejo 1A', 'sdndadaprejo01@gmail.com', '0341460242', 14, 276, -7.9107467, 112.5798767, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(636, '20536857', 'SD NEGERI BUMIAJI 02', 20, 'SD', 'Negeri', 'B', 'Jl. Kastubi No. 01', 'sdnbumiaji02@gmail.com', '0341511371', 9, 98, -7.8604067, 112.5386883, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(637, '20536856', 'SD NEGERI BUMIAJI 01', 20, 'SD', 'Negeri', 'B', 'Jl. Abu Ghonaim 31', 'esbumsa01@gmail.com', '03413380567', 10, 128, -7.8566917, 112.5368500, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(638, '20536855', 'SD NEGERI BULUKERTO 03', 20, 'SD', 'Negeri', 'B', 'Jl. Nur Hadi No. 1 Cangar Bulukerto', 'bulukertocangar@gmail.com', '0341590850', 8, 85, -7.8514983, 112.5297267, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(639, '20536853', 'SD NEGERI BULUKERTO 01', 20, 'SD', 'Negeri', 'B', 'Jl. Kenanga', 'sdnbulukerto01@gmail.com', '03415025040', 8, 103, -7.8428000, 112.5316000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(640, '20536851', 'SD NEGERI BEJI 02', 21, 'SD', 'Negeri', 'B', 'Jl. Sarimun V', 'sdnbeji02junrejo@gmail.com', '0341593483', 9, 120, -7.8942000, 112.5481000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(641, '20536850', 'SD NEGERI BEJI 01', 21, 'SD', 'Negeri', 'A', 'Jl. Ir. SOEKARNO ( Ex. Jl. Raya Beji 42 )', 'sdnbeji01kwbatu@gmail.com', '0341594025', 14, 320, -7.8916000, 112.5483000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(642, '20536848', 'SD PLUS AL IRSYAD', 19, 'SD', 'Swasta', 'B', 'Jl. Semeru I / 8', 'Sdplusalirsyad_alislamiyyah@yahoo.co.id', '596078', 23, 468, -7.8693000, 112.5270000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(643, '20536847', 'SD MUHAMMADIYAH 05 BATU', 20, 'SD', 'Swasta', 'B', 'Jl. Masjid 14 Banaran', 'sdm05.bmj@gmail.com', '0341513076', 8, 81, -7.8551517, 112.5365817, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(644, '20536813', 'SD NEGERI SISIR 05', 19, 'SD', 'Negeri', 'A', 'Jl. Arjuna 60', 'sdsisirlima@gmail.com', '0341593467', 9, 202, -7.8691000, 112.5289000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(645, '20536812', 'SD NEGERI TLEKUNG 01', 21, 'SD', 'Negeri', 'B', 'Jl. Raya Tlekung 51', 'tlekungsd@gmail.com', '03413371020', 7, 119, -7.9168417, 112.5411600, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(646, '20536811', 'SD NEGERI TEMAS 02', 19, 'SD', 'Negeri', 'B', 'Jl.Wukir VIII/37', 'sdntemas02batu@gmail.com', '599693', 8, 147, -7.8762950, 112.5452133, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(647, '20536809', 'SD NEGERI TEMAS 01', 19, 'SD', 'Negeri', 'A', 'Jl. Patimura 23', 'sdn.temas01_batu@yahoo.com', '0341598194', 18, 328, -7.8829000, 112.5384000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(648, '20536808', 'SDN SUMBERGONDO 02', 20, 'SD', 'Negeri', 'B', 'Jl. Tegalsari 5', 'sdnsumbergondo2@gmail.com', '0341524021', 8, 93, -7.8186667, 112.5336267, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(649, '20536807', 'SD NEGERI SUMBERGONDO 01', 20, 'SD', 'Negeri', 'A', 'Jl. Raya Sumbergondo 2', 'sdnsumbergondo01@gmail.com', '0341513896', 7, 118, -7.8319617, 112.5308050, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(650, '20536806', 'SD NEGERI SUMBEREJO 03', 19, 'SD', 'Negeri', 'B', 'Jl. Metro No 22 Santrean Sumberejo Kecamatan Batu Kota Batu', 'Sumberejo.sd03@gmail.com', '0341524949', 8, 93, -7.8529000, 112.5192000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(651, '20536805', 'SD NEGERI SUMBEREJO 02', 19, 'SD', 'Negeri', 'B', 'Jl. Indragiri 81', 'sdnjoda@gmail.com', '0341512006', 7, 159, -7.8552000, 112.5132000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(652, '20536804', 'SD NEGERI SUMBEREJO 01', 19, 'SD', 'Negeri', 'A', 'Jl. Indragiri 79', 'sdnsumberejo01kotabatu@gmail.com', '03415025609', 8, 93, -7.8555050, 112.5130833, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(653, '20536803', 'SD NEGERI SONGGOKERTO 03', 19, 'SD', 'Negeri', 'A', 'Jl. Arum Dalu 65 A', 'sdnsonggokerto03@gmail.com', '0341524961', 8, 94, -7.8619733, 112.4996933, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(654, '20536802', 'SD NEGERI SONGGOKERTO 02', 19, 'SD', 'Negeri', 'B', 'Jl. Teratai II / 23', 'sdn02songgokerto@gmail.com', '0341512587', 9, 94, -7.8650917, 112.5050667, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(655, '20536801', 'SD NEGERI SONGGOKERTO 01', 19, 'SD', 'Negeri', 'B', 'Jl. Trunojoyo V / 2A', 'sdsonggokerto01@gmail.com', '0341512224', 8, 103, -7.8650550, 112.5056883, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(656, '20536800', 'SD NEGERI SISIR 06', 19, 'SD', 'Negeri', 'A', 'Jl. Imam Bonjol Gg. III No. 15B', 'sdnsisir06@gmail.com', '0341595740', 9, 153, -7.8784383, 112.5299650, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(657, '20536799', 'SD NEGERI TLEKUNG 02', 21, 'SD', 'Negeri', 'B', 'Jl Raya Tlekung RT 03 RW 06', 'sdntlekung02@gmail.com', '03415025027', 9, 168, -7.9114333, 112.5387300, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(658, '20536798', 'SD NEGERI TORONGREJO 02', 21, 'SD', 'Negeri', 'B', 'Jl. Cendana Ngukir', 'sdntorongrejodua@gmail.com', '-', 8, 65, -7.8874983, 112.5593633, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(659, '20536797', 'SD NEGERI TORONGREJO 03', 21, 'SD', 'Negeri', 'B', 'Jl. Aji Mustofa No. 53', 'torongrejo_03@yahoo.co.id', '0341513455', 8, 86, -7.8781550, 112.5535533, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(660, '20536778', 'SD NEGERI TORONGREJO 01', 21, 'SD', 'Negeri', 'B', 'Jl. Wukir Ratawu No. 95B', 'sdntorongrejo01@gmail.com', '0341513306', 8, 129, -7.8873000, 112.5595000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(661, '20536775', 'SD NEGERI TULUNGREJO 03', 20, 'SD', 'Negeri', 'B', 'Jl. Raya Sumberbrantas No. 116 Dusun Lemah Putih', 'tulungrejo.03sdn@gmail.com', '0341512250', 16, 356, -7.7686000, 112.5316000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(662, '20536774', 'SD NEGERI TULUNGREJO 04', 20, 'SD', 'Negeri', 'A', 'Dsn. Wonorejo', 'tulungrejo04sdnegeri@gmail.com', '0341595514', 17, 239, -7.7978000, 112.5236000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(663, '70000401', 'SD ISLAM CAHAYA SUNNAH', 19, 'SD', 'Swasta', 'C', 'Jl. Abdul Rahman No. 7', 'sdicahayasunnahkotabatu@gmail.com', '082141414675', 15, 139, -7.8725000, 112.5224000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(664, '20536854', 'SD NEGERI BULUKERTO 02', 20, 'SD', 'Negeri', 'A', 'Jl. Imam Sujono 19', 'sdnbulukerto02@gmail.com', '0341597400', 9, 119, -7.8373583, 112.5303767, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(665, '20536885', 'SD NEGERI PUNTEN 02', 20, 'SD', 'Negeri', 'A', 'Jl. Anjasmoro 12', 'sdnpunten02@gmail.com', '597727', 8, 115, -7.8311000, 112.5247000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(666, '20536776', 'SD NEGERI TULUNGREJO 01', 20, 'SD', 'Negeri', 'B', 'Jl. Diponegoro 182', 'sdntulungrejo1@gmail.com', '0341595483', 9, 163, -7.8220483, 112.5304083, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(667, '20539421', 'SD NEGERI TULUNGREJO 02', 20, 'SD', 'Negeri', 'A', 'Jl. Asparagus 27 Junggo', 'tulungrejo02sdn@gmail.com', '0341595146', 9, 143, -7.8000000, 112.5269867, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(668, '70062471', 'SDI AR-ROHMAH', 21, 'SD', 'Swasta', '-', 'Jl.Langsep RT.30 RW.07', '-', '-', 5, 0, NULL, NULL, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(669, '20536860', 'SD MUHAMMADIYAH 04 BATU', 19, 'SD', 'Swasta', 'A', 'Jl. Welirang 17', 'sdmuh04batu@gmail.com', '0341590755', 36, 690, -7.8733133, 112.5307167, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(670, '70053198', 'SD MUHAMMADIYAH 3 SOKO', 31, 'SD', 'Swasta', '-', 'Jl. Raya Soko-Ponco Dsn.Mentoro RT.8 RW.1 Desa Mentoro Soko', '-', '-', 3, 8, NULL, NULL, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(671, '70052332', 'SD ISLAM AL-UMARIYYAH', 36, 'SD', 'Swasta', '-', 'Jl. Blora No. 107 Desa Wotsogo Jatirogo', '-', '-', 5, 56, -6.8853000, 111.6574000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(672, '70037850', 'SD MODERN EL MUMTAZ', 30, 'SD', 'Swasta', '-', 'Dsn. Beron Desa Pungulrejo  RT.002 RW.006', 'sdelmumtaz1@gmail.com', '081252144288', 5, 76, 0.0017000, 0.0001000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(673, '70031973', 'SD PLUS INSAN CENDEKIA TUBAN', 25, 'SD', 'Swasta', '-', 'Jalan Raya Tuban-Babat KM 1 Nomor 54 Tuban', 'sdplusict@gmail.com', '082233117798', 8, 99, -6.9166000, 112.0847000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(674, '70030349', 'SDIT AN-NUUR SOKO', 31, 'SD', 'Swasta', 'A', 'Jl. Raya Soko-Ponco RT.006 RW. 001 Sokosari', '-', '081335335799', 16, 204, -7.1174000, 111.9410000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(675, '69995881', 'SD ISLAM MADINATUL QUR`AN', 26, 'SD', 'Swasta', 'B', 'Jalan Goa Suci Dusun Krajan RT 06 RW 01', 'sdi.madinatulquran@gmail.com', '085606822009', 9, 19, -6.9148000, 112.1692000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(676, '69992890', 'SDI CENDEKIA ASSALAM', 35, 'SD', 'Swasta', 'B', 'Jalan Raya Bangilan No 01', 'sdic.assalam@gmail.com', '083117266677', 17, 323, -6.9679000, 111.7155000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(677, '69977537', 'SDIT AN-NAJIYAH TUBAN', 25, 'SD', 'Swasta', 'B', 'JL. HOS Cokroaminoto 257a', 'sditannajiyahtuban@gmail.com', '085800713243', 8, 110, -6.9084000, 112.0710000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(678, '69975596', 'SD ALAM EL-YAMIEN', 25, 'SD', 'Swasta', 'B', 'Jl. Mojopahit Gg. Tenun Tuban', 'mail@sd-alam-elyamien.sch.id', '082230659393', 9, 80, -6.9070320, 112.0590700, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(679, '69975397', 'SD MUHAMMADIYAH 2 PALANG TUBAN', 26, 'SD', 'Swasta', 'A', 'DESA LERAN KULON', 'sdm2palang@gmail.com', '085730426891', 20, 299, -6.9148000, 112.1510000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(680, '69975050', 'SD ISLAM TERPADU AL-HIKMAH', 39, 'SD', 'Swasta', 'A', 'Jalan Kelud 27 (Komplek PP Al-Hikmah) Desa Margomulyo', 'sdit.alhikmahmargomulyo@gmail.com', '-', 20, 340, -6.8925000, 111.8876000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(681, '69972668', 'SD PILAR NUSANTARA', 22, 'SD', 'Swasta', 'B', 'Jl. Diponegoro 44 Tuban ', 'sdpinus2016@gmail.com', '0356331622', 11, 149, -6.8929760, 112.0406600, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(682, '69967531', 'SD ISLAM ADZIKRI', 24, 'SD', 'Swasta', 'A', 'Ds. Tuwiri Wetan RT.02 RW.02 Kec. Merakurak', 'sdiadzikri@gmail.com', '712695', 8, 148, -6.8801690, 111.9822030, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(683, '69966224', 'SD ISLAM GHILMANI', 40, 'SD', 'Swasta', 'B', 'Jl. Tuban-Semarang KM.30 Tambakboyo', 'sdighilmani@gmail.com', '082334208752', 8, 59, -6.8035000, 111.8491000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(684, '69964025', 'SDIT MUMTAZUL QUR`AN', 40, 'SD', 'Swasta', 'B', 'Jl. Tengiri No. 01 Desa Merkawang Kec. Tambakboyo', 'sditmumtazqu@gmail.com', '085854312790', 7, 33, -6.8065270, 111.8878740, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(685, '69962648', 'SD ISLAM TERPADU AL USWAH JATIROGO', 36, 'SD', 'Swasta', 'A', 'Jl. Raya Bulu Desa Bader Kec. Jatirogo', 'sditaluswah6@gmail.com', '085732844386', 8, 158, -6.8824000, 111.6531000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(686, '69930506', 'SD INTEGRAL HIDAYATULLAH SEMANDING', 25, 'SD', 'Swasta', 'B', 'Kelurahan Karang Semanding', 'integraltuban@gmail.com', '03568833250', 11, 134, -6.9044000, 112.0501000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(687, '20574709', 'SD ISLAM FAAZ', 22, 'SD', 'Swasta', 'B', 'Dusun Mawot RT 02 RW, 01', 'faazsdit@gmail.com', '085792738432', 10, 196, -6.8902567, 112.0205468, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(688, '20554378', 'SD ISLAM AL HADAD SINGGAHAN', 33, 'SD', 'Swasta', 'B', 'Jl. Ra. Kartini No. 17', 'sdi.alhadad@gmail.com', '081231263600', 19, 323, -7.0165000, 111.7892000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(689, '20548363', 'SD ISLAM TERPADU AL USWAH', 22, 'SD', 'Swasta', 'A', 'Jalan Al Falah II Gang Al Uswah No.06', 'al.uswah@gmail.com', '0356322004', 34, 676, -6.8998200, 112.0400983, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(690, '20547265', 'SD BINA ANAK SHOLEH', 22, 'SD', 'Swasta', 'A', 'Jln. Dr. Wahidin Sudirohusodo No.45 Tuban', 'sdbas45tuban@gmail.com', '035638832350', 38, 784, -6.8942517, 112.0400828, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(691, '20547264', 'SDI INSAN KAMIL', 22, 'SD', 'Swasta', 'A', 'Jl. Mutiara Desa Kembangbilo', 'sdislam.insankamil@gmail.com', '0356331988', 35, 604, -6.9011617, 112.0366233, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(692, '20539017', 'UPT SD NEGERI SUMURGUNG 2', 22, 'SD', 'Negeri', 'B', 'Jln. Al Mutamakin No. 03', 'santotsensei@gmail.com', '0356711643', 6, 146, -6.9006456, 112.0095459, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(693, '20505814', 'UPT SD NEGERI BEKTIHARJO 4', 25, 'SD', 'Negeri', 'B', 'Desa Bektiharjo', 'sdnbektiharjoiv.tuban@gmail.com', '-', 10, 97, -6.9401000, 112.0488000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(694, '20505811', 'UPT SD NEGERI BEKTIHARJO 1', 25, 'SD', 'Negeri', 'B', 'Desa Bektiharjo', 'uptsdnbektiharjo@gmail.com', '-', 7, 193, -6.9415000, 112.0479000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(695, '20505810', 'UPT SD NEGERI BEJI 2', 23, 'SD', 'Negeri', 'B', 'Jl. Raya Bogang - Beji No. 212 Kec. Jenu', 'beji02sdn@yahoo.com', '0', 6, 78, -6.8243433, 111.9783100, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(696, '20505808', 'UPT SD NEGERI BELIKANGET', 40, 'SD', 'Negeri', 'B', 'Belikanget', 'sdnbelikangetz@gmail.com', '-', 7, 55, -6.8288000, 111.8091000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(697, '20505807', 'UPT SD NEGERI BESOWO', 36, 'SD', 'Negeri', 'B', 'Desa Besowo', 'sdnbesowo2020@gmail.com', '03567004937', 6, 143, -6.8516000, 111.6561000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(698, '20505806', 'UPT SD NEGERI BINANGUN 1', 33, 'SD', 'Negeri', 'B', 'Binangun Rt. 06 Rw. 02', 'sdnbinangun1@gmail.com', '085230671551', 6, 55, -7.0226000, 111.7699000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(699, '20505802', 'UPT SD NEGERI BOGOREJO', 24, 'SD', 'Negeri', 'B', 'Jln. Bogorejo No. 322', 'sdnbogorejo122@gmail.com', '-', 4, 96, -6.8837367, 112.0183517, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(700, '20505801', 'UPT SD NEGERI BOREHBANGLE', 24, 'SD', 'Negeri', 'B', 'Desa Borehbangle', 'sdn_borehbangle@yahoo.co.id', '0356712109', 7, 83, -6.8704833, 111.9711283, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(701, '20505800', 'UPT SD NEGERI BEJI 1', 23, 'SD', 'Negeri', 'A', 'Jl. Raya Beji No. 76 Jenu', 'beji1jenu@yahoo.com', '0356711460', 13, 285, -6.8297000, 111.9970000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(702, '20505798', 'UPT SD NEGERI BANJARAGUNG 2', 30, 'SD', 'Negeri', 'B', 'Jl. Raya Banjaragung No. 399', 'sdnbanjaragung02@yahoo.co.id', '082139482741', 6, 153, -7.0409000, 112.0482000, 'belum', NULL, '2026-09-10 05:44:13', NULL);
INSERT INTO `satuan_pendidikan` (`id`, `npsn`, `nama`, `kecamatan_id`, `jenjang`, `status_sekolah`, `akreditasi`, `alamat`, `email`, `telepon`, `total_guru`, `total_siswa`, `latitude`, `longitude`, `status_pengisian`, `last_updated`, `created_at`, `deleted_at`) VALUES
(703, '20505795', 'UPT SD NEGERI BANJARJO', 41, 'SD', 'Negeri', 'C', 'Desa Banjarjo', 'sdnbanjarjo1bancar@gmail.com', '083135248508', 6, 99, -6.7765000, 111.7252000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(704, '20505793', 'UPT SD NEGERI BANJARWORO 2', 35, 'SD', 'Negeri', 'B', 'Jl. Desa Banjarworo', 'sdnbanjarworo568@gmail.com', '-', 6, 106, -6.9513000, 111.7171000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(705, '20505792', 'UPT SD NEGERI BANYUBANG', 42, 'SD', 'Negeri', 'B', 'Jln. Banyubang', 'sdnbanyubang@gmail.com', '-', 7, 89, -7.0337000, 111.9681000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(706, '20505791', 'UPT SD NEGERI BANYUURIP 1', 34, 'SD', 'Negeri', 'B', 'Banyuurip', 'banyuurip01sdn@gmail.com', '085327466622', 7, 91, -7.0626000, 111.6990000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(707, '20505790', 'UPT SD NEGERI BANYUURIP 2', 34, 'SD', 'Negeri', 'B', 'Banyuurip', 'sdnbanyuuripnjangur@gmail.com', '085204247345', 8, 88, -7.0636000, 111.7082000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(708, '20505788', 'UPT SD NEGERI BATE 1', 35, 'SD', 'Negeri', 'B', 'Jl. Desa Bate No. 397', 'sdnbatebangilan67@gmail.com', '085232167576', 8, 98, -6.9956000, 111.6867000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(709, '20505787', 'UPT SD NEGERI BATE 2', 35, 'SD', 'Negeri', 'B', 'Jalan Sumur Gede Rt01/rw08', 'sdnbate2@gmail.com', '-', 7, 70, -6.9968000, 111.6865000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(710, '20505786', 'UPT SD NEGERI BATURETNO 1', 22, 'SD', 'Negeri', 'B', 'Jln. Panglima Sudirman No.111', 'sdnbaturetno@yahoo.com', '0356320522', 7, 74, -6.8965367, 112.0729517, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(711, '20505785', 'UPT SD NEGERI BATURETNO 2', 22, 'SD', 'Negeri', 'B', 'Jln. Patimura No. 282', 'sdn.baturetno2@gmail.com', '0356328258', 6, 63, -6.9006000, 112.0702000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(712, '20505779', 'UPT SD NEGERI CINGKLUNG', 41, 'SD', 'Negeri', 'C', 'Desa Cingklung No.1', 'sdncingklung@gmail.com', '085230062439', 7, 59, -6.8122000, 111.8104000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(713, '20505778', 'UPT SD NEGERI COKROWATI 1', 40, 'SD', 'Negeri', 'B', 'Desa Cokrowati', 'sdncokrowati1.402@gmail.com', '-', 7, 72, -6.8282000, 111.8143000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(714, '20505776', 'UPT SD NEGERI COKROWATI 2', 40, 'SD', 'Negeri', 'B', 'Desa Cokrowati', 'sdncokrowati2no.413@gmail.com', '-', 6, 79, -6.8282000, 111.8148000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(715, '20505775', 'UPT SD NEGERI COMPRENG 1', 27, 'SD', 'Negeri', 'A', 'Jln. Raya Compreng No.17', 'sdn.compreng1@gmail.com', '-', 10, 195, -7.0281000, 112.1454000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(716, '20505772', 'UPT SD NEGERI DAGANGAN', 32, 'SD', 'Negeri', 'B', 'Jln. Tumenggung Ario Tedjo No 18 Dagangan', 'sdndagangan1@gmail.com', '081331144558', 11, 86, -7.0212000, 111.8883000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(717, '20505770', 'UPT SD NEGERI DAHOR', 42, 'SD', 'Negeri', 'B', 'Jln. Desa Dahor', 'uptsdndahor168@gmail.com', '085234278164', 7, 104, -7.0131000, 112.0148000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(718, '20505769', 'UPT SD NEGERI DASIN 1', 40, 'SD', 'Negeri', 'B', 'Dasin', 'sdnegeridasin@gmail.com', '082232051057', 4, 35, -6.8105000, 111.8435000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(719, '20505768', 'UPT SD NEGERI DASIN 2', 40, 'SD', 'Negeri', 'B', 'Dasin', 'sdn.dasin02@gmail.com', '-', 6, 106, -6.8148000, 111.8435000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(720, '20505762', 'UPT SD NEGERI BRINGIN', 38, 'SD', 'Negeri', 'B', 'Bringin', 'sdnbringin308@gmail.com', '081230747942', 8, 74, -7.0091817, 111.9078933, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(721, '20505760', 'UPT SD NEGERI BULUJOWO ', 41, 'SD', 'Negeri', 'B', 'Jln. Raya Bulu No. 95', 'sdnbulujowoii@gmail.com', '0356411692', 7, 79, -6.7696000, 111.7175000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(722, '20505759', 'UPT SD NEGERI BULUMEDURO', 41, 'SD', 'Negeri', 'B', 'Desa Bulumeduro', 'sdnbulumeduro@gmail.com', '085231172123', 8, 84, -6.7718000, 111.7295000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(723, '20505757', 'UPT SD NEGERI BULUREJO 2', 30, 'SD', 'Negeri', 'B', 'Bulurejo', 'sdnegeribulurejoii@gmail.com', '085204912535', 6, 116, -7.0899000, 111.9752000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(724, '20505754', 'UPT SD NEGERI CAMPUREJO 1', 30, 'SD', 'Negeri', 'B', 'Jl. Sawunggaling No.01', 'sdn.campurejo1@gmail.com', '-', 8, 77, -7.0660000, 112.0444000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(725, '20505753', 'UPT SD NEGERI CAMPUREJO 2', 30, 'SD', 'Negeri', 'B', 'Dsn Campedan', 'sdn.campurejo2@yahoo.co.id', '-', 5, 51, -7.0401000, 112.0214000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(726, '20505751', 'UPT SD NEGERI CEKALANG', 31, 'SD', 'Negeri', 'B', 'Desa Cekalang', 'sdncekalang212@gmail.com', '-', 8, 55, -7.0806000, 111.9134000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(727, '20505749', 'UPT SD NEGERI BANJAR', 27, 'SD', 'Negeri', 'B', 'Jln. Pendidikan No.33', 'sdn.banjar@yahoo.com', '081216425253', 7, 32, -7.0761000, 112.1758000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(728, '20505715', 'SEKOLAH DASAR ISLAM TUBAN', 22, 'SD', 'Swasta', 'B', 'JL. KH. AGUS SALIM NO. 44 TUBAN', 'sdislamtuban@gmail.com', '0356326154', 13, 180, -6.8923099, 112.0565599, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(729, '20505714', 'SD MUHAMMADIYAH 1 BANCAR', 41, 'SD', 'Swasta', 'B', 'Jln. Raya No. 8', 'sdm1_bcr@yahoo.co.id', '0356411771', 14, 285, -6.7713000, 111.7251000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(730, '20505713', 'SD PUSAKA', 22, 'SD', 'Swasta', 'B', 'Jln. Ronggolawe No. 45', 'sdpusakatuban@gmail.com', '0356321187', 11, 43, -6.8946293, 112.0575585, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(731, '20505712', 'SD KATOLIK SANTO PETRUS', 22, 'SD', 'Swasta', 'A', 'Jln. Panglima Sudirman No. 159', 'sdk_st.petrus@yahoo.com', '0356322508', 13, 180, -6.8921767, 112.0602650, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(732, '20505710', 'UPT SD NEGERI BANCAR 1', 41, 'SD', 'Negeri', 'B', 'Jln. Raya Bancar No. 128', 'sdnbancar_satu@yahoo.com', '0356412062', 8, 51, -6.7821000, 111.7758000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(733, '20505709', 'UPT SD NEGERI BANCAR 2', 41, 'SD', 'Negeri', 'B', 'Jln. Raya Bancar No. 60', 'sdnbancardua442@gmail.com', '-', 7, 94, -6.7832000, 111.7819000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(734, '20505706', 'UPT SD NEGERI BANGILAN 1', 35, 'SD', 'Negeri', 'B', 'Jl Raya Bangilan No.11', 'sdnbangilan01@gmail.com', '03564214181', 11, 199, -6.9602000, 111.7147000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(735, '20505705', 'UPT SD NEGERI BANGILAN 2', 35, 'SD', 'Negeri', 'B', 'Jl Kh Misbah  No  67', 'sdn_bangilandua@yahoo.co.id', '03564214473', 7, 92, -6.9614000, 111.7114000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(736, '20505704', 'UPT SD NEGERI BANGILAN 3', 35, 'SD', 'Negeri', 'B', 'Jalan Satria No 115', 'sdnbangilaniii@gmail.com', '03564214184', 8, 107, -6.9721000, 111.7096000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(737, '20505683', 'UPT SD NEGERI JETAK 3', 38, 'SD', 'Negeri', 'B', 'Dsn. Kerokan', 'sdnjetakiii@gmail.com', '-', 5, 37, -6.9800250, 111.9406633, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(738, '20505680', 'UPT SD NEGERI KARANGREJO 1', 41, 'SD', 'Negeri', 'B', 'Desa Karangrejo', 'sdn.karangrejo01@gmail.com', '085232862101', 8, 70, -6.8151000, 111.7641000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(739, '20505669', 'UPT SD NEGERI KARANGREJO 2', 41, 'SD', 'Negeri', 'B', 'Desa Karangrejo', 'sdkarangrejo02@gmail.com', '085233451567', 6, 64, -6.8151000, 111.7631000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(740, '20505665', 'UPT SD NEGERI KARANGTINOTO 1', 30, 'SD', 'Negeri', 'B', 'Jl.Desa Karangtinoto', 'sdnkarangtinoto1@gmail.com.id', '082146708893', 7, 80, -7.1063000, 111.9650000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(741, '20505664', 'UPT SD NEGERI KARANGTINOTO 2', 30, 'SD', 'Negeri', 'B', 'Desa Karangtinoto', 'sdnkarangtinotoii@gmail.com', '085231168687', 8, 112, -7.1099000, 111.9888000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(742, '20505660', 'UPT SD NEGERI KAYEN 2', 41, 'SD', 'Negeri', 'B', 'Desa Kayen', 'nanikrahayuningsih86@gmail.com', '083833919080', 6, 77, -6.8260000, 111.7421000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(743, '20505656', 'UPT SD NEGERI KARANGASEM', 23, 'SD', 'Negeri', 'B', 'Dusun Karangasem', 'sdnkarangasem589@gmail.co.id', '085646278318', 7, 69, -6.8051583, 111.8933150, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(744, '20505655', 'UPT SD NEGERI JLODRO', 37, 'SD', 'Negeri', 'B', 'Dsn Jlodro', 'sdn.jlodro123@gmail.com', '-', 6, 82, -6.9252000, 111.5820000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(745, '20505654', 'UPT SD NEGERI JOMBOK', 36, 'SD', 'Negeri', 'B', 'Jalan Jombok Barat No 189', 'sdn_jombok@yahoo.co.id', '082139487990', 8, 78, -6.8818000, 111.6432000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(746, '20505653', 'UPT SD NEGERI KABLUKAN 1', 35, 'SD', 'Negeri', 'B', 'Jln Desa Ngrojo-Sidotentrem', 'sdnkablukan1@gmail.com', '-', 5, 64, -6.9820000, 111.7119000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(747, '20505652', 'UPT SD NEGERI KABLUKAN 2', 35, 'SD', 'Negeri', 'C', 'Desa Kablukan', 'sdnkablukan268@gmail.com', '085274343159', 7, 45, -6.9796000, 111.7019000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(748, '20505647', 'UPT SD NEGERI KANOREJO 2', 30, 'SD', 'Negeri', 'B', 'Ds Kanorejo', 'sdn_kanorejo02@yahoo.com', '08124921174', 6, 64, -7.0960000, 112.0011000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(749, '20505646', 'UPT SD NEGERI KAPU 1', 24, 'SD', 'Negeri', 'B', 'Desa Kapu', '3.sddnkapusatu@gmail.com', '-', 8, 59, -6.8891783, 111.9891233, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(750, '20505645', 'UPT SD NEGERI KAPU 2', 24, 'SD', 'Negeri', 'B', 'Desa Kapu', 'sdnkapu2@gmail.com', '085731969726', 7, 82, -6.9091783, 111.9665650, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(751, '20505639', 'UPT SD NEGERI KEDUNGSOKO 3', 29, 'SD', 'Negeri', 'B', 'Desa Kedungsoko', 'sdn.kedungsoko3@yahoo.com', '085708213843', 8, 57, -7.0993000, 111.8852000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(752, '20505638', 'UPT SD NEGERI KEMBANGBILO', 22, 'SD', 'Negeri', 'B', 'Jln. Desa Kembangbilo No. 01', 'sdnkembangbilo@gmail.com', '-', 8, 107, -6.9010669, 112.0290611, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(753, '20505634', 'UPT SD NEGERI KENANTI', 40, 'SD', 'Negeri', 'B', 'Jl Husada No. 03', 'uptsdnkenanti593@gmail.com', '08165474585', 8, 125, -6.8019000, 111.8507000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(754, '20505631', 'UPT SD NEGERI KEPOHAGUNG 1', 29, 'SD', 'Negeri', 'B', 'Jl Desa Kepohagung', 'sdn.kepohagung1@gmail.com', '081249002414', 7, 68, -7.0482000, 112.0749000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(755, '20505629', 'UPT SD NEGERI KESAMBEN 1', 29, 'SD', 'Negeri', 'B', 'Jl Desa Kesamben', 'didikprasetiyo02@gmail.com', '085940690774', 8, 156, -7.0352000, 112.0731000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(756, '20505624', 'UPT SD NEGERI KEDUNGSOKO 1', 29, 'SD', 'Negeri', 'B', 'Dusun Sisir', 'sdn.kedungsokosatu@gmail.com', '-', 8, 117, -7.0856000, 112.1331000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(757, '20505623', 'UPT SD NEGERI KEBONSARI 1', 22, 'SD', 'Negeri', 'A', 'Jln. Gajah Mada No. 20', 'sdnkebonsari01@yahoo.co.id', '0356323963', 13, 336, -6.9045333, 112.0636533, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(758, '20505622', 'UPT SD NEGERI KEBONSARI 2', 22, 'SD', 'Negeri', 'A', 'Jln. Akbp. Suroko No. 39', 'uptsdnegerikebonsari2@gmail.com', '0356324698', 13, 334, -6.9033967, 112.0628033, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(759, '20505621', 'UPT SD NEGERI KEBONSARI 3', 22, 'SD', 'Negeri', 'B', 'Jln. Brawijaya No. 62', 'sdn.kebonsari03tuban@gmail.com', '0356327225', 12, 316, -6.9050067, 112.0649500, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(760, '20505620', 'UPT SD NEGERI KEDUNGHARJO', 35, 'SD', 'Negeri', 'B', 'Ds. Kedungharjo', 'sdnkedungharjo20@gmail.com', '085204945864', 5, 28, -6.9772000, 111.7208000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(761, '20505618', 'UPT SD NEGERI KEDUNGJAMBANGAN', 35, 'SD', 'Negeri', 'B', 'Kedungjambangan', 'sdnkedungjambangan@gmail.com', '-', 7, 125, -6.9363000, 111.6928000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(762, '20505614', 'UPT SD NEGERI KEDUNGMULYO', 35, 'SD', 'Negeri', 'B', 'JALAN PADMO NO.13', 'kedungmulyosd@gmail.com', '-', 5, 64, -6.9604000, 111.7238000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(763, '20505609', 'UPT SD NEGERI KINGKING 1', 22, 'SD', 'Negeri', 'B', 'Jln. Panglima Sudirman No. 813', 'kingking1sdn@gmail.com', '0356322713', 7, 82, -6.8879767, 112.0530117, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(764, '20505608', 'UPT SD NEGERI JETAK 2', 38, 'SD', 'Negeri', 'B', 'Dusun. Boropetung', 'sdnjetak02montong@gmail.com', '0356611715', 6, 133, -6.9634700, 111.9497617, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(765, '20505607', 'UPT SD NEGERI DERMAWUHARJO', 42, 'SD', 'Negeri', 'C', 'Desa Dermawuharjo', '-', '03567038401', 7, 123, -7.0060000, 112.0312000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(766, '20505606', 'UPT SD NEGERI GEDONGOMBO 6', 25, 'SD', 'Negeri', 'B', 'Desa Dukuh Kiring', 'sdn_gedongombo06@yahoo.com', '-', 9, 138, -6.9342000, 112.0858000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(767, '20505605', 'UPT SD NEGERI GEMULUNG 1', 39, 'SD', 'Negeri', 'B', 'Dusun Gandu', 'sdngemulung1456@gmail.com', '-', 7, 86, -6.8703000, 111.8095000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(768, '20505602', 'UPT SD NEGERI GENAHARJO 1', 25, 'SD', 'Negeri', 'B', 'Desa Genaharjo', 'sdngenaharjo01@yahoo.co.id', '-', 6, 94, -6.9686000, 112.0784000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(769, '20505601', 'UPT SD NEGERI GENAHARJO 2', 25, 'SD', 'Negeri', 'A', 'Jln. Genaharjo-Kepet Dusun Maren Wetan', 'sdngenaharjo02@gmail.com', '082245436363', 9, 137, -6.9620000, 112.0740000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(770, '20505599', 'UPT SD NEGERI GESIKAN 2', 42, 'SD', 'Negeri', 'B', 'Jln. Pambuhan', 'sdngesikandua@gmail.com', '085730444094', 7, 147, -6.9992000, 111.9778000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(771, '20505598', 'UPT SD NEGERI GESIKAN 3', 42, 'SD', 'Negeri', 'B', 'Desa Gesikan', 'sdngesikantiga@yahoo.com', '-', 8, 144, -6.9997000, 111.9982000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(772, '20505594', 'UPT SD NEGERI GLAGAHSARI', 31, 'SD', 'Negeri', 'B', 'Ds. Glagahsari', 'sdn.glagahsari192@gmail.com', '-', 8, 80, -7.1476000, 111.9816000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(773, '20505592', 'UPT SD NEGERI GEDONGOMBO 5', 25, 'SD', 'Negeri', 'B', 'Jln. Pahlawan No. 69', 'sdn.ged05@yahoo.co.id', '0356320453', 7, 185, -6.9107000, 112.0778000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(774, '20505587', 'UPT SD NEGERI DINGIL 3', 36, 'SD', 'Negeri', 'C', 'Dusun Sentul', 'sdndingil03@gmail.com', '-', 8, 25, -6.9234000, 111.7154000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(775, '20505586', 'UPT SD NEGERI DOROMUKTI', 22, 'SD', 'Negeri', 'B', 'Jln. Wachid Hasyim No. 426', 'newsdndoromukti@gmail.com', '0356329248', 6, 82, -6.8996917, 112.0552700, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(776, '20505583', 'UPT SD NEGERI GAJI 2', 39, 'SD', 'Negeri', 'B', 'Jl. Raya Gaji', 'sdngaji02@yahoo.com', '-', 6, 104, -6.8761000, 111.8629000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(777, '20505579', 'UPT SD NEGERI GEDONGOMBO 1', 25, 'SD', 'Negeri', 'A', 'Jln. Hayam Wuruk No. 10', 'sdngedongombo01@gmail.com', '0356334296', 13, 311, -6.9079000, 112.0641000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(778, '20505576', 'UPT SD NEGERI GLONDONGGEDE', 40, 'SD', 'Negeri', 'B', 'Desa Glondonggede', 'sdn.glondonggede@yahoo.co.id', '-', 6, 112, -6.8009000, 111.8909000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(779, '20505575', 'UPT SD NEGERI GRABAGAN 1', 42, 'SD', 'Negeri', 'B', 'Jln. Pasar Wage', 'sdngrabagan01@gmail.com', '082131434089', 12, 216, -7.0120000, 111.9838000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(780, '20505571', 'UPT SD NEGERI JATIKLABANG 1', 36, 'SD', 'Negeri', 'B', 'Dusun Ngijo', 'jatiklabangisdn@yahoo.co.id', '-', 8, 112, -6.9187000, 111.6864000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(781, '20505569', 'UPT SD NEGERI JATIMULYO', 29, 'SD', 'Negeri', 'B', 'Jalan Raya Plumpang Compreng', 'sdnjatimulyo0@gmail.com', '0356812554', 8, 92, -7.0303000, 112.1118000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(782, '20505563', 'UPT SD NEGERI JEGULO 1', 31, 'SD', 'Negeri', 'B', 'Jl Raya No.585a', 'sdn.jegulo01@yahoo.co.id', '-', 5, 123, -7.0781000, 111.9433000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(783, '20505562', 'UPT SD NEGERI JEGULO 3', 31, 'SD', 'Negeri', 'B', 'Desa Jegulo', 'sdnjegulo.630@gmail.com', '-', 8, 141, -7.0734000, 111.9303000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(784, '20505561', 'UPT SD NEGERI JENGGOLO', 23, 'SD', 'Negeri', 'B', 'Jalan Raya Jenu-merakurak 88', 'sdnjenggolo@rocketmail.com', '-', 7, 162, -6.8376000, 112.0032000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(785, '20505560', 'UPT SD NEGERI JENU', 23, 'SD', 'Negeri', 'B', 'Desa Jenu', 'sdn.jenu@yahoo.com', '0', 6, 58, -6.8409217, 112.0105817, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(786, '20505549', 'UPT SD NEGERI JAMPRONG 3', 37, 'SD', 'Negeri', 'B', 'Dsn. Kebonduren', 'sdnjamprong03@gmail.com', '085257894574', 8, 28, -6.9770000, 111.6276000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(787, '20505548', 'UPT SD NEGERI JAMPRONG 2', 37, 'SD', 'Negeri', 'B', 'Jln Abiyasa  No. 327', 'sdn02jamprong@gmail.com', '-', 8, 86, -6.9593000, 111.6184000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(788, '20505546', 'UPT SD NEGERI GRABAGAN 3', 42, 'SD', 'Negeri', 'B', 'Jln. Buntasan No.01', 'sdngrabagan253@gmail.com', '085730711172', 7, 95, -7.0228000, 111.9815000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(789, '20505545', 'UPT SD NEGERI GRABAGAN 4', 42, 'SD', 'Negeri', 'A', 'Jalan Raya Grabagan No.195', 'sdngrabaganiv@yahoo.com', '081234953407', 15, 351, -7.0215000, 111.9885000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(790, '20505543', 'UPT SD NEGERI GUWOTERUS 1', 38, 'SD', 'Negeri', 'B', 'Jl Raya Montong-Jojogan', 'sdnguwoterus1@gmail.com', '-', 8, 53, -6.9538000, 111.8391000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(791, '20505542', 'UPT SD NEGERI GUWOTERUS 2', 38, 'SD', 'Negeri', 'B', 'Jalan Raya Montong-Jojogan ', 'guwoterus02sdn@gmail.com', '-', 7, 105, -6.9543633, 111.8327383, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(792, '20505541', 'UPT SD NEGERI HARGORETNO 1', 39, 'SD', 'Negeri', 'B', 'Jl. Raya Kerek Montong KM.3', 'sdn.hargoretno1kerek@gmail.com', '-', 5, 58, -6.9242000, 111.8798000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(793, '20505540', 'UPT SD NEGERI HARGORETNO 2', 39, 'SD', 'Negeri', 'B', 'Jalan Raya Hargoretno', 'sdn.hargoretno2kerek@gmail.com', '-', 6, 100, -6.9313000, 111.8768000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(794, '20505536', 'UPT SD NEGERI JADI 4', 25, 'SD', 'Negeri', 'B', 'Desa Dukuh Bokgede', 'sdnjadi4@gmail.com', '-', 9, 122, -6.9371000, 111.9969000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(795, '20505268', 'UPT SD NEGERI KINGKING 2', 22, 'SD', 'Negeri', 'B', 'Jln. Untung Suropati No. 08', 'arsends@yahoo.co.id', '0356326396', 7, 64, -6.8923180, 112.0585852, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(796, '20505267', 'UPT SD NEGERI TALANGKEMBAR 1', 38, 'SD', 'Negeri', 'C', 'Talangkembar', '-', '082251438232', 8, 40, -6.9601483, 111.8676817, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(797, '20505263', 'UPT SD NEGERI TEGALAGUNG 2', 25, 'SD', 'Negeri', 'B', 'Desa Tegalagung', 'tegalagungsdn@gmail.com', '085720096109', 7, 138, -6.9192000, 112.0490000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(798, '20505259', 'UPT SD NEGERI TEGALREJO 1', 24, 'SD', 'Negeri', 'B', 'Desa Tegalrejo', 'sdntegalrejo1merakurak@gmail.com', '082335539780', 8, 91, -6.9015300, 112.0018733, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(799, '20505258', 'UPT SD NEGERI TEGALREJO 2', 24, 'SD', 'Negeri', 'B', 'Desa Tegalrejo', 'sdntegalrejo2tuban@gmail.com', '-', 7, 71, -6.9359000, 111.9729000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(800, '20505257', 'UPT SD NEGERI TEGALREJO 3', 24, 'SD', 'Negeri', 'B', 'Desa Tegalrejo', 'sdntegalrejo_03@yahoo.com', '082241728451', 8, 66, -6.9268667, 111.9871500, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(801, '20505253', 'UPT SD NEGERI TEMAJI 1', 23, 'SD', 'Negeri', 'B', 'Dusun Karanganyar', 'sdntemaji01@yahoo.co.id', '-', 7, 143, -6.8044583, 111.9373250, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(802, '20505251', 'UPT SD NEGERI TAWARAN 1', 37, 'SD', 'Negeri', 'B', 'Desa Tawaran', 'sdtawaran01@gmail.com', '-', 8, 68, -6.9094702, 111.6098626, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(803, '20505250', 'UPT SD NEGERI TALANGKEMBAR 2', 38, 'SD', 'Negeri', 'B', 'Ds. Talangkembar', 'sdntalangkembar2@gmail.com', '-', 7, 161, -6.9560467, 111.8531767, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(804, '20505246', 'UPT SD NEGERI TAMBAKREJO 1', 30, 'SD', 'Negeri', 'B', 'Desa Tambakrejo', 'sd.tambakrejo1.rengel@gmail.com', '08123427675', 6, 78, -7.1238000, 112.0019000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(805, '20505243', 'UPT SD NEGERI TANGGULANGIN 1', 38, 'SD', 'Negeri', 'B', 'DUSUN TANGGULANGIN', 'sdn.tanggulangin1@gmail.com', '-', 7, 62, -7.0031033, 111.8431650, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(806, '20505242', 'UPT SD NEGERI TANGGULANGIN 2', 38, 'SD', 'Negeri', 'B', 'Dk Tawing', 'sdntanggulangin02@gmail.com', '-', 7, 116, -6.9812417, 111.8494500, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(807, '20505239', 'UPT SD NEGERI TASIKHARJO', 23, 'SD', 'Negeri', 'B', 'Tasikharjo', 'sdntasikharjo@gmail.com', '0356491025', 6, 106, -6.7715950, 111.9487483, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(808, '20505238', 'UPT SD NEGERI TASIKMADU 1', 26, 'SD', 'Negeri', 'B', 'Jln. Nyai Ageng Manyuro No.01', 'sdntasikmadusatu@gmail.com', '0356320829', 8, 143, -6.8980000, 112.0955000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(809, '20505237', 'UPT SD NEGERI TASIKMADU 2', 26, 'SD', 'Negeri', 'B', 'Ds. Tasikmadu', 'sdntasikmadu2.palang@gmail.com', '0', 6, 74, -6.9069000, 112.0986000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(810, '20505236', 'UPT SD NEGERI TEMAJI 2', 23, 'SD', 'Negeri', 'B', 'JLN.TIRTONADI DUKUH TERANGREJO', 'sdntemaji2@gmail.com', '08563037457', 6, 139, -6.8112933, 111.9118083, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(811, '20505235', 'UPT SD NEGERI TEMAJI 3', 23, 'SD', 'Negeri', 'B', 'JL Tirtonadi No.95', 'sdntemaji03_jenu@yahoo.com', '-', 8, 123, -6.7902400, 111.9168550, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(812, '20505232', 'UPT SD NEGERI TUNAH 1', 25, 'SD', 'Negeri', 'B', 'Jln. Raya Tuban Babat No. 68', 'sdntunah1@gmail.com', '-', 8, 122, -6.9458000, 112.1004000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(813, '20505231', 'UPT SD NEGERI TUNAH 2', 25, 'SD', 'Negeri', 'B', 'Desa Tunah', 'sdntunah2@gmail.com', '-', 7, 104, -6.9404000, 112.0997000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(814, '20505230', 'UPT SD NEGERI TUNAH 3', 25, 'SD', 'Negeri', 'B', 'Desa Tunah', 'sdntunah3@gmail.com', '-', 8, 102, -6.9406000, 112.1084000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(815, '20505227', 'UPT SD NEGERI TUWIRI KULON', 24, 'SD', 'Negeri', 'A', 'Jln. Raya Merakurak- Kerek', 'sdntuwirikulon132@gmail.com', '0356712272', 6, 128, -6.8734533, 111.9707150, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(816, '20505226', 'UPT SD NEGERI TUWIRI WETAN 1', 24, 'SD', 'Negeri', 'B', 'Jln. Raya Merakurak - Kerek No. 107', 'sdn_tuwiriwetan_01@yahoo.com', '0356711615', 7, 81, -6.8780050, 111.9817567, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(817, '20505225', 'UPT SD NEGERI TUWIRI WETAN 2', 24, 'SD', 'Negeri', 'B', 'Jln. Raya Merakurak - Montong No. 447', 'sdntuwiriwetan002@gmail.com', '-', 7, 138, -6.8821783, 111.9827817, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(818, '20505224', 'UPT SD NEGERI TUWIRI WETAN 3', 24, 'SD', 'Negeri', 'B', 'Jln. Merakurak - Montong', '-', '085731969726', 6, 27, -6.9053650, 111.9502483, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(819, '20505223', 'UPT SD NEGERI WADUNG', 23, 'SD', 'Negeri', 'B', 'Wadung', 'sdnwadung22@gmail.com', '0', 6, 107, -6.8155067, 111.9856600, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(820, '20505221', 'UPT SD NEGERI WADUNG', 31, 'SD', 'Negeri', 'B', 'Jl. Buyut Bener No. 56 Wadung', 'sdn.wadung_soko@yahoo.com', '081358426912', 8, 94, -7.0531000, 111.9081000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(821, '20505220', 'UPT SD NEGERI WALERAN 1', 42, 'SD', 'Negeri', 'B', 'Jln. Raya Desa Waleran', 'sdnwaleransatu@gmail.com', '-', 9, 141, -6.9987000, 111.9651000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(822, '20505216', 'UPT SD NEGERI TEMANDANG 1', 24, 'SD', 'Negeri', 'B', 'Desa Temandang', 'sdntemandang1merakurak@gmail.com', '082333870928', 7, 84, -6.8637000, 111.9352000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(823, '20505215', 'UPT SD NEGERI TEMANDANG 2', 24, 'SD', 'Negeri', 'B', 'Desa Temandang', 'sdntemandang2@gmail.com', '0356712589', 7, 44, -6.8623883, 111.9343150, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(824, '20505212', 'UPT SD NEGERI TENGGERWETAN', 39, 'SD', 'Negeri', 'B', 'Desa Tenggerwetan RT. 001/RT. 001', 'sdntenggerwetani@gmail.com', '-', 8, 101, -6.9232000, 111.8502000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(825, '20505210', 'UPT SD NEGERI TERGAMBANG', 41, 'SD', 'Negeri', 'B', 'Desa Tergambang', 'sdntergambang222@yahoo.com', '082244831361', 6, 113, -6.7805000, 111.7250000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(826, '20505209', 'UPT SD NEGERI TINGKIS', 33, 'SD', 'Negeri', 'B', 'Desa Tingkis', 'sdn.tingkis.sgh@gmail.com', '081231328128', 8, 158, -6.9772000, 111.7920000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(827, '20505207', 'UPT SD NEGERI TLOGOAGUNG 1', 41, 'SD', 'Negeri', 'B', 'Desa Tlogoagung', 'sdntlogoagung1.bancar@gmail.com', '081326690171', 6, 88, -6.7769000, 111.6693000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(828, '20505206', 'UPT SD NEGERI TLOGOAGUNG 2', 41, 'SD', 'Negeri', 'B', 'Desa Tlogoagung', 'Sdtlogoagung02@gmail.com', '085230828118', 8, 95, -6.7769000, 111.6693000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(829, '20505205', 'UPT SD NEGERI TLOGOWARU', 24, 'SD', 'Negeri', 'B', 'Desa Tlogowaru', 'sdntlogowaru@gmail.com', '085851137060', 6, 77, -6.8528333, 111.9237317, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(830, '20505204', 'UPT SD NEGERI TLUWE', 31, 'SD', 'Negeri', 'B', 'Ds. Tluwe', 'sdntluwetuban@gmail.com', '085706804268', 7, 128, -7.0643000, 111.9061000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(831, '20505203', 'UPT SD NEGERI TOBO', 24, 'SD', 'Negeri', 'B', 'Desa Tobo', 'sdntobo2020@gmail.com', '081331705614', 7, 89, -6.8381900, 111.9340000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(832, '20505202', 'UPT SD NEGERI WALERAN 3', 42, 'SD', 'Negeri', 'C', 'Desa Waleran', 'sdnwaleran03@gmail.com', '085730885254', 6, 81, -6.9943000, 111.9525000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(833, '20505201', 'UPT SD NEGERI TAHULU 2', 24, 'SD', 'Negeri', 'B', 'Desa Tahulu', 'sdntahulu2merakurak@gmail.com', '081335332706', 6, 53, -6.8953483, 111.9920183, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(834, '20505200', 'UPT SD NEGERI SIDOTENTREM 2', 35, 'SD', 'Negeri', 'B', 'Jl Ngrojo - Sidotentrem', 'sdnsidotentrem002@gmail.com', '0', 8, 170, -6.9711000, 111.6861000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(835, '20505199', 'UPT SD NEGERI SUCIHARJO 1', 32, 'SD', 'Negeri', 'B', 'Jl Raya Ponco Soko', 'sdnsuciharjo1@yahoo.co.id', '-', 7, 129, -7.1054000, 111.8611000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(836, '20505197', 'UPT SD NEGERI SUGIHAN 1', 36, 'SD', 'Negeri', 'B', 'Jl. Raya Timur No. 260 Sugihan', 'sdn.sugihan340@gmail.com', '0356551324', 16, 261, -6.8890000, 111.6644000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(837, '20505196', 'UPT SD NEGERI SUGIHAN 1', 24, 'SD', 'Negeri', 'B', 'Jl.Raya Sugihan No.12 Merakurak', 'sdnsugihan001@gmail.com', '081259847661', 5, 62, -6.8411500, 111.9531300, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(838, '20505194', 'UPT SD NEGERI SUGIHAN 2', 24, 'SD', 'Negeri', 'B', 'Jl Raya Masjid Darussalam Sugihan ', 'sdnsugihan2@gmail.com', '03567004028', 6, 83, -6.8394633, 111.9515117, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(839, '20505192', 'UPT SD NEGERI SUGIHARJO 1', 22, 'SD', 'Negeri', 'B', 'Jln. Al Falah Blok B Nomor 4A', 'sdnsugiharjo1@gmail.com', '-', 7, 154, -6.8962000, 112.0197000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(840, '20505191', 'UPT SD NEGERI SUGIHARJO 2', 22, 'SD', 'Negeri', 'B', 'Sugiharjo', 'sdnsugiharjo2@gmail.com', '-', 7, 89, -6.8963833, 112.0195933, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(841, '20505188', 'UPT SD NEGERI SUGIHWARAS 1', 23, 'SD', 'Negeri', 'A', 'Desa Sugihwaras', 'sdnsugihwaras1kecjenu@gmail.com', '-', 6, 97, -6.8578000, 112.0197000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(842, '20505187', 'UPT SD NEGERI SUGIHWARAS 2', 23, 'SD', 'Negeri', 'B', 'JL. Raya Tuban Semarang Km-4', 'jeusugihwaras2@gmail.com', '-', 7, 89, -6.8734000, 112.0360000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(843, '20505182', 'UPT SD NEGERI SIDOTENTREM 1', 35, 'SD', 'Negeri', 'B', 'JALAN DESA SIDOTENTREM', 'sdnsidotentrem1@gmail.com', '085233926288', 8, 102, -6.9674000, 111.6699000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(844, '20505181', 'UPT SD NEGERI SIMO', 31, 'SD', 'Negeri', 'B', 'Simo', 'sdnsimosoko@yahoo.co.id', '085259600821', 8, 95, -7.1303000, 111.9315000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(845, '20505176', 'UPT SD NEGERI SOCOREJO', 23, 'SD', 'Negeri', 'B', 'Jln.raya Desa Socorejo', 'sdnsocorejo@yahoo.id', '0356491017', 9, 209, -6.7918183, 111.8938933, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(846, '20505169', 'UPT SD NEGERI SUKOHARJO', 41, 'SD', 'Negeri', 'B', 'Desa Sukoharjo', 'sdnsukoharjo432@gmail.com', '082234591149', 8, 110, -6.8218000, 111.7747000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(847, '20505168', 'UPT SD NEGERI SUKOLILO', 41, 'SD', 'Negeri', 'B', 'Jln. Raya Jatirogo No. 350', 'sdnsukolilo76@gmail.com', '0356411107', 8, 210, -6.7771000, 111.7119000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(848, '20505166', 'UPT SD NEGERI SUMBERJO', 24, 'SD', 'Negeri', 'B', 'Desa Sumberjo', 'sdnsumberjo0@gmail.com', '081325206525', 4, 32, -6.8688100, 112.0073017, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(849, '20505164', 'UPT SD NEGERI SUMURCINDE 2', 31, 'SD', 'Negeri', 'B', 'Jl. Raya Sumurcinde No.81', 'sdnsumurcinde02@gmail.com', '-', 6, 103, -7.0966000, 111.9610000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(850, '20505163', 'UPT SD NEGERI SUMURGENENG 1', 23, 'SD', 'Negeri', 'B', 'Sumurgeneng', 'sdnsumurgenengsatu474@gmail.com', '085745604292', 8, 71, -6.8010650, 111.9645733, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(851, '20505162', 'UPT SD NEGERI SUMURGENENG 2', 23, 'SD', 'Negeri', 'B', 'Sumurgeneng', 'sdnsumurgenengdua@yahoo.co.id', '-', 7, 63, -6.7996717, 111.9642767, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(852, '20505161', 'UPT SD NEGERI SUMURGUNG', 38, 'SD', 'Negeri', 'B', 'JL. KH. MARJUKI NO 725', 'sdn.sumurgung310@gmail.com', '-', 7, 99, -6.9613067, 111.9068450, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(853, '20505160', 'UPT SD NEGERI SUMURGUNG 1', 22, 'SD', 'Negeri', 'B', 'Jln. Desa Sumurgung', 'sdnsumurgung143@gmail.com', '0', 6, 72, -6.8938783, 112.0117667, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(854, '20505157', 'UPT SD NEGERI SUMURJALAK 2', 29, 'SD', 'Negeri', 'B', 'Jalan Raya Plumpang-Rengel', 'sdnjalak2@gmail.com', '0356812564', 8, 162, -7.0325000, 112.0864000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(855, '20505155', 'UPT SD NEGERI SUWALAN', 23, 'SD', 'Negeri', 'B', 'Depan Balai Desa Suwalan', 'sdnsuwalan01@gmail.com', '-', 8, 121, -6.8403650, 111.9822967, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(856, '20505152', 'UPT SD NEGERI SUMBEREJO 2', 30, 'SD', 'Negeri', 'B', 'Jalan Trobongso No. 417', 'sdn_sumberejoii@ymail.com', '0356812719', 7, 130, -7.0604000, 112.0118000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(857, '20505151', 'UPT SD NEGERI SUKOLILO 1', 22, 'SD', 'Negeri', 'B', 'Jln. Panglima Sudirman No. 94', 'sdn_sukolilo01@yahoo.com', '0356323586', 2, 16, -6.8963883, 112.0742667, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(858, '20505150', 'UPT SD NEGERI SUKOLILO 2', 22, 'SD', 'Negeri', 'A', 'Jln. Panglima Sudirman No. 250', 'sdnegerisukolilodua@gmail.com', '0356328619', 4, 168, -6.8973950, 112.0748167, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(859, '20505147', 'UPT SD NEGERI SUMBER', 24, 'SD', 'Negeri', 'B', 'Desa Sumber', '-', '081359245811', 6, 94, -6.8565433, 111.9882067, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(860, '20505145', 'UPT SD NEGERI SUMBERAGUNG 2', 29, 'SD', 'Negeri', 'B', 'Jalan Raya Pakah Plumpang', 'sdn.sumberagung247@gmail.com', '085648189307', 8, 175, -7.0034000, 112.1097000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(861, '20505137', 'UPT SD NEGERI TAHULU 1', 24, 'SD', 'Negeri', 'B', 'Desa Tahulu', 'tahulu1sdn@gmail.com', '-', 8, 58, -6.9277950, 111.9762383, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(862, '20505051', 'UPT SD NEGERI WANGLUKULON 1', 34, 'SD', 'Negeri', 'B', 'Jl. K. Djoned', 'sdn.wanglukulon1@gmail.com', '082330624904', 7, 98, -7.0199000, 111.7312000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(863, '20505047', 'UPT SD NEGERI WANGUN 2', 26, 'SD', 'Negeri', 'B', 'Jln. Gua Suci No. 425', 'sdn.wangun@yahoo.co.id', '085733356578', 4, 92, -6.9322000, 112.1655000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(864, '20505046', 'UPT SD NEGERI WEDEN', 35, 'SD', 'Negeri', 'B', 'Desa Weden', 'sdnweden31@gmail.com', '085141066565', 7, 32, -6.9789000, 111.7185000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(865, '20505045', 'UPT SD NEGERI WIDANG 1', 27, 'SD', 'Negeri', 'B', 'Jln. Raya Widang No. 199', 'sdnwidang1@yahoo.co.id', '081357557325', 12, 192, -7.0936000, 112.1741000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(866, '20505003', 'UPT SD NEGERI SIDOREJO', 37, 'SD', 'Negeri', 'B', 'Desa Sidorejo', 'sdnsidorejo1982@gmail.com', '-', 8, 122, -6.9399000, 111.6807000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(867, '20504995', 'UPT SD NEGERI MULYOREJO', 33, 'SD', 'Negeri', 'B', 'Jl. R.A Kartini No.144 Desa Mulyorejo Kec. Singgahan', 'sd_mulyorejo@yahoo.com', '-', 8, 97, -6.9981000, 111.7921000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(868, '20504992', 'UPT SD NEGERI NGADIREJO 1', 30, 'SD', 'Negeri', 'B', 'Jl.Raya Gemblo No. 17', 'mukhoplek@yahoo.com', '-', 7, 53, -7.0426000, 112.0079000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(869, '20504987', 'UPT SD NEGERI NGANDONG', 42, 'SD', 'Negeri', 'B', 'Jln. Raya Ngandong Kec. Grabagan', 'sdnngandong28@gmail.com', '085730885254', 8, 169, -7.0262000, 112.0090000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(870, '20504979', 'UPT SD NEGERI MLANGI 2', 27, 'SD', 'Negeri', 'B', 'Dusun Gambuhan', 'sdn.mlangi2@gmail.com', '081333719791', 5, 33, -7.0112000, 112.1713000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(871, '20504978', 'UPT SD NEGERI MLIWANG', 39, 'SD', 'Negeri', 'B', 'Jalan Raya Kerek-Glondong', 'sdnmliwangkerek@yahoo.co.id', '-', 7, 73, -6.8394000, 111.8955000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(872, '20504974', 'UPT SD NEGERI MONDOKAN', 22, 'SD', 'Negeri', 'A', 'Jln. Letda Sucipto No.80', 'sdnmondokan.3880@gmail.com', '0356327467', 10, 229, -6.8838933, 112.0244533, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(873, '20504973', 'UPT SD NEGERI MONTONGSEKAR 1', 38, 'SD', 'Negeri', 'A', 'Montongsekar', 'sdnmontongsekar01@gmail.com', '0356611322', 16, 330, -6.9510250, 111.8805083, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(874, '20504971', 'UPT SD NEGERI MONTONGSEKAR 3', 38, 'SD', 'Negeri', 'B', 'Dsn Kerok', 'sdnmontong03@gmail.com', '-', 8, 65, -6.9446633, 111.8872250, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(875, '20504969', 'UPT SD NEGERI NGARUM', 42, 'SD', 'Negeri', 'B', 'Jl. Raya Ngarum-Grabagan', 'sdn.ngarum217@gmail.com', '081327101854', 8, 109, -7.0387000, 111.9368000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(876, '20504967', 'UPT SD NEGERI NGULAHAN', 40, 'SD', 'Negeri', 'B', 'Ngulahan', 'ngulahansdn@gmail.com', '-', 8, 78, -6.8741000, 111.7822000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(877, '20504966', 'UPT SD NEGERI NGULUHAN', 38, 'SD', 'Negeri', 'B', 'Desa Nguluhan', 'nguluhansdn@gmail.com', '082337006564', 7, 132, -6.9783683, 111.8375483, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(878, '20504964', 'UPT SD NEGERI NGURUAN 2', 31, 'SD', 'Negeri', 'B', 'Jl Sendang Bulung', 'sdnnguruhan2bulung@gmail.com', '-', 3, 70, -7.0623000, 111.9447000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(879, '20504961', 'UPT SD NEGERI PADASAN', 39, 'SD', 'Negeri', 'B', 'Jl. Pemuda 01', 'sdnpadasan464@gmail.com', '-', 7, 42, -6.9017000, 111.9042000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(880, '20504960', 'UPT SD NEGERI PAKEL', 38, 'SD', 'Negeri', 'B', 'Pakel', 'dessysanja@gmail.com', '-', 8, 142, -6.9552800, 111.8941483, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(881, '20504959', 'UPT SD NEGERI PAKIS', 42, 'SD', 'Negeri', 'B', 'Jln. Nglai', 'sdnpakis79.grabagan@gmail.com', '-', 8, 123, -7.0288000, 112.0390000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(882, '20504958', 'UPT SD NEGERI PALANG', 26, 'SD', 'Negeri', 'B', 'Jln. Raya Gresik Desa Palang No. 100', 'sdnpalang1@gmail.com', '0356332733', 7, 149, -6.9027000, 112.1408000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(883, '20504947', 'UPT SD NEGERI NGIMBANG', 26, 'SD', 'Negeri', 'B', 'Jln. Raya Desa Ngimbang', 'SDNgimbangpalang@gmail.com', '089508785249', 6, 12, -6.9578000, 112.1397000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(884, '20504946', 'UPT SD NEGERI NGINO 1', 25, 'SD', 'Negeri', 'B', 'Jln. Dermawuharjo', 'sdnegeringinoi@gmail.com', '085733580240', 6, 108, -6.9935000, 112.0654000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(885, '20504945', 'UPT SD NEGERI NGINO 2', 25, 'SD', 'Negeri', 'B', 'Jln. Dermawuharjo', 'sdnnginoii@gmail.com', '082234673677', 7, 66, -6.9949000, 112.0648000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(886, '20504944', 'UPT SD NEGERI BENDONGLATENG 1', 37, 'SD', 'Negeri', 'B', 'Dsn Nglateng Rt 03 Rw 01', 'sdnegeri.nglateng1@gmail.com', '03567007542', 7, 134, -6.9564000, 111.6458000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(887, '20504942', 'UPT SD NEGERI NGRAYUNG', 29, 'SD', 'Negeri', 'B', 'Jalan Raya Ngrayung Plumpang', 'sdnngrayung@gmail.com', '-', 8, 143, -7.0171000, 112.1032000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(888, '20504941', 'UPT SD NEGERI NGREJENG 1', 42, 'SD', 'Negeri', 'C', 'Jln. Ngrejeng Geneng No. 12', 'sdnngrejeng1@gmail.com', '085730444094', 8, 116, -7.0285000, 111.9446000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(889, '20504940', 'UPT SD NEGERI NGREJENG 2', 42, 'SD', 'Negeri', 'B', 'Jln. Raya Galeh No.45', 'sdn.ngrejengdua@gmail.com', '081332478583', 8, 111, -7.0454000, 111.9489000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(890, '20504939', 'UPT SD NEGERI NGROJO', 35, 'SD', 'Negeri', 'B', 'Jl Raya Bangilan 195 Ds.Ngrojo kecamatan Bangilan', 'Sdnngrojocity195@gmail.com', '03564214188', 7, 199, -6.9808000, 111.7162000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(891, '20504938', 'UPT SD NEGERI NGUJURAN 1', 41, 'SD', 'Negeri', 'B', 'Desa Ngujuran', 'sdnngujuran1@yahoo.com', '085233565552', 8, 183, -6.8193000, 111.6865000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(892, '20504937', 'UPT SD NEGERI PANYURAN 2', 26, 'SD', 'Negeri', 'B', 'Jln. Manunggal Utara No. 02', 'sdnpanyuran2ii@gmail.com', '0', 8, 83, -6.8978000, 112.0804000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(893, '20504935', 'UPT SD NEGERI KLAKEH', 35, 'SD', 'Negeri', 'B', 'Jalan Desa Klakeh-Dusun Suruhan', 'sdn_klakeh371@yahoo.com', '085230156611', 8, 104, -6.9778000, 111.6823000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(894, '20504934', 'UPT SD NEGERI KUTOREJO 1', 22, 'SD', 'Negeri', 'A', 'Jln. Veteran No. 12', 'sdnjotu12@gmail.com', '0356322752', 9, 339, -6.8979533, 112.0650617, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(895, '20504932', 'UPT SD NEGERI KUTOREJO 3', 22, 'SD', 'Negeri', 'B', 'Jl. KH. MUSTAIN No. 20', 'sdnkutorejo03tuban@gmail.com', '0356320683', 6, 154, -6.8971017, 112.0637383, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(896, '20504930', 'UPT SD NEGERI LAJO KIDUL 1', 33, 'SD', 'Negeri', 'B', 'Laju Kidul', 'sdn_lajukidul1@yahoo.com', '-', 6, 122, -6.9707000, 111.7497000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(897, '20504929', 'UPT SD NEGERI LAJO KIDUL 2', 33, 'SD', 'Negeri', 'B', 'Dsn. Kepanjen Ds. Laju Kidul Kec. Singgahan - Tuban', 'sdnlajukidul02@gmail.com', '081216614442', 7, 51, -6.9666000, 111.7406000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(898, '20504924', 'UPT SD NEGERI LATSARI 2', 41, 'SD', 'Negeri', 'B', 'Desa Latsari', 'sdnlatsari2bancar@gmail.com', '-', 6, 92, -6.7758000, 111.6923000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(899, '20504923', 'UPT SD NEGERI LATSARI', 22, 'SD', 'Negeri', 'A', 'Jln. P. Diponegoro No. 76', 'sdn.latsari.tuban@gmail.com', '0356323877', 25, 661, -6.8931400, 112.0481050, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(900, '20504922', 'UPT SD NEGERI LATSARI 3', 41, 'SD', 'Negeri', 'C', 'Desa Latsari', 'latsarisdn03@gmail.com', '082140257867', 8, 41, -6.8015000, 111.6789000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(901, '20504920', 'UPT SD NEGERI KUMPULREJO 3', 35, 'SD', 'Negeri', 'C', 'Dsn Kuwasen', 'sdnkumpulrejo3@gmail.com', '085232167576', 7, 13, -6.9335000, 111.7411000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(902, '20504919', 'UPT SD NEGERI KUMPULREJO 2', 35, 'SD', 'Negeri', 'B', 'Dk Tuwiwian Kumpulrejo', 'sdnkumpulrejo.dua@gmail.com', '081943381273', 7, 121, -6.9278000, 111.7643000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(903, '20504918', 'UPT SD NEGERI KLOTOK 1', 29, 'SD', 'Negeri', 'B', 'Desa Klotok', 'sdnklotok01@gmail.com', '-', 6, 140, -7.0837000, 112.1181000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(904, '20504917', 'UPT SD NEGERI KLOTOK 2', 29, 'SD', 'Negeri', 'B', 'Jl. Gajah Mada Gg Agrek', 'sdn.klotok2@gmail.com', '085732050283', 4, 99, -7.0822000, 112.1276000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(905, '20504916', 'UPT SD NEGERI KLUMPIT 1', 31, 'SD', 'Negeri', 'B', 'Jalan Sendang Kebon No. 196 Klumpit', 'sdnklumpit01@gmail.com', '-', 7, 143, -7.0555000, 111.9198000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(906, '20504914', 'UPT SD NEGERI KLUMPIT 3', 31, 'SD', 'Negeri', 'B', 'Jl Dusun Bentaor', 'sdnklumpiiit1991@gmail.com', '-', 7, 163, -7.0432000, 111.9265000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(907, '20504912', 'UPT SD NEGERI KLUTUK 2', 40, 'SD', 'Negeri', 'B', 'Desa Klutuk', 'sdnklutuk02tambakboyo@gmail.com', '089530475918', 6, 78, -6.8163000, 111.8392000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(908, '20504911', 'UPT SD NEGERI KOWANG 1', 25, 'SD', 'Negeri', 'B', 'Jln. Sumur Selatan No. 11', 'sdnkowang01@gmail.com', '085708882457', 8, 113, -6.9452000, 112.0854000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(909, '20504910', 'UPT SD NEGERI KOWANG 2', 25, 'SD', 'Negeri', 'B', 'Jl. Jati Teken Desa Kowang', 'sdnkowangii@gmail.com', '-', 8, 97, -6.9365000, 112.0772000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(910, '20504907', 'UPT SD NEGERI KUMPULREJO 1', 35, 'SD', 'Negeri', 'B', 'Jl. Jatiroto Dusun Tawun ', 'sdn.kumpulrejo1@gmail.com', '081249196188', 7, 145, -6.9149000, 111.7390000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(911, '20504906', 'UPT SD NEGERI KUMPULREJO 1', 32, 'SD', 'Negeri', 'C', 'Jl Brangkal Sembung', 'sdnkumpulrejo1_parengan@gmail.com', '085183107229', 7, 77, -6.9149000, 111.7390000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(912, '20504905', 'UPT SD NEGERI KUMPULREJO 2', 32, 'SD', 'Negeri', 'B', 'Jalan Raya Brangkal - Senori', 'sdnkumpulrejo2_parengan@yahoo.co.id', '081330594838', 8, 134, -7.0733000, 111.8380000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(913, '20504904', 'UPT SD NEGERI LATSARI 4', 41, 'SD', 'Negeri', 'C', 'Desa Latsari', 'sdnlatsari4@gmail.com', '-', 7, 80, -6.8052000, 111.6950000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(914, '20504897', 'UPT SD NEGERI MARGOSUKO', 41, 'SD', 'Negeri', 'B', 'Desa Margosuko', 'margosuko444@yahoo.com', '-', 7, 100, -6.8004000, 111.8017000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(915, '20504895', 'UPT SD NEGERI MEDALEM 2', 34, 'SD', 'Negeri', 'B', 'Jl. Raya Senori-Bangilan', 'sdnmedalem002@gmail.com', '082302484669', 8, 66, -7.0020000, 111.7517000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(916, '20504894', 'UPT SD NEGERI MENILO', 31, 'SD', 'Negeri', 'B', 'Jl Sunan Kalijaga No 1', 'sdnmenilo@gmail.com', '085811915408', 7, 76, -7.1355000, 111.9074000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(917, '20504893', 'UPT SD NEGERI MENTORO', 31, 'SD', 'Negeri', 'B', 'Jl. Pringgodani No. 65', 'sdnmentoro@gmail.com', '-', 6, 103, -7.1090000, 111.9325000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(918, '20504891', 'UPT SD NEGERI MENTOSO', 23, 'SD', 'Negeri', 'B', 'Mentoso', 'sdnmentoso@gmail.com', '081334208434', 8, 115, -6.7913650, 111.9839367, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(919, '20504886', 'UPT SD NEGERI MARGOMULYO', 39, 'SD', 'Negeri', 'A', 'Jln. Kawi No. 185 Margomulyo - Kerek', 'margomulyosdn@gmail.com', '085235284530', 13, 335, -6.8921000, 111.8846000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(920, '20504885', 'UPT SD NEGERI MANJUNG', 38, 'SD', 'Negeri', 'B', 'Manjung', 'sdnmanjung307@gmail.com', '-', 8, 250, -7.0180000, 111.8410000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(921, '20504884', 'UPT SD NEGERI LERAN KULON 1', 26, 'SD', 'Negeri', 'B', 'Ds. Leran Kulon', 'sdn.lerankulon01@gmail.com', '-', 6, 85, -6.9207000, 112.1498000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(922, '20504883', 'UPT SD NEGERI LERAN KULON 2', 26, 'SD', 'Negeri', 'B', 'Ds. Leran Kulon', 'sdlerankulon02@gmail.com', '085604497249', 8, 64, -6.9097000, 112.1537000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(923, '20504876', 'UPT SD NEGERI MAINDU 1', 38, 'SD', 'Negeri', 'B', 'DUSUN SUMBERJO', 'sdnmaindu1@gmail.com', '0', 7, 62, -7.0110867, 111.9317000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(924, '20504875', 'UPT SD NEGERI MAINDU 2', 38, 'SD', 'Negeri', 'B', 'DSN. WATUKUWO', 'sdnmaindu2@gmail.com', '087861604025', 7, 46, -7.0038067, 111.9426133, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(925, '20504874', 'UPT SD NEGERI MANDER 1', 40, 'SD', 'Negeri', 'B', 'Jl. Pule Desa Mander Kec. Tambakboyo Kab. Tuban Kode pos : 62353', 'sdnmander1@gmail.com', '0', 7, 127, -6.8604000, 111.8056000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(926, '20504873', 'UPT SD NEGERI MANDER 2', 40, 'SD', 'Negeri', 'B', 'Desa Mander', 'sdnmander002@gmail.com', '-', 6, 72, -6.8582000, 111.8033000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(927, '20504871', 'UPT SD NEGERI MANDIREJO', 24, 'SD', 'Negeri', 'B', 'Jln. Raya Merakurak - Tuban', 'sdnmandirejo6@gmail.com', '0356711834', 5, 106, -6.8790883, 111.9898017, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(928, '20504869', 'UPT SD NEGERI PARANGBATU 1', 32, 'SD', 'Negeri', 'B', 'Jl. Cokrokusumo No. 60', 'sdnparangbatu@gmail.com', '085232544222', 9, 151, -7.0682000, 111.8427000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(929, '20504864', 'UPT SD NEGERI SEKARDADI', 23, 'SD', 'Negeri', 'B', 'Desa Sekardadi', 'sdnsekardadi1@gmail.com', '081553314233', 8, 111, -6.8409867, 112.0021633, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(930, '20504856', 'UPT SD NEGERI SEMBUNGIN 1', 41, 'SD', 'Negeri', 'B', 'Desa Sembungin', 'sdnsembungin1@gmail.co.id', '085784478478', 7, 62, -6.8022000, 111.7513000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(931, '20504854', 'UPT SD NEGERI SEMBUNGREJO', 24, 'SD', 'Negeri', 'B', 'Ds. Sembungrejo', 'smulyani757@yahoo.com', '082234279539', 8, 61, -6.8693000, 111.9501000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(932, '20504853', 'UPT SD NEGERI SAWAHAN', 30, 'SD', 'Negeri', 'B', 'Jl. Dewi Sartika No. 44', 'sdnsawahan@rocketmail.com', '082232849174', 5, 43, -7.0678000, 112.0049000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(933, '20504851', 'UPT SD NEGERI RONGGOMULYO 1', 22, 'SD', 'Negeri', 'A', 'Jln. Basuki Rahmad No. 192', 'sdnronggomulyosatu@gmail.com', '0356332616', 21, 478, -6.8968500, 112.0547033, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(934, '20504848', 'UPT SD NEGERI RONGGOMULYO 4', 22, 'SD', 'Negeri', 'B', 'Jln. Basuki Rahmat Gg. Wijaya Kusuma III / 93', 'ronggomulyo4@gmail.com', '0356333379', 7, 83, -6.8946367, 112.0539600, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(935, '20504847', 'UPT SD NEGERI SADANG 1', 36, 'SD', 'Negeri', 'B', 'Jln. Panglima Sudirman  No. 602', 'sdnegeri.sadangsatu@gmail.com', '0356551216', 7, 142, -6.8811000, 111.6600000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(936, '20504845', 'UPT SD NEGERI SAMBONGGEDE 1', 24, 'SD', 'Negeri', 'B', 'Jln. Pemuda No. 02', 'sdnsambonggede01@gmail.com', '0356711603', 13, 343, -6.8799400, 111.9853017, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(937, '20504844', 'UPT SD NEGERI SAMBONGGEDE 2', 24, 'SD', 'Negeri', 'B', 'Jln. Raya Merakurak - Jenu', 'sdnsambonggede2@gmail.com', '03567131522', 8, 117, -6.8750817, 111.9862000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(938, '20504843', 'UPT SD NEGERI SAMBONGREJO 1', 25, 'SD', 'Negeri', 'B', 'Jln. Kedung Ireng No. 03', 'sambongrejosdn1@gmail.com', '-', 7, 130, -6.9752000, 112.0609000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(939, '20504841', 'UPT SD NEGERI SANDINGROWO 1', 31, 'SD', 'Negeri', 'B', 'Jl.sundulan No.45', 'sandingrowo1@yahoo.com', '-', 8, 88, -7.1185000, 111.9694000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(940, '20504839', 'UPT SD NEGERI SARINGEMBAT 1', 33, 'SD', 'Negeri', 'B', 'Jl. RA. Kartini No. 80', 'sdnsaringembati@gmail.com', '081259855355', 8, 68, -7.0223000, 111.7864000, 'belum', NULL, '2026-09-10 05:44:13', NULL);
INSERT INTO `satuan_pendidikan` (`id`, `npsn`, `nama`, `kecamatan_id`, `jenjang`, `status_sekolah`, `akreditasi`, `alamat`, `email`, `telepon`, `total_guru`, `total_siswa`, `latitude`, `longitude`, `status_pengisian`, `last_updated`, `created_at`, `deleted_at`) VALUES
(941, '20504836', 'UPT SD NEGERI SENDANG 1', 34, 'SD', 'Negeri', 'A', 'Jl. Letnan Sucipto No. 778', 'sdn.sendang1@gmail.com', '082231507616', 6, 122, -7.0145000, 111.7263000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(942, '20504835', 'UPT SD NEGERI SIDOKUMPUL 2', 35, 'SD', 'Negeri', 'B', 'Jl Satria No 152 Rt 01 / Rw 02', 'sidokumpulsdn@gmail.com', '03564214418', 7, 34, -6.9722000, 111.7087000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(943, '20504834', 'UPT SD NEGERI SIDOMUKTI 1', 37, 'SD', 'Negeri', 'B', 'Dusun Jetis', 'sdnsidomukti9@gmail.com', '-', 6, 144, -6.9172000, 111.6239000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(944, '20504830', 'UPT SD NEGERI SIDOMULYO', 36, 'SD', 'Negeri', 'B', 'Ds. Sidomulyo', 'sdnsidomulyo152@gmail.com', '-', 8, 91, -6.9046000, 111.6758000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(945, '20504828', 'UPT SD NEGERI SIDOMULYO 1', 22, 'SD', 'Negeri', 'B', 'Jln. Untung Suropati No. 23 Tuban', 'sdn.sidomulyo1@gmail.com', '0356332559', 5, 90, -6.8932700, 112.0588833, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(946, '20504827', 'UPT SD NEGERI SIDOMULYO 2', 22, 'SD', 'Negeri', 'B', 'Jln. Pemuda Gg. XI No. 272', 'sdn.sidomulyo02.1974@gmail.com', '0356332201', 5, 56, -6.8961081, 112.0606784, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(947, '20504824', 'UPT SD NEGERI SIDOREJO 1', 22, 'SD', 'Negeri', 'B', 'Jl. Majapahit Gg. II No. 568', 'sdnsidorejo1kec.tuban@gmail.com', '8833413', 7, 142, -6.9041000, 112.0568000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(948, '20504823', 'UPT SD NEGERI SIDOREJO 2', 22, 'SD', 'Negeri', 'B', 'Jln. Dr. Wahidin Sudiro Husodo Gg. Bima No. 01', 'sdnsidorejotuban02@gmai.com', '0356325551', 5, 78, -6.9019000, 112.0498000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(949, '20504822', 'UPT SD NEGERI SIDOREJO 3', 22, 'SD', 'Negeri', 'B', 'Jln. Gajah Mada No. 65', 'sidorejo03.sch@gmail.com', '0356331949', 5, 105, -6.9027000, 112.0563000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(950, '20504821', 'UPT SD NEGERI SIDOKUMPUL 1', 35, 'SD', 'Negeri', 'B', 'Jl Cabe No 19 Sidokumpul', 'sdnsidokumpulone@gmail.com', '081332647440', 6, 48, -6.9789000, 111.7095000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(951, '20504820', 'UPT SD NEGERI SIDOHASRI 2', 37, 'SD', 'Negeri', 'B', 'Ds Sidohasri', 'sdn.sidohasri.ii@gmail.com', '0', 8, 85, -6.9017000, 111.6501000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(952, '20504819', 'UPT SD NEGERI SENDANG 2', 34, 'SD', 'Negeri', 'B', 'Jl. Karang Anyar No. 15', 'llsdnsendang@gmail.com', '081357382629', 7, 66, -7.0040000, 111.7273000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(953, '20504818', 'UPT SD NEGERI SENDANGHAJI', 24, 'SD', 'Negeri', 'B', 'Desa Sendanghaji', 'sdnsendanghaji121@gmail.com', '085731899345', 6, 157, -6.8745650, 112.0000117, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(954, '20504816', 'UPT SD NEGERI SENDANGHARJO 3', 22, 'SD', 'Negeri', 'B', 'Basuki Rachmat No.681 Tuban', 'sendangharjo3@yahoo.com', '0356328799', 6, 48, -6.9004733, 112.0676467, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(955, '20504815', 'UPT SD NEGERI SENDANGHARJO 4', 22, 'SD', 'Negeri', 'B', 'Jln. Wr. Supratman No.26', 'sdnsendangharjoIVTuban@gmail.com', '0356328625', 9, 197, -6.8974850, 112.0689833, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(956, '20504814', 'UPT SD NEGERI SENDANGREJO', 32, 'SD', 'Negeri', 'B', 'Jl Raya Sendangrejo', 'ridho_anton@yahoo.co.id', '085792663037', 7, 66, -7.1291000, 111.8764000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(957, '20504813', 'UPT SD NEGERI SENORI', 24, 'SD', 'Negeri', 'B', 'JL. Raya Merakurak - Kerek No.377', 'sdnsenori01@gmail.com', '0356711792', 7, 119, -6.8724767, 111.9626417, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(958, '20504812', 'UPT SD NEGERI SIDING', 41, 'SD', 'Negeri', 'B', 'Desa Siding', 'sdnsiding@ygmail.com', '081331576419', 6, 116, -6.7955000, 111.7271000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(959, '20504811', 'UPT SD NEGERI SIDODADI 1', 35, 'SD', 'Negeri', 'B', 'Jln. Raya Sidodadi No 226 Rt 02 Rw 04', 'm.roniandiyaniwijaya@gmail.com', '085230004150', 7, 55, -6.9484000, 111.7030000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(960, '20504810', 'UPT SD NEGERI SIDODADI 2', 35, 'SD', 'Negeri', 'B', 'Jl. Masjid Mundri - Dsn Mundri', 'sidodadi02sdn@gmail.com', '-', 8, 30, -6.9547000, 111.7091000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(961, '20504808', 'UPT SD NEGERI SIDOHARJO 2', 34, 'SD', 'Negeri', 'B', 'Jl. Raya Sidoharjo No.228 Dusun Banaran', 'sdnsidoharjoduasenori@gmail.com', '081359118117', 7, 128, -7.0390000, 111.7397000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(962, '20504806', 'UPT SD NEGERI SIDOHASRI 1', 37, 'SD', 'Negeri', 'B', 'Jl.gendori No. 02', 'sdnsidohasrisatoe@gmail.com', '0356552388', 7, 85, -6.9093000, 111.6566000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(963, '20504803', 'UPT SD NEGERI PARANGBATU 2', 32, 'SD', 'Negeri', 'B', 'Jl.cokrokusumo 902', 'sdnparangbatu2@gmail.com', '-', 7, 67, -7.0657000, 111.8378000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(964, '20504800', 'UPT SD NEGERI PLUMPANG 1', 29, 'SD', 'Negeri', 'A', 'Jln. Raya No. 68 Plumpang', 'sdn.plumpang01@gmail.com', '0356812276', 14, 361, -7.0294000, 112.0960000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(965, '20504797', 'UPT SD NEGERI PLUMPANG 4', 29, 'SD', 'Negeri', 'B', 'Dusun Kunir', 'sdnplumpang4@gmail.com', '081295938833', 7, 67, -7.0243000, 112.0644000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(966, '20504795', 'UPT SD NEGERI PONGPONGAN 1', 24, 'SD', 'Negeri', 'B', 'Dusun Koro', 'akamufied23@gmail.com', '03567008482', 6, 64, -6.9019000, 111.9411000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(967, '20504794', 'UPT SD NEGERI PONGPONGAN 2', 24, 'SD', 'Negeri', 'B', 'Desa Pongpongan', 'sdnpongpongan02@yahoo.co.id', '0356711041', 7, 30, -6.8702550, 111.9461550, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(968, '20504786', 'UPT SD NEGERI PLAJAN', 40, 'SD', 'Negeri', 'B', 'Plajan', 'sdnplajan@yahoo.co.id', '085746535547', 7, 65, -6.8540000, 111.7865000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(969, '20504785', 'UPT SD NEGERI PARANGBATU 3', 32, 'SD', 'Negeri', 'B', 'Dusun Seluman', 'sdnparangbatu3@gmail.com', '-', 8, 78, -7.0608000, 111.8506000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(970, '20504784', 'UPT SD NEGERI PASEYAN 1', 36, 'SD', 'Negeri', 'B', 'Desa Paseyan', 'sdnpaseyan1@yahoo.com', '0356552791', 7, 108, -6.8762000, 111.6441000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(971, '20504780', 'UPT SD NEGERI PENAMBANGAN 1', 25, 'SD', 'Negeri', 'B', 'Jln. Penambangan', 'penambangansdn@gmail.com', '-', 8, 139, -6.9507000, 112.0620000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(972, '20504779', 'UPT SD NEGERI PENAMBANGAN 2', 25, 'SD', 'Negeri', 'B', 'Desa Penambangan', 'sdn.penambangan02@gmail.com', '0', 8, 70, -6.9423000, 112.0605000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(973, '20504778', 'UPT SD NEGERI PENAMBANGAN 3', 25, 'SD', 'Negeri', 'B', 'Jl. Raya Penambangan No. 535', 'sdn.penambangan03@gmail.com', '0', 7, 91, -6.9594000, 112.0619000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(974, '20504776', 'UPT SD NEGERI PENIDON 1', 29, 'SD', 'Negeri', 'B', 'Jalan Plumpang Compreng', 'sdn.penidon01@gmail.com', '-', 7, 135, -7.0292000, 112.1340000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(975, '20504775', 'UPT SD NEGERI PENIDON 2', 29, 'SD', 'Negeri', 'B', 'Ds. Kuwu, Penidon', 'sdnpenidondua@yahoo.com', '085812022805', 7, 87, -7.0524000, 112.1511000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(976, '20504772', 'UPT SD NEGERI PERBON 1', 22, 'SD', 'Negeri', 'A', 'Jln. Delima No. 36', 'sdn.perbon01@gmail.com', '0356327742', 8, 164, -6.8858200, 112.0382050, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(977, '20504771', 'UPT SD NEGERI PERBON 2', 22, 'SD', 'Negeri', 'B', 'Jln. Manggis No. 01', 'sdnperbon2tuban@gmail.com', '0356323674', 7, 159, -6.8861450, 112.0414700, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(978, '20504770', 'UPT SD NEGERI PRUNGGAHAN KULON 1', 25, 'SD', 'Negeri', 'A', 'Jln. Majapahit No. 30', 'sdn_prunggahan_satu@yahoo.co.id', '0356333595', 12, 272, -6.9224000, 112.0532000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(979, '20504768', 'UPT SD NEGERI PURWOREJO', 23, 'SD', 'Negeri', 'A', 'Desa Purworejo', 'sdnpurworejojenu@gmail.com', '-', 8, 162, -6.7869167, 111.9234067, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(980, '20504765', 'UPT SD NEGERI RAWASAN', 23, 'SD', 'Negeri', 'B', 'Rawasan', 'sdnrawasan@yahoo.co.id', '081359063731', 8, 78, -6.7950167, 111.9773783, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(981, '20504763', 'UPT SD NEGERI RAYUNG 2', 34, 'SD', 'Negeri', 'B', 'Rayung', 'sdn2rayungsenori@gmail.com', '08223443061', 5, 152, -7.0527000, 111.7646000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(982, '20504760', 'UPT SD NEGERI REMEN 1', 23, 'SD', 'Negeri', 'B', 'Remen', 'sdnremen01@gmail.com', '081335013703', 8, 159, -6.7746167, 111.9611617, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(983, '20504759', 'UPT SD NEGERI REMEN 2', 23, 'SD', 'Negeri', 'B', 'Remen', 'sdnremen02@yahoo.co.id', '-', 7, 121, -6.7749000, 111.9621000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(984, '20504757', 'UPT SD NEGERI RENGEL 2', 30, 'SD', 'Negeri', 'B', 'Jalan Sawahan No.27', 'rengelsdn02@gmail.com', '-', 6, 174, -7.0637000, 112.0042000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(985, '20504755', 'UPT SD NEGERI RENGEL 4', 30, 'SD', 'Negeri', 'B', 'Jl. Gembong', 'sdnrengeliv@gmail.com', '085230900532', 10, 149, -7.0256000, 112.0042000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(986, '20504752', 'UPT SD NEGERI PRUNGGAHAN KULON 2', 25, 'SD', 'Negeri', 'B', 'Desa Prunggahan Kulon', 'prunggahan02@yahoo.co.id', '0356326960', 7, 95, -6.9294000, 112.0482000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(987, '20504751', 'UPT SD NEGERI PRUNGGAHAN KULON 3', 25, 'SD', 'Negeri', 'B', 'Desa Prunggahan Kulon', 'sdnprunggahan03@gmail.com', '081216243495', 10, 150, -6.9593000, 112.0191000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(988, '20504750', 'UPT SD NEGERI PRUNGGAHAN KULON 4', 25, 'SD', 'Negeri', 'B', 'Jln. Jarum Prunggahan Kulon', 'sdnprunggahan4@gmail.com', '-', 9, 156, -6.9335000, 112.0187000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(989, '20504749', 'UPT SD NEGERI PRUNGGAHAN KULON 5', 25, 'SD', 'Negeri', 'B', 'Desa Prunggahan Kulon', 'sdnprunggahanv@gmail.com', '-', 6, 168, -6.9493000, 112.0232000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(990, '20504748', 'UPT SD NEGERI PRUNGGAHAN KULON 6', 25, 'SD', 'Negeri', 'B', 'Desa Prunggahan Kulon', 'sdnprunggahan06tlogo@gmail.com', '-', 6, 83, -6.9283000, 112.0399000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(991, '20504747', 'UPT SD NEGERI PRUNGGAHAN KULON 7', 25, 'SD', 'Negeri', 'B', 'Desa Prunggahan Kulon', 'sdnprunggahan7@gmail.com', '081230032925', 8, 132, -6.9345000, 112.0197000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(992, '20504746', 'UPT SD NEGERI PRUNGGAHAN KULON 9', 25, 'SD', 'Negeri', 'C', 'Jln. Gunung Mertelu', 'prunggahan09sdn@gmail.com', '-', 5, 32, -6.9227000, 112.0229000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(993, '20504744', 'UPT SD NEGERI PUCANGAN 1', 38, 'SD', 'Negeri', 'B', 'Ds. Pucangan', 'sdnpucangan1@gmail.com', '0', 6, 100, -6.9444200, 111.8985550, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(994, '20504743', 'UPT SD NEGERI PULOGEDE 2', 40, 'SD', 'Negeri', 'C', 'Desa Pulogede', 'Pulo2sdn@gmail.com', '-', 8, 52, -6.8107000, 111.8308000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(995, '20504742', 'UPT SD NEGERI PULOGEDE 1', 40, 'SD', 'Negeri', 'B', 'Desa Pulogede', 'sdnpulogede1@gmail.com', '082230617942', 7, 76, -6.8058000, 111.8211000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(996, '20504741', 'UPT SD NEGERI PUGOH', 41, 'SD', 'Negeri', 'B', 'Desa Pugoh', 'sdnpugoh431@gmail.com', '081331576419', 5, 80, -6.8099000, 111.7693000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(997, '20504739', 'UPT SD NEGERI PUCANGAN 2', 38, 'SD', 'Negeri', 'C', 'Dk Grogolan', 'sdnpucangan02@gmail.com', '081336950567', 8, 26, -6.9342317, 111.9114417, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(998, '20504738', 'UPT SD NEGERI PUCANGAN 1', 26, 'SD', 'Negeri', 'B', 'Jalan Argopuro', 'sdnpucangan106@gmail.com', '-', 8, 78, -6.9206000, 112.1420000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(999, '20505628', 'UPT SD NEGERI KESAMBEN 2', 29, 'SD', 'Negeri', 'B', 'Jln Pesuruhan - Kesamben', 'sambenplp02@gmail.com', '085732254978', 8, 55, -7.0313000, 112.0710000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1000, '20505626', 'UPT SD NEGERI KETODAN', 36, 'SD', 'Negeri', 'B', 'Jln. Desa Ketodan', 'ketodan_sdn@yahoo.com', '081235006493', 7, 116, -6.8516000, 111.6427000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1001, '20504807', 'UPT SD NEGERI SIDOHARJO 3', 34, 'SD', 'Negeri', 'B', 'Jl. Sidoharjo', 'sdnsidoharjo3@gmail.com', '081059071262', 6, 92, -7.0256000, 111.7434000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1002, '20504792', 'UPT SD NEGERI PRAMBONTERGAYANG 2', 31, 'SD', 'Negeri', 'B', 'Jl Utara Kramat', 'prambontergayangsdn2@gmail.com', '0', 7, 110, -7.0929000, 111.9194000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1003, '20504989', 'UPT SD NEGERI NGADIREJO 2', 30, 'SD', 'Negeri', 'B', 'Ds. Ngadirejo', 'sdn.ngadirejo.02@gmail.com', '-', 7, 117, -7.0491000, 112.0108000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1004, '20505809', 'UPT SD NEGERI BEKTIHARJO 6', 25, 'SD', 'Negeri', 'B', 'DUSUN MEDOKAN', 'sdnegeribektiharjovi@gmail.com', '082337622873', 7, 72, -6.9820000, 112.0379000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1005, '20505613', 'UPT SD NEGERI KEDUNGREJO 1', 39, 'SD', 'Negeri', 'B', 'Jl. Raya Kedungrejo No 6034', 'sdnkedungrejo843@gmail.com', '082139115720', 5, 56, -6.8781000, 111.8746000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1006, '20505040', 'UPT SD NEGERI WOLUTENGAH 2', 39, 'SD', 'Negeri', 'B', 'Dsn Kanoman', '8tengah2sd@gmail.com', '081217245191', 8, 116, -6.8544000, 111.8310000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1007, '20505144', 'UPT SD NEGERI SUMBERAGUNG 3', 29, 'SD', 'Negeri', 'B', 'Jalan Raya Desa Sumberagung', 'sdnegerisumberagungIII@gmail.com', '081333027406', 8, 119, -7.0055000, 112.1062000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1008, '20505214', 'UPT SD NEGERI TEMAYANG', 39, 'SD', 'Negeri', 'B', 'Jl. Raya Temayang', 'sdnegeritemayang463@gmail.com', '-', 7, 89, -6.9016000, 111.8916000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1009, '20504981', 'UPT SD NEGERI MINOHOREJO 2', 27, 'SD', 'Negeri', 'B', 'Dusun Pancur', 'sdn.minohorejo2@gmail.com', '085231262999', 7, 54, -7.0075000, 112.1433000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1010, '20504900', 'UPT SD NEGERI MARGOREJO', 39, 'SD', 'Negeri', 'B', 'Jl. Raya Margorejo', 'sdnmargorejo_kerek@yahoo.co.id', '0356611933', 9, 149, -6.8898000, 111.8772000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1011, '20504761', 'UPT SD NEGERI RAYUNG 4', 34, 'SD', 'Negeri', 'B', 'Dusun Giwang', 'rayung.empat@gmail.com', '081335678953', 6, 98, -7.0611000, 111.7515000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1012, '20505750', 'UPT SD NEGERI DAWUNG 2', 26, 'SD', 'Negeri', 'B', 'Ds. Dawung', 'sugiyanto2303@gmail.com', '-', 6, 113, -6.9321000, 112.1112000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1013, '20505174', 'UPT SD NEGERI SOKOGRENJENG 2', 37, 'SD', 'Negeri', 'B', 'Ds Sokogrenjeng', 'sdn_sokogrenjeng@yahoo.com', '0', 8, 70, -6.9287000, 111.6792000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1014, '20505198', 'UPT SD NEGERI SUCIHARJO 2', 32, 'SD', 'Negeri', 'B', 'Jl. Raya Ponco - jatirogo No. 520', 'sdn.suciharjo2@gmail.com', '081335990736', 7, 66, -7.0920000, 111.8524000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1015, '20505657', 'UPT SD NEGERI KARANGLO 1', 39, 'SD', 'Negeri', 'B', 'Jln. Nusantara ', 'sdnkaranglo465@gmail.com', '03565612512', 6, 88, -6.8895000, 111.9060000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1016, '20505782', 'UPT SD NEGERI BOTO', 25, 'SD', 'Negeri', 'B', 'Desa Boto', 'sdnboto80@gmail.com', '-', 6, 76, -7.1298000, 111.9407000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1017, '20504994', 'UPT SD NEGERI NGADIPURO', 27, 'SD', 'Negeri', 'B', 'Jln. Pendidikan No. 102', 'sdn.ngadipuro1.widang@gmail.com', '03567004470', 7, 113, -7.0997000, 112.1584000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1018, '20504833', 'UPT SD NEGERI SIDOMUKTI 2', 37, 'SD', 'Negeri', 'B', 'JL.DIPONEGORO NO.470', 'sidomukti02negeri@gmail.com', '-', 6, 136, -6.9173000, 111.6274000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1019, '20504863', 'UPT SD NEGERI SELOGABUS 1', 32, 'SD', 'Negeri', 'B', 'Desa Selogabus', 'selogabussdn1@gmail.com', '082301323357', 8, 63, -7.1205000, 111.8569000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1020, '20539015', 'UPT SD NEGERI KETAMBUL', 26, 'SD', 'Negeri', 'B', 'Jln. Raya Munyuk', 'sdnketambul@yahoo.co.id', '08121667652', 5, 146, -6.9253000, 112.1929000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1021, '20504855', 'UPT SD NEGERI SEMBUNGIN 2', 41, 'SD', 'Negeri', 'C', 'Desa Sembungin', 'sdnegerisembungin02438@gimail.com', '082335454901', 6, 84, -6.7964000, 111.7527000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1022, '20504952', 'UPT SD NEGERI NGUJURAN 2', 41, 'SD', 'Negeri', 'B', 'Desa Ngujuran', 'sdnngujuran02@gmail.com', '081249661561', 5, 134, -6.8245000, 111.7019000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1023, '20505264', 'UPT SD NEGERI TEGALAGUNG 1', 25, 'SD', 'Negeri', 'B', 'Desa Tegalagung', 'sdn_tegalagung_satu@gmail.com', '0356333781', 8, 150, -7.1368000, 111.9103000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1024, '20504903', 'UPT SD NEGERI LERAN', 34, 'SD', 'Negeri', 'B', 'Jl. Prawiro Sadir No.312', 'leran313@gmail.com', '081335532777', 7, 49, -7.0419000, 111.7185000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1025, '20505171', 'UPT SD NEGERI SOKOSARI 1', 31, 'SD', 'Negeri', 'A', 'Jl. Raya Soko No. 368', 'sdn.sokosari.satu@gmail.com', '0356811357', 13, 282, -7.1135000, 111.9478000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1026, '20505812', 'UPT SD NEGERI BEKTIHARJO 2', 25, 'SD', 'Negeri', 'B', 'Desa Bektiharjo', 'sdnbektiharjo263@gmail.com', '-', 10, 166, -6.9610000, 112.0281000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1027, '20505804', 'UPT SD NEGERI BINANGUN 3', 33, 'SD', 'Negeri', 'B', 'Binangun', 'sdn03binangun3@yahoo.com', '08223602482', 7, 44, -7.0154000, 111.7697000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1028, '20505752', 'UPT SD NEGERI CANGKRING', 29, 'SD', 'Negeri', 'B', 'Jln. Raya Desa Cangkring Kecamatan Plumpang Kabupaten Tuban', 'sdn.cangkring263@gmail.com', '-', 7, 77, -7.0489000, 112.0888000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1029, '20505177', 'UPT SD NEGERI SOBONTORO', 40, 'SD', 'Negeri', 'B', 'Jl Raya Sobontoro', 'sdnsobontoro22@gmail.com', '-', 8, 65, -6.8015000, 111.8619000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1030, '20505136', 'UPT SD NEGERI WANGI 1', 36, 'SD', 'Negeri', 'B', 'Jl. Raya Wangi no.17', 'sdnegeriwangi1@gmail.com', '085749086843', 7, 91, -6.8565000, 111.6307000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1031, '20505153', 'UPT SD NEGERI SUMBEREJO 3', 30, 'SD', 'Negeri', 'B', 'Dusun Sugihan', 'sdnsumberejo3@yahoo.co.id', '03567034140', 7, 73, -7.0405000, 112.0182000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1032, '20504954', 'UPT SD NEGERI PANYURAN 1', 26, 'SD', 'Negeri', 'B', 'Jln. Raya Gresik No. 85', 'sdnpanyuran01.1976@gmail.com', '0356327952', 6, 102, -6.8964000, 112.0944000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1033, '20505156', 'UPT SD NEGERI SUMURJALAK 3', 29, 'SD', 'Negeri', 'B', 'Dusun Tegalrejo', 'sdn_sumurjalak3@yahoo.com', '082341304533', 8, 132, -7.0152000, 112.0954000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1034, '20505228', 'UPT SD NEGERI TUNGGULREJO', 33, 'SD', 'Negeri', 'B', 'Tunggulrejo', 'sdntunggulrejo266@gmail.com', '082338329977', 7, 67, -7.0012000, 111.7868000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1035, '20505256', 'UPT SD NEGERI TEGALREJO', 27, 'SD', 'Negeri', 'B', 'Dusun Mejeruk 009/002 Desa Tegalrejo', 'sdntegalrejowidang@gmail.com', '-', 7, 31, -7.0648000, 112.2163000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1036, '20505262', 'UPT SD NEGERI TEGALBANG 1', 26, 'SD', 'Negeri', 'A', 'Ds. Tegalbang', 'sdntegalbang01@gmail.com', '0', 8, 141, -6.9198000, 112.1062000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1037, '20504862', 'UPT SD NEGERI SELOGABUS 2', 32, 'SD', 'Negeri', 'B', 'Ds. Selogabus RT 05/RW 01', 'sdnselogabus2@yahoo.com', '085645333817', 4, 88, -7.1120000, 111.8605000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1038, '20504926', 'UPT SD NEGERI LATSARI 1', 41, 'SD', 'Negeri', 'B', 'Desa Latsari', 'TOTOKEDYWALUYA@YMAIL.COM', '082232715940', 7, 72, -6.7803000, 111.6909000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1039, '20505580', 'UPT SD NEGERI GAJI 5', 39, 'SD', 'Negeri', 'B', 'Rt 01 Rw 07 Dusun Gesikan', 'sdngaji05@gmail.com', '085645005041', 7, 51, -6.9044000, 111.8046000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1040, '20505173', 'UPT SD NEGERI SOKOGUNUNG 1', 37, 'SD', 'Negeri', 'B', 'Desa Sokogunung', 'http//sdn.sokogunung.01@gmail.com', '-', 7, 101, -6.9527000, 111.6039000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1041, '20504783', 'UPT SD NEGERI PASEYAN 2', 36, 'SD', 'Negeri', 'B', 'Jln. Raya Lasem No. 191', 'sdnpaseyanii@gmail.com', '-', 7, 61, -6.8699000, 111.6383000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1042, '20505659', 'UPT SD NEGERI KEBOMLATI', 29, 'SD', 'Negeri', 'B', 'Desa Kebomlati', 'sdnkebomlati01@gmail.com', '082131273035', 5, 148, -7.0563000, 112.0759000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1043, '20505658', 'UPT SD NEGERI KEBONAGUNG', 30, 'SD', 'Negeri', 'B', 'Jl. Popoan 331', 'sdnkebonagung153@gmail.com', '0356811477', 7, 123, -7.0869000, 111.9697000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1044, '20505781', 'UPT SD NEGERI CEPOKOREJO 1', 26, 'SD', 'Negeri', 'B', 'Dsn. Caper', 'sdncepokorejo1@gmail.com', '-', 7, 112, -6.9213000, 112.1759000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1045, '20505184', 'UPT SD NEGERI SOKOSARI 3', 31, 'SD', 'Negeri', 'B', 'Jl. Losari - Badegan  no.1467 ', 'sdnsokosari03@gmail.com', '-', 7, 80, -7.1109000, 111.9621000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1046, '20505053', 'UPT SD NEGERI WOTSOGO 2', 36, 'SD', 'Negeri', 'B', 'Jl Kartini No.03 Jatirogo', 'Sdnwotsogo02@yahoo.co.id', '0356551170', 8, 66, -6.8866000, 111.6565000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1047, '20505663', 'UPT SD NEGERI KASIMAN', 39, 'SD', 'Negeri', 'B', 'Kasiman', 'sdn.kasiman@gmail.com', '081357934353', 5, 51, -6.8727000, 111.8845000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1048, '20505581', 'UPT SD NEGERI GAJI 4', 39, 'SD', 'Negeri', 'B', 'Dusun Sidorejo', 'sdngaji4@gmail.com', '08125919622', 5, 104, -6.8519000, 111.8450000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1049, '20505574', 'UPT SD NEGERI JAROREJO 1', 39, 'SD', 'Negeri', 'B', 'Jl. Raya Jarorejo 323', 'sdnjarorejo001@gmail.com', '-', 7, 101, -6.9000000, 111.8851000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1050, '20504826', 'UPT SD NEGERI SIDONGANTI 1', 39, 'SD', 'Negeri', 'B', 'Dusun Soco', 'abvikay@yahoo.co.id', '-', 7, 81, -6.9099000, 111.8273000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1051, '20505662', 'UPT SD NEGERI KATERBAN', 34, 'SD', 'Negeri', 'B', 'Katerban', 'sdnkaterbansenori@gmail.com', '082144782628', 8, 125, -7.0596000, 111.7761000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1052, '20505640', 'UPT SD NEGERI KEBONHARJO 2', 36, 'SD', 'Negeri', 'C', 'Dusun Kebonharjo', 'sdnkebonharjo02@gmail.com', '0', 8, 51, -6.8652000, 111.6183000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1053, '20504787', 'UPT SD NEGERI PLANDIREJO', 29, 'SD', 'Negeri', 'B', 'Plandirejo', 'sdnplandirejo262@gmail.com', '-', 5, 83, -7.0813000, 112.0987000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1054, '20504963', 'UPT SD NEGERI PABEYAN', 40, 'SD', 'Negeri', 'B', 'Desa Pabeyan', 'sdnpabeyantambakboyo@gmail.com', '-', 6, 75, -6.8037000, 111.8382000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1055, '20504950', 'UPT SD NEGERI NGEPON 1', 36, 'SD', 'Negeri', 'B', 'Jl Raya Bulu', 'sdnngepon01@gmail.com', '085258905288', 8, 138, -6.8303000, 111.6789000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1056, '20505644', 'UPT SD NEGERI KARANG', 25, 'SD', 'Negeri', 'C', 'JL.MAJAPAHIT NO.111', 'sdnegerikarang@gmail.com', '-', 7, 35, -7.1302000, 111.9316000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1057, '20505564', 'UPT SD NEGERI JATISARI 3', 34, 'SD', 'Negeri', 'B', 'Jalan Prawiro Sadir Desa Jatisari', 'sdnjatisaritiga83@gmail.com', '082330624904', 5, 20, -7.0188000, 111.7191000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1058, '20504825', 'UPT SD NEGERI SIDONGANTI 2', 39, 'SD', 'Negeri', 'B', 'Jl. Raya Sidonganti', 'sdn.sidonganti2@yahoo.com', '081332121171', 10, 223, -6.9188000, 111.8218000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1059, '20505041', 'UPT SD NEGERI WOLUTENGAH 1', 39, 'SD', 'Negeri', 'A', 'Jln Raya Wolutengah NO 98', 'sdnwolutengahsatu@gmail.com', '081382675274', 10, 146, -6.8715000, 111.8410000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1060, '20505597', 'UPT SD NEGERI GESIKHARJO', 26, 'SD', 'Negeri', 'B', 'Jln. Gresik No. 151 GESIKHARJO', 'sdngesikharjo1i@gmail.com', '0356323047', 15, 277, -6.9204000, 112.1369000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1061, '20505158', 'UPT SD NEGERI SUMURJALAK 1', 29, 'SD', 'Negeri', 'B', 'Jln Raya Plumpang Rengel', 'wafasdnsumurjalak1@gmail.com', '085259020227', 6, 81, -7.0325000, 112.0880000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1062, '20505588', 'UPT SD NEGERI DINGIL 2', 36, 'SD', 'Negeri', 'C', 'Dusun Krajan', 'sdndingil02@gmail.com', '-', 7, 72, -6.9036000, 111.7051000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1063, '20504976', 'UPT SD NEGERI MOJOMALANG 1', 32, 'SD', 'Negeri', 'A', 'Jl. Raya Ponco Soko Parengan', 'sdn.mojomalang1@gmail.com', '081330447049', 7, 145, -7.1082000, 111.8786000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1064, '20505590', 'UPT SD NEGERI DIKIR', 40, 'SD', 'Negeri', 'B', 'Dikir', 'sdndikir@gmail.com', '082143623303', 6, 145, -6.8709000, 111.8324000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1065, '20505260', 'UPT SD NEGERI TEGALBANG 3', 26, 'SD', 'Negeri', 'B', 'Ds. Tegalbang', 'sdntegalbang03@gmail.com', '0', 7, 87, -6.9276000, 112.0989000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1066, '20505139', 'UPT SD NEGERI SUMBEREJO 1', 30, 'SD', 'Negeri', 'B', 'Jl Trobongso Rt 05 Rw 03', 'sumberejo01_sdn@yahoo.co.id', '-', 4, 24, -7.0356000, 112.0071000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1067, '20505149', 'UPT SD NEGERI SUKOREJO', 32, 'SD', 'Negeri', 'B', 'Dusun Sugihan', 'sdnsukorejo179@gmail.com', '085330161151', 8, 130, -7.0619000, 111.8172000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1068, '20505213', 'UPT SD NEGERI TENGGERKULON', 41, 'SD', 'Negeri', 'B', 'Desa Tenggerkulon', 'sdntenggerkulon@gmail.com', '085230062439', 7, 182, -6.7892000, 111.7140000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1069, '20505685', 'UPT SD NEGERI BANGUNREJO 2', 31, 'SD', 'Negeri', 'B', 'Desa Bangunrejo', 'sdnbangunrejoii@gmail.com', '-', 7, 203, -7.1037000, 111.9456000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1070, '20505630', 'UPT SD NEGERI KEPOHAGUNG 2', 29, 'SD', 'Negeri', 'B', 'Dsn. Grebegan ', 'sdnkepohagung02@gmail.com', '-', 6, 78, -7.0506000, 112.0744000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1071, '20504956', 'UPT SD NEGERI PANDANWANGI 2', 31, 'SD', 'Negeri', 'B', 'Desa Pandanwangi', 'sdnpandanwangi2soko@gmail.com', '085230547143', 6, 70, -7.1312000, 111.9610000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1072, '20505185', 'UPT SD NEGERI SOTANG', 40, 'SD', 'Negeri', 'B', 'Desa Sotang', 'sdsotang@gmail.com', '0815964406780', 6, 33, -6.8175000, 111.8289000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1073, '20505766', 'UPT SD NEGERI CENDORO', 26, 'SD', 'Negeri', 'B', 'Jln. Raya Rembes Pakah', 'sdncendoropalang@gmail.com', '0356', 7, 86, -6.9306000, 112.1363000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1074, '20505796', 'UPT SD NEGERI BANJARARUM', 30, 'SD', 'Negeri', 'B', 'Jl. Pahlawan No 106', 'banjararumsdn@gmail.com', '08165476939', 8, 111, -7.0386000, 112.0329000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1075, '20505641', 'UPT SD NEGERI KEBONHARJO 1', 36, 'SD', 'Negeri', 'B', 'Jalan Lasem 452', 'sdnkebonharjo@yahoo.co.id', '-', 5, 115, -6.8654000, 111.6321000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1076, '20504762', 'UPT SD NEGERI RAYUNG 3', 34, 'SD', 'Negeri', 'B', 'Rayung', 'sdn.rayung.iii@gmail.com', '082301317292', 5, 51, -7.0400000, 111.7832000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1077, '20504982', 'UPT SD NEGERI MINOHOREJO 1', 27, 'SD', 'Negeri', 'B', 'Jln. Raya Babat Tuban Km 14', 'sdnminohorejo@gmail.com', '0', 6, 125, -6.9968000, 112.1251000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1078, '20505042', 'UPT SD NEGERI WIDANG 4', 27, 'SD', 'Negeri', 'C', 'Dusun Temangkar', 'sdnwd4@gmail.com', '082285804851', 7, 43, -7.0661000, 112.1605000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1079, '20504753', 'UPT SD NEGERI PUNGGULREJO', 30, 'SD', 'Negeri', 'B', 'Jl. Raya Beron No. 646 Rengel', 'sdnpunggulrejo01@yahoo.com', '03567037662', 7, 72, -7.0506000, 112.0290000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1080, '20505763', 'UPT SD NEGERI BRANGKAL 2', 32, 'SD', 'Negeri', 'B', 'JLN. VETERAN NO. 320', 'sdn.brangkal.002@gmail.com', '-', 8, 83, -7.0883000, 111.8471000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1081, '20505668', 'UPT SD NEGERI KARANGTENGAH', 36, 'SD', 'Negeri', 'B', 'Dusun Karangtengah', 'sdnkarangtengah01@gmail.com', '-', 8, 70, -6.8786000, 111.6323000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1082, '20504838', 'UPT SD NEGERI SARINGEMBAT 2', 33, 'SD', 'Negeri', 'B', 'Ds. Saringembat', 'sdnsaringembat02@gmail.com', '081332249149', 8, 84, -7.0294000, 111.7851000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1083, '20504867', 'UPT SD NEGERI SAWIR', 40, 'SD', 'Negeri', 'B', 'Desa Sawir', 'sdnsawir@yahoo.com', '-', 7, 165, -6.8107000, 111.8670000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1084, '20504968', 'UPT SD NEGERI NGAWUN 1', 32, 'SD', 'Negeri', 'B', 'Jl Raya Ngawun No282', 'sdnngawun01@gmail.com', '081335975764', 6, 62, -7.1102000, 111.8840000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1085, '20505633', 'UPT SD NEGERI KENDALREJO', 31, 'SD', 'Negeri', 'B', 'Kendalrejo', 'sdnkendalrejo1234@gmail.com', '081554798480', 6, 104, -7.1520000, 111.9424000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1086, '20505589', 'UPT SD NEGERI DINGIL 1', 36, 'SD', 'Negeri', 'B', 'Desa Dingil Rt. 01 Rw. 10', 'sdndingil001@gmail.com', '-', 8, 74, -6.9040000, 111.7069000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1087, '20504798', 'UPT SD NEGERI PLUMPANG 3', 29, 'SD', 'Negeri', 'B', 'Jln Raya Plumpang Compreng No 504', 'sdnplumpang3@gmail.com', '0356812321', 8, 170, -7.0282000, 112.0996000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1088, '20505186', 'UPT SD NEGERI SUGIHWARAS 2', 32, 'SD', 'Negeri', 'C', 'Ds. Sugihwaras', 'sugihwaras2parengan@gmail.com', '082330530160', 8, 33, -6.8620000, 112.0254000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1089, '20504764', 'UPT SD NEGERI RAYUNG 1', 34, 'SD', 'Negeri', 'B', 'Rayung', 'rayung01sdn@gmail.com', '085259684831', 4, 44, -7.0549000, 111.7764000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1090, '20504882', 'UPT SD NEGERI LERAN KULON 3', 26, 'SD', 'Negeri', 'B', 'Ds. Leran Kulon', 'uptsdnegerilerankulon3@gmail.com', '0895411307700', 8, 90, -6.9205000, 112.1493000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1091, '20505179', 'UPT SD NEGERI SIMOREJO 2', 27, 'SD', 'Negeri', 'B', 'Jln. Pendowo', 'sdnsimorejoii272@gmail.com', '085808297098', 6, 50, -7.0480000, 112.2090000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1092, '20505537', 'UPT SD NEGERI JADI 3', 25, 'SD', 'Negeri', 'B', 'Desa Jadi', 'sdnjadi3@gmail.com', '0895329170788', 8, 156, -6.9471000, 111.9729000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1093, '20505591', 'UPT SD NEGERI GEDONGOMBO 4', 25, 'SD', 'Negeri', 'B', 'Lingk Kiring', 'gedongombo4@gmail.com', '-', 7, 123, -6.9349000, 112.0911000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1094, '20505758', 'UPT SD NEGERI BULUREJO 1', 30, 'SD', 'Negeri', 'B', 'Jl. Mejeruk No. 465', 'sdnbulurejo01145@gmail.com', '03567038273', 7, 121, -7.0946000, 111.9814000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1095, '20505002', 'UPT SD NEGERI MERKAWANG', 40, 'SD', 'Negeri', 'B', 'Desa Merkawang', 'sdnmerkawang1@gmail.com', '-', 7, 80, -6.8037000, 111.8910000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1096, '20504988', 'UPT SD NEGERI NGAMPELREJO', 41, 'SD', 'Negeri', 'B', 'Desa Ngampelrejo', 'imammuslikin77@gmail.com', '085732562165', 7, 159, -6.8092000, 111.7803000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1097, '20504962', 'UPT SD NEGERI PACING', 32, 'SD', 'Negeri', 'B', 'Desa Pacing', 'sdnpacingparengan@yahoo.co.id', '081330523707', 7, 153, -7.0576000, 111.8697000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1098, '20504881', 'UPT SD NEGERI LERAN WETAN', 26, 'SD', 'Negeri', 'B', 'Ds. Leran Wetan', 'sdnleranwetan1@gmail.com', '-', 15, 245, -6.9242000, 112.1547000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1099, '20505001', 'UPT SD NEGERI MULYOAGUNG 2', 33, 'SD', 'Negeri', 'B', 'Jl. Basuki Rahmat No. 1084', 'sdnmulyoagung@ymail.com', '085235662279', 11, 211, -6.9642000, 111.7883000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1100, '20504865', 'UPT SD NEGERI SEKARAN 2', 36, 'SD', 'Negeri', 'B', 'Dusun Dukuhan', 'sekarandua@yahoo.com', '0813304600979', 6, 127, -6.8694000, 111.7169000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1101, '20505585', 'UPT SD NEGERI GADON', 40, 'SD', 'Negeri', 'B', 'Jl Raya Gadon No. 23', 'sdngadon416@gmail.com', '081216138986', 5, 111, -6.8020000, 111.8326000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1102, '20504801', 'UPT SD NEGERI PLIWETAN', 26, 'SD', 'Negeri', 'B', 'Ds. Pliwetan', 'sdnpliwetann@gmail.com', '081335563617', 7, 156, -6.9034000, 112.1746000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1103, '20504889', 'UPT SD NEGERI MENYUNYUR', 42, 'SD', 'Negeri', 'C', 'Jln. Sendang Wetan', 'khresna6171@gmail.com', '081335337599', 5, 82, -7.0196000, 112.0385000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1104, '20505193', 'UPT SD NEGERI SUGIHAN 3', 36, 'SD', 'Negeri', 'B', 'Jln Masjid H Soedirman No 498', 'sekolahdasarnegeri03jatirogo@gmail.com', '0356551935', 7, 50, -6.8943000, 111.6731000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1105, '20504928', 'UPT SD NEGERI LAJO LOR', 33, 'SD', 'Negeri', 'B', 'Lajulor', 'sdnlajulor@yahoo.co.id', '081234929001', 7, 107, -6.9699000, 111.7504000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1106, '20504975', 'UPT SD NEGERI MOJOMALANG 2', 32, 'SD', 'Negeri', 'B', 'Desa Mojomalang', 'sdnmojomalang02@gmail.com', '-', 7, 41, -7.1088000, 111.8848000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1107, '20504984', 'UPT SD NEGERI MRUTUK 2', 27, 'SD', 'Negeri', 'B', 'Desa Mrutuk', 'sdnmrutuk2@gmail.com', '081515292220', 8, 116, -7.0183000, 112.1621000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1108, '20505619', 'UPT SD NEGERI KEDUNGHARJO', 27, 'SD', 'Negeri', 'B', 'Jln. Diponegoro No. 40', 'sdnkedungharjo@yahoo.co.id', '081331594232', 7, 55, -7.0709000, 112.1993000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1109, '20504870', 'UPT SD NEGERI MERGOSARI', 33, 'SD', 'Negeri', 'B', 'Ds. Mergosari', 'sdnmergosari6@gmail.com', '085231289394', 7, 125, -6.9967000, 111.7744000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1110, '20505240', 'UPT SD NEGERI TANJUNGREJO 2', 33, 'SD', 'Negeri', 'B', 'Dsn. Tanjungrejo', 'sdntanjungrejoii@gmail.com', '085230846521', 7, 42, -6.9963000, 111.7601000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1111, '20505217', 'UPT SD NEGERI TRANTANG', 39, 'SD', 'Negeri', 'B', 'Jl Desa Trantang', 'sdntrantang455@gmail.com', '0821233438165', 7, 126, -6.8870000, 111.8172000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1112, '20505636', 'UPT SD NEGERI KEMLATEN', 32, 'SD', 'Negeri', 'B', 'Desa Kemlaten', 'sdnkemlaten1@gmail.com', '082142204155', 7, 82, -7.0588000, 111.8017000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1113, '20505794', 'UPT SD NEGERI BANJARWORO 1', 35, 'SD', 'Negeri', 'B', 'Jl Ponco Jatirogo', 'sdnbanjarworo57@gmail.com', '03567007714', 5, 48, -6.9525000, 111.7305000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1114, '20505604', 'UPT SD NEGERI GEMULUNG 2', 39, 'SD', 'Negeri', 'B', 'Dsn. Gesikan', 'sholehmohammad3@gmail.com', '-', 7, 159, -6.8925000, 111.8022000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1115, '20504957', 'UPT SD NEGERI PANDANAGUNG', 31, 'SD', 'Negeri', 'B', 'Desa Pandanagung', 'sdnpandanagung@yahoo.co.id', '-', 8, 174, -7.1064000, 111.9171000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1116, '20505813', 'UPT SD NEGERI BEKTIHARJO 3', 25, 'SD', 'Negeri', 'B', 'Desa Bektiharjo', 'sdnbektiharjo03@gmail.com', '-', 12, 198, -6.9748000, 112.0277000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1117, '20504980', 'UPT SD NEGERI MLANGI 1', 27, 'SD', 'Negeri', 'B', 'Jln. Raya Mlangi No. 04', 'sdn_mlangi_I@yahoo.com', '-', 7, 140, -6.9977000, 112.1825000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1118, '20504951', 'UPT SD NEGERI NGAWUN 2', 32, 'SD', 'Negeri', 'B', 'Jl Jatirogo-Bojonegoro', 'sdnngawun2@gmail.com', '085331096373', 7, 53, -7.0482000, 111.8169000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1119, '20504997', 'UPT SD NEGERI MULYOAGUNG 4', 33, 'SD', 'Negeri', 'B', 'Dsn. Gegunung', 'gung04.sd@gmail.com', '-', 6, 91, -6.9291000, 111.7753000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1120, '20504796', 'UPT SD NEGERI PLUMPANG 5', 29, 'SD', 'Negeri', 'B', 'Dusun Plumpang', 'sdnplumpang5@gmail.com', '082331843225', 6, 115, -7.0325000, 112.1005000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1121, '20504985', 'UPT SD NEGERI MULYOAGUNG 1', 33, 'SD', 'Negeri', 'B', 'Jl. P. Sudirman 98', 'mulyoagungsd1@gmail.com', '08125947170', 6, 154, -6.9713000, 111.7829000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1122, '20505180', 'UPT SD NEGERI SIMOREJO 1', 27, 'SD', 'Negeri', 'B', 'Jalan Melati Putih No. 16', 'sdnsimorejo667@gmail.com', '081359708090', 8, 57, -7.0376000, 112.2197000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1123, '20504793', 'UPT SD NEGERI PRAMBONTERGAYANG 1', 31, 'SD', 'Negeri', 'B', 'Jl Prambontergayang No 809', 'sdnprb1@gmail.com', '085259021945', 8, 191, -7.0977000, 111.9164000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1124, '20504878', 'UPT SD NEGERI MAIBIT', 30, 'SD', 'Negeri', 'B', 'Desa Maibit', 'sdn.maibit@gmail.com', '-', 8, 93, -7.0732000, 111.9818000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1125, '20504769', 'UPT SD NEGERI RENGEL 5', 30, 'SD', 'Negeri', 'B', 'Jln. Raya Barat No. 933', 'sdnrengelv@yahoo.co.id', '0356812264', 7, 109, -7.0647000, 111.9991000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1126, '20505593', 'UPT SD NEGERI GLODOG', 26, 'SD', 'Negeri', 'A', 'Jln. Keprabon No. 180', 'sdnglodog107@gmail.com', '0356334320', 9, 178, -6.9051000, 112.1500000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1127, '20505143', 'UPT SD NEGERI SUMBERAGUNG 4', 29, 'SD', 'Negeri', 'B', 'Jalan Raya Sumberagung Dusun Morosemo', 'sumberagung4sdn@gmail.com', '081231028569', 7, 94, -7.0033000, 112.1094000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1128, '20505244', 'UPT SD NEGERI TANGGIR', 33, 'SD', 'Negeri', 'B', 'Dsn. Tanggir', 'sdn.tanggir1@gmail.com', '081335549032', 7, 62, -6.9765000, 111.7542000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1129, '20504774', 'UPT SD NEGERI PENIDON 3', 29, 'SD', 'Negeri', 'B', 'Jalan Raya Plumpang Compreng', 'sdnpenidonii4774@gmail.com', '-', 6, 63, -7.0293000, 112.1347000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1130, '20505165', 'UPT SD NEGERI SUMURCINDE 1', 31, 'SD', 'Negeri', 'B', 'Jl Raya Sumurcinde', 'sdnsumurcinde1@gmail.com', '085331447115', 7, 129, -7.0981000, 111.9601000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1131, '20504909', 'UPT SD NEGERI KRADENAN', 26, 'SD', 'Negeri', 'A', 'Jln. Raya Gresik No. 391', 'sdnegerikradenan@gmail.com', '0356327959', 6, 96, -6.9008000, 112.1180000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1132, '20505048', 'UPT SD NEGERI WANGUN 1', 26, 'SD', 'Negeri', 'B', 'Ds. Wangun', 'Sdn.Wangun.01@gmail.com', '085708374012', 8, 45, -6.9264000, 112.1665000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1133, '20505538', 'UPT SD NEGERI JADI 2', 25, 'SD', 'Negeri', 'B', 'Dusun Tlogonongko', 'sdnegerijadi2@gmail.com', '-', 8, 120, -6.9590000, 111.9983000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1134, '20505052', 'UPT SD NEGERI WOTSOGO 1', 36, 'SD', 'Negeri', 'A', 'Jln. Raya Barat No. 293 Jatirogo', 'sdnwotsogo01@yahoo.com', '0356551075', 9, 258, -6.8841000, 111.6562000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1135, '20504782', 'UPT SD NEGERI PATIHAN', 27, 'SD', 'Negeri', 'B', 'Jln. Angkasa No.69', 'sdnpatihan0@gmail.com', '03227710853', 6, 143, -7.0916000, 112.1414000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1136, '20504868', 'UPT SD NEGERI RENGEL 7', 30, 'SD', 'Negeri', 'B', 'Jl. Jaten Cilik', 'sdnrengelvii@yahoo.com', '08283472617', 8, 77, -7.0508000, 111.9931000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1137, '20505648', 'UPT SD NEGERI KANOREJO 1', 30, 'SD', 'Negeri', 'B', 'Desa Kanorejo', 'sdnkanorejo1@gmail.com', '-', 6, 71, -7.0976000, 112.0010000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1138, '20504745', 'UPT SD NEGERI PRUNGGAHAN WETAN', 25, 'SD', 'Negeri', 'B', 'Jln. Mertoyudho No. 08', 'sdnprunggahanwetan99@gmail.com', '0356333690', 7, 74, -6.9270000, 112.0547000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1139, '20504857', 'UPT SD NEGERI SEMBUNG 3', 32, 'SD', 'Negeri', 'C', 'Desa Sembung', 'sdnsembungtiga@gmail.com', '085230686583', 6, 25, -7.0325000, 111.7938000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1140, '20505255', 'UPT SD NEGERI TEGALSARI 1', 27, 'SD', 'Negeri', 'B', 'Jln. Pendidikan No. 01', 'sdntegalsari29@gmail.com', '085232943179', 8, 57, -7.0787000, 112.1909000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1141, '20505039', 'UPT SD NEGERI WONOSARI 1', 34, 'SD', 'Negeri', 'B', 'Desa Wonosari', 'sdnwono01@gmail.com', '082229319347', 6, 42, -7.0773000, 111.7134000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1142, '20504955', 'UPT SD NEGERI PANDANWANGI 1', 31, 'SD', 'Negeri', 'B', 'DESA PANDANWANGI', 'pandanwangi1.sdn@gmail.com', '0', 4, 54, -7.1351000, 111.9701000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1143, '20504852', 'UPT SD NEGERI SARINGEMBAT 3', 33, 'SD', 'Negeri', 'B', 'Jl. Letda Sucipto No. 1 ', 'sdnsaringembat3@gmail.com', '082140989909', 8, 52, -7.0232000, 111.7826000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1144, '20505612', 'UPT SD NEGERI KEDUNGREJO 2', 39, 'SD', 'Negeri', 'B', 'Desa Kedungrejo', 'sdnkedungrejo00@gmail.com', '088227175101', 6, 16, -6.8723000, 111.8797000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1145, '20504861', 'UPT SD NEGERI SEMANDING', 25, 'SD', 'Negeri', 'B', 'Jln. Hayam Wuruk', 'sdnsemanding01@gmail.com', '0356323435', 15, 311, -6.9320000, 112.0617000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1146, '20505803', 'UPT SD NEGERI BOGOREJO', 41, 'SD', 'Negeri', 'B', 'Jl. Raya Bogorejo-Bancar 137', 'sdnbogorejobancar@gmail.com', '-', 8, 86, -6.8767000, 112.0078000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1147, '20504887', 'UPT SD NEGERI MERGOASRI', 32, 'SD', 'Negeri', 'B', 'Desa Mergoasri', 'sdnmergoasri@gmail.com', '0', 8, 79, -7.0660000, 111.8108000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1148, '20505780', 'UPT SD NEGERI CEPOKOREJO 2', 26, 'SD', 'Negeri', 'B', 'Ds. Cepokorejo', 'cepokorejo02palang@gmail.com', '-', 7, 116, -6.9213000, 112.1759000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1149, '20505755', 'UPT SD NEGERI BUNUT', 27, 'SD', 'Negeri', 'B', 'JL.RAYA BUNUT NO.19', 'sdnbunut@gmail.com', '-', 8, 73, -7.0790000, 112.1583000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1150, '20504965', 'UPT SD NEGERI NGURUAN 1', 31, 'SD', 'Negeri', 'B', 'Jl. Botorejo No.02', 'sdnnguruhan@gmail.com', '-', 5, 97, -7.0753000, 111.9564000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1151, '20504896', 'UPT SD NEGERI MEDALEM 1', 34, 'SD', 'Negeri', 'B', 'Desa Medalem', 'sdnmedalem1.senori@gmail.com', '081335992772', 6, 44, -7.0067000, 111.7073000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1152, '20505241', 'UPT SD NEGERI TANJUNGREJO 1', 33, 'SD', 'Negeri', 'B', 'Jalan Singonolo Desa Tanjungrejo', 'sdntanjungrejo1singgahan@gmail.com', '0', 7, 29, -6.9945000, 111.7603000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1153, '20504866', 'UPT SD NEGERI SEKARAN 1', 36, 'SD', 'Negeri', 'B', 'Jalan Poros Desa Sekaran Dusun Dukuhan ', 'sdnsekaran01@gmail.com', '082230912877', 6, 71, -6.8689000, 111.7178000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1154, '20505245', 'UPT SD NEGERI TAMBAKREJO 2', 30, 'SD', 'Negeri', 'B', 'Tambakrejo', 'sdntambakrejo377@gmail.com', '085745308863', 6, 54, -7.1141000, 112.0029000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1155, '20505067', 'UPT SD NEGERI WOTSOGO 3', 36, 'SD', 'Negeri', 'B', 'Jl Jombok No 1240', 'sdnwotsogoiii@gmail.com', '0356551566', 9, 130, -6.8877000, 111.6522000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1156, '20505142', 'UPT SD NEGERI SUMBERAN', 41, 'SD', 'Negeri', 'B', 'Dusun Sumberan', 'sdnsumberan420@gmail.com', '085655992827', 7, 87, -6.8021000, 111.7429000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1157, '20505681', 'UPT SD NEGERI KARANGLO 3', 39, 'SD', 'Negeri', 'C', 'Jl. P. Sudirman', 'uptsdnkaranglo3@gmail.com', '-', 7, 49, -6.8887000, 111.9112000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1158, '20505172', 'UPT SD NEGERI SOKOGUNUNG 2', 37, 'SD', 'Negeri', 'B', 'Ds Sokogunung', 'arjuno.panah@gmail.com', '085231384696', 7, 33, -6.9350000, 111.6036000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1159, '20505254', 'UPT SD NEGERI TEGALSARI 2', 27, 'SD', 'Negeri', 'B', 'Jl. Dusun Baran No. 01 ', 'sdntegalsaridua@ymail.com', '-', 8, 26, -7.0624000, 112.1908000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1160, '20504781', 'UPT SD NEGERI PEKUWON', 30, 'SD', 'Negeri', 'B', 'Jl. Nggatang No. 16', 'sdnpekuwon8@gmail.com', '085821928830', 5, 67, -7.0716000, 111.9756000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1161, '20505248', 'UPT SD NEGERI TAMBAKBOYO 1', 40, 'SD', 'Negeri', 'B', 'Jl. Raya Timur No. 248 Tambakboyo', 'sdntambakboyo58@gmail.com', '0356412233', 7, 151, -6.8033000, 111.8460000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1162, '20504943', 'UPT SD NEGERI BENDONGLATENG 2', 37, 'SD', 'Negeri', 'B', 'Dsn Gowah', 'sdn.nglateng2@gmail.com', '-', 7, 45, -6.9388000, 111.6558000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1163, '20505265', 'UPT SD NEGERI TAWARAN 4', 37, 'SD', 'Negeri', 'B', 'Dsn Wonorejo', 'sdntawaraniv@gmail.com', '082257146097', 8, 33, -6.8918000, 111.6148000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1164, '20505570', 'UPT SD NEGERI JATIKLABANG 2', 36, 'SD', 'Negeri', 'B', 'Jl. Raya Timur No. 189', 'sdnegeri.jatiklabang2@gmail.com', '085336684232', 8, 96, -6.9165000, 111.6838000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1165, '20505651', 'UPT SD NEGERI KALIGEDE 1', 34, 'SD', 'Negeri', 'B', 'Kaligede', 'sdnkaligedesatu@gmail.com', '085232817489', 7, 60, -7.0309000, 111.7018000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1166, '20505572', 'UPT SD NEGERI JATI', 31, 'SD', 'Negeri', 'B', 'Jl Sari Mulyo Nomor 60', 'sdnjati211@gmail.com', '-', 7, 136, -7.0897000, 111.9075000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1167, '20505578', 'UPT SD NEGERI GEDONGOMBO 2', 25, 'SD', 'Negeri', 'B', 'Lingk. Widengan', 'sdn.gedongombo02@gmail.com', '334425', 7, 126, -6.9155000, 112.0881000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1168, '20504913', 'UPT SD NEGERI KLUTUK 1', 40, 'SD', 'Negeri', 'B', 'Desa Klutuk', 'sdnegeriklutuk01@gmail.com', '082257649730', 8, 69, -6.8161000, 111.8399000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1169, '20505595', 'UPT SD NEGERI GESING', 25, 'SD', 'Negeri', 'B', 'Desa Gesing', 'sdn_gesing@yahoo.com', '-', 8, 133, -6.9642000, 112.1072000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1170, '20505799', 'UPT SD NEGERI BEJAGUNG', 25, 'SD', 'Negeri', 'B', 'Jln. Hayam Wuruk No. 55', 'y0uh4n@yahoo.co.id', '0356325681', 13, 208, -6.9209000, 112.0631000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1171, '20504970', 'UPT SD NEGERI MRUTUK 1', 27, 'SD', 'Negeri', 'B', 'Jln. Brawijaya No. 353', 'sdnmrutuk1@gmail.com', '081332642261', 7, 91, -7.0159000, 112.1567000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1172, '20505661', 'UPT SD NEGERI KAYEN 1', 41, 'SD', 'Negeri', 'C', 'Jln. Desa Kayen No. 05', 'kayensatu1@gmail.com', '085731575415', 7, 100, -6.8226000, 111.7412000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1173, '20505247', 'UPT SD NEGERI TAMBAKBOYO 2', 40, 'SD', 'Negeri', 'B', 'Jl Tengiri No. 02', 'sdntambakboyo2oke@gmail.com', '-', 6, 107, -6.8028000, 111.8452000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1174, '20504859', 'UPT SD NEGERI SEMBUNG 1', 32, 'SD', 'Negeri', 'B', 'Jl Raya Sembung No26', 'sdnsembung@gmail.com', '081335686872', 8, 29, -7.0476000, 111.7870000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1175, '20504879', 'UPT SD NEGERI MAGERSARI', 29, 'SD', 'Negeri', 'B', 'Desa Magersari', 'sdnmagersari@yahoo.co.id', '035681277', 6, 96, -7.0300000, 112.1227000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1176, '20504846', 'UPT SD NEGERI SADANG 2', 36, 'SD', 'Negeri', 'B', 'Dusun Sadang', 'sdnegerisadang02@gmail.com', '03564321525', 8, 89, -6.8728000, 111.6640000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1177, '20504840', 'UPT SD NEGERI SANDINGROWO 2', 31, 'SD', 'Negeri', 'B', 'Jl.semanding No.25', 'sdnsandingrowo02@gmail.com', '-', 4, 38, -7.1154000, 111.9706000, 'belum', NULL, '2026-09-10 05:44:13', NULL);
INSERT INTO `satuan_pendidikan` (`id`, `npsn`, `nama`, `kecamatan_id`, `jenjang`, `status_sekolah`, `akreditasi`, `alamat`, `email`, `telepon`, `total_guru`, `total_siswa`, `latitude`, `longitude`, `status_pengisian`, `last_updated`, `created_at`, `deleted_at`) VALUES
(1178, '20505065', 'UPT SD NEGERI WUKIRHARJO 1', 32, 'SD', 'Negeri', 'B', 'Desa Wukirharjo', 'sdnwukirharjo@yahoo.co.id', '085231963989', 6, 101, -7.0328000, 111.8636000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1179, '20505617', 'UPT SD NEGERI KEDUNGJAMBE 1', 33, 'SD', 'Negeri', 'B', 'JL. A.YANI NO.189', 'sdnkedungjambe@ymail.com', '085235662279', 8, 67, -7.0081000, 111.7914000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1180, '20505615', 'UPT SD NEGERI KEDUNGMAKAM', 36, 'SD', 'Negeri', 'B', 'Jl. Sekaran  No. 01', 'kedungmakamsdn@gmail.com', '03567009243', 6, 105, -6.8640000, 111.6827000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1181, '20505175', 'UPT SD NEGERI SOKOGRENJENG 1', 37, 'SD', 'Negeri', 'B', 'Desa Sokogrenjeng', 'sdnsokogrenjeng6@gmail.com', '0', 8, 116, -6.9230000, 111.6673000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1182, '20505050', 'UPT SD NEGERI WANGLUKULON 2', 34, 'SD', 'Negeri', 'C', 'Dusun Ngebrak', 'wanglukulon2@gmail.com', '082229319347', 7, 36, -7.0440000, 111.7144000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1183, '20504908', 'UPT SD NEGERI KUJUNG', 27, 'SD', 'Negeri', 'B', 'Desa Kujung', 'sdn_kujung@yahoo.co.id', '083832910055', 6, 56, -6.9892000, 112.1877000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1184, '20504901', 'UPT SD NEGERI MARGOREJO', 32, 'SD', 'Negeri', 'B', 'Desa Margorejo Rt12 Rw04', 'sdnmargorejo1@gmail.com', '085733468653', 7, 144, -7.0996000, 111.8532000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1185, '20504767', 'UPT SD NEGERI RAHAYU', 31, 'SD', 'Negeri', 'A', 'Jl. Lingkar Pertamina', 'sdnrahayu188.09@gmail.com', '081331880039', 11, 191, -7.1054000, 111.9676000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1186, '20505539', 'UPT SD NEGERI JADI 1', 25, 'SD', 'Negeri', 'B', 'Desa Jadi', 'sdnjadi1@gmail.com', '081553962180', 7, 83, -6.9295000, 112.0003000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1187, '20505611', 'UPT SD NEGERI KEDUNGROJO', 29, 'SD', 'Negeri', 'B', 'Jl Raya Kedungrojo No.447', 'sdn.kedungrojo.plumpang@gmail.com', '0356811673', 7, 127, -7.0605000, 112.0776000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1188, '20505774', 'UPT SD NEGERI COMPRENG 2', 27, 'SD', 'Negeri', 'B', 'Dusun Temas', 'sdncompreng2@gmail.com', '03567004480', 7, 45, -7.0428000, 112.1595000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1189, '20505603', 'UPT SD NEGERI GEMULUNG 3', 39, 'SD', 'Negeri', 'B', 'Ds. Gemulung', 'sdngemulung3@gmail.com', '0', 6, 67, -6.8946000, 111.7775000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1190, '20504858', 'UPT SD NEGERI SEMBUNG 2', 32, 'SD', 'Negeri', 'B', 'Jl. Raya Brangkal No.05', 'sdnegerisembung02@gmail.com', '085230684155', 8, 83, -7.0490000, 111.7890000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1191, '20505650', 'UPT SD NEGERI KALIGEDE 2', 34, 'SD', 'Negeri', 'B', 'Kaligede', 'sdnkaligededua@gmail.com', '081235970366', 8, 131, -7.0335000, 111.6993000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1192, '20505783', 'UPT SD NEGERI BANJARAGUNG 1', 30, 'SD', 'Negeri', 'B', 'Dukuh Gumeng', 'sdnbanjaragung1.rengel@gmail.com', '08113401311', 7, 120, -7.0437000, 112.0446000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1193, '20504829', 'UPT SD NEGERI SIDOMULYO', 41, 'SD', 'Negeri', 'B', 'DESA SIDOMULYO', 'sdnsidomulyo439@gmail.com', '087805820727', 8, 59, -6.9046000, 111.6758000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1194, '20505544', 'UPT SD NEGERI GUNUNGANYAR', 31, 'SD', 'Negeri', 'B', 'Desa Gununganyar', 'sdngununganyar@gmail.com', '085335248756', 8, 178, -7.0655000, 111.9600000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1195, '20505140', 'UPT SD NEGERI SUMBERJO', 27, 'SD', 'Negeri', 'B', 'Jln. Hamka No. 493', 'sdnsumberjo01@gmail.com', '08888600003', 7, 82, -7.0039000, 112.1545000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1196, '20504991', 'UPT SD NEGERI NGADIREJO', 27, 'SD', 'Negeri', 'B', 'Jln. Pendidikan No. 14', 'sdnngadirejo.widang@gmail.com', '082142562066', 8, 110, -7.0938000, 112.1626000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1197, '20504842', 'UPT SD NEGERI SAMBONGREJO 2', 25, 'SD', 'Negeri', 'B', 'Desa Sambongrejo', 'sambongrejodua@gmail.com', '082234534789', 8, 59, -6.9734000, 112.0654000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1198, '20505616', 'UPT SD NEGERI KEDUNGJAMBE 2', 33, 'SD', 'Negeri', 'B', 'Dsn. Galoh Rt 03 Rw 03', 'sdnjambeii@yahoo.co.id', '-', 6, 21, -7.0170000, 111.8132000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1199, '20505684', 'UPT SD NEGERI DEMIT', 36, 'SD', 'Negeri', 'B', 'DUSUN KRAJAN', 'demitsdn358@gmail.com', '085235696709', 7, 62, -6.8943000, 111.6841000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1200, '20574804', 'SD ISLAM DARUT TAUHID', 40, 'SD', 'Swasta', 'B', 'JL KH. ASYHARI', 'sdidaruttauhid@ymail.com', '085257924216', 11, 254, -6.8029000, 111.8410000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1201, '20555051', 'SDIT AL HASANIYAH', 34, 'SD', 'Swasta', 'B', 'Jl. Letnan Sutjipto Sendang, Senori', 'sditalhasaniyyah01@gmail.com', '085230845767', 8, 87, -7.0061000, 111.7306000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1202, '20505764', 'UPT SD NEGERI BRANGKAL 1', 32, 'SD', 'Negeri', 'B', 'Desa Brangkal', 'Sdn_brangkal01@yahoo.com', '-', 8, 161, -7.0838000, 111.8442000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1203, '20505534', 'UPT SD NEGERI JAMPRONG 1', 37, 'SD', 'Negeri', 'B', 'Dsn Gunung Wangon', 'jamprongsatu@gmail.com', '03567009280', 9, 109, -6.9513000, 111.6317000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1204, '20505577', 'UPT SD NEGERI GEDONGOMBO 3', 25, 'SD', 'Negeri', 'B', 'Jln. Hayam Wuruk Gg. Syeh Maulana', 'sdn.geo3@gmail.com', '-', 7, 157, -6.9128000, 112.0663000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1205, '20505805', 'UPT SD NEGERI BINANGUN 2', 33, 'SD', 'Negeri', 'B', 'Binangun', 'sdnbinangun002@gmail.com', '085257613852', 8, 46, -7.0222000, 111.7565000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1206, '20505146', 'UPT SD NEGERI SUMBERAGUNG 1', 29, 'SD', 'Negeri', 'B', 'Dsn. sundulan Ds. sumberagung Kec. Plumpang Kab. Tuban', 'sdn.sumberagung01@yahoo.com', '-', 8, 170, -6.9970000, 112.1186000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1207, '20505702', 'UPT SD NEGERI BANGUNREJO 1', 31, 'SD', 'Negeri', 'B', 'Jalan Simpang Lima Rekul No.78', 'sdnbangunrejo01@gmail.com', '-', 6, 75, -7.1058000, 111.9532000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1208, '20504790', 'UPT SD NEGERI PRAMBONWETAN', 30, 'SD', 'Negeri', 'B', 'Jl. Raya No. 258 Prambonwetan', 'sdnprambonwetan@gmail.com', '081332719599', 7, 125, -7.0635000, 112.0684000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1209, '20505767', 'UPT SD NEGERI DAWUNG 1', 26, 'SD', 'Negeri', 'B', 'Ds. Dawung', 'sdn_dawungsatu@yahoo.com', '082244596022', 7, 54, -6.9291000, 112.1149000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1210, '20505038', 'UPT SD NEGERI WONOSARI 2', 34, 'SD', 'Negeri', 'B', 'Desa Wonosari Rt/rw. 09/03', 'Sdnegeriwonosari02@gmail.com', '082229319347', 6, 62, -7.0701000, 111.7159000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1211, '20505566', 'UPT SD NEGERI JATISARI 1', 34, 'SD', 'Negeri', 'B', 'Jl. Ahmad Yani No. 63', 'jatisarisdn1@gmail.com', '081330113636', 6, 47, -7.0121000, 111.7214000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1212, '20505159', 'UPT SD NEGERI SUMURGUNG', 26, 'SD', 'Negeri', 'B', 'Jl. Masjid No. 12', 'sdnsumurgungno.87@gmail.com', '0', 8, 93, -6.9082000, 112.1076000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1213, '20504740', 'UPT SD NEGERI PUCANGAN 3', 26, 'SD', 'Negeri', 'C', 'Dsn. Pomahan ', 'sdnpucangan03@gmail.com', '082244110239', 6, 25, -6.9153000, 112.1280000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1214, '20505141', 'UPT SD NEGERI SUMBERARUM', 39, 'SD', 'Negeri', 'B', 'Jalan Raya Desa Sumberarum', 'sdnsumberarumkerek@gmail.com', '-', 7, 112, -6.8785000, 111.8949000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1215, '20505266', 'UPT SD NEGERI TAWARAN 3', 37, 'SD', 'Negeri', 'B', 'Dsn Gato', 'sdntawaran03@gmail.com', '-', 7, 13, -6.9203000, 111.6075000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1216, '20505043', 'UPT SD NEGERI WIDANG 3', 27, 'SD', 'Negeri', 'B', 'Jln. Raya Widang Tuban No. 01', 'widangsdn@gmail.com', '081330074560', 7, 44, -7.0837000, 112.1705000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1217, '20504758', 'UPT SD NEGERI RENGEL 1', 30, 'SD', 'Negeri', 'A', 'JL. RAYA NO. 164', 'sdnrengel1@yahoo.com', '0356812363', 16, 402, -7.0364000, 112.0043000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1218, '20504831', 'UPT SD NEGERI SIDOMUKTI 4', 37, 'SD', 'Negeri', 'B', 'Jalan Bendholateng', 'eetac@yahoo.com', '0', 6, 76, -6.9224000, 111.6293000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1219, '20505632', 'UPT SD NEGERI KENONGOSARI', 31, 'SD', 'Negeri', 'B', 'Jalan Bengawan Solo No. 35 RT 04 RW 03', 'sdnkenongosari06@gmail.com', '-', 7, 124, -7.1269000, 111.9915000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1220, '20504949', 'UPT SD NEGERI NGEPON 2', 36, 'SD', 'Negeri', 'C', 'Dusun Salam', 'sdnngepon02@gmail.com', '-', 8, 36, -6.8464000, 111.6775000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1221, '20504977', 'UPT SD NEGERI MOJOAGUNG', 31, 'SD', 'Negeri', 'B', 'Mojoagung', 'sdn_mojoagung@gmail.com', '0', 4, 82, -7.1299000, 111.9468000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1222, '20505711', 'UPT SD NEGERI BADER', 36, 'SD', 'Negeri', 'B', 'Desa Bader', 'sdnbaderjatirogo@gmail.com', '0356552698', 7, 80, -6.8666000, 111.6540000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1223, '20504872', 'UPT SD NEGERI MANDER 3', 40, 'SD', 'Negeri', 'B', 'Jl. Sendang Dampung', 'sdnmander03@gmail.com', '085335996690', 7, 74, -6.8441000, 111.8018000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1224, '20505064', 'UPT SD NEGERI WUKIRHARJO 2', 32, 'SD', 'Negeri', 'C', 'Jl. Kyai Girik No. 267', 'sdnegeriwukirharjo2@gmail.com', '-', 8, 87, -7.0371000, 111.8759000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1225, '20505573', 'UPT SD NEGERI JAROREJO 2', 39, 'SD', 'Negeri', 'B', 'Jl. Pemuda 35', 'sdnjarorejo02kerek@gmail.com', '0356611591', 7, 79, -6.8983000, 111.8801000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1226, '20505068', 'UPT SD NEGERI WANGI 2', 36, 'SD', 'Negeri', 'B', 'Desa Wangi', 'sdnwangi2@gmail.com', '-', 8, 71, -6.8522000, 111.6337000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1227, '20504791', 'UPT SD NEGERI PRAMBONTERGAYANG 3', 31, 'SD', 'Negeri', 'B', 'Jl Sawahan', 'didikdarmadi20@yahoo.com', '-', 7, 121, -7.0995000, 111.9232000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1228, '20504809', 'UPT SD NEGERI SIDOHARJO 1', 34, 'SD', 'Negeri', 'B', 'Desa Sidoharjo', 'sdn.sidoharjo_i@yahoo.com', '082218966600', 8, 68, -7.0400000, 111.7393000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1229, '20505708', 'UPT SD NEGERI BANDUNGREJO', 29, 'SD', 'Negeri', 'B', 'Jl Raya Bandungrejo Plumpang', 'sdnbandungrejo12@gmail.com', '-', 7, 80, -7.0828000, 112.1089000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1230, '20505049', 'UPT SD NEGERI WANGLUWETAN', 34, 'SD', 'Negeri', 'B', 'Desa Wangluwetan', 'sdn.wangluwetan@gmail.com', '082231507616', 7, 75, -7.0234000, 111.7356000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1231, '20505218', 'UPT SD NEGERI TRUTUP', 29, 'SD', 'Negeri', 'B', 'Raya Trutup No. 59', 'sdntrutup1@gmail.com', '0356811762', 8, 184, -7.0354000, 112.0629000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1232, '20504837', 'UPT SD NEGERI SEMBUNGREJO', 29, 'SD', 'Negeri', 'B', 'Sembungrejo Plumpang Tuban', 'sdnsembungrejo@ymail.com', '085645117278', 6, 154, -7.0727000, 112.0885000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1233, '20504773', 'UPT SD NEGERI PENIDON 5', 29, 'SD', 'Negeri', 'B', 'Dusun Pakis RT 03 RW 03 ', 'sdnpenidonv@gmail.com', '-', 7, 109, -7.0187000, 112.1416000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1234, '20504799', 'UPT SD NEGERI PLUMPANG 2', 29, 'SD', 'Negeri', 'B', 'Jalan Raya Plumpang - Bandungrejo', 'sdn.plumpang02@gmail.com', '-', 8, 110, -7.0350000, 112.1015000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1235, '20505189', 'UPT SD NEGERI SUGIHWARAS 1', 32, 'SD', 'Negeri', 'B', 'Ds. Sugihwaras', 'sdnegerisugihwaras01@gmail.com', '085232580446', 6, 100, -7.0969000, 111.8814000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1236, '20505600', 'UPT SD NEGERI GESIKAN 1', 42, 'SD', 'Negeri', 'B', 'Jln. Raya Gesikan', 'angginanggun772@gmail.com', '082132514180', 8, 143, -6.9997000, 111.9982000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1237, '20505642', 'UPT SD NEGERI KARANGAGUNG', 26, 'SD', 'Negeri', 'B', 'Jalan Raya Gresik No.02 Desa Karangagung Palang - Tuban', 'sdnkarangagung62@gmail.com', '0356320492', 15, 306, -6.8999000, 112.1672000, 'belum', NULL, '2026-09-10 05:44:13', NULL),
(1238, '20505170', 'UPT SD NEGERI SOKOSARI 2', 31, 'SD', 'Negeri', 'C', 'Jl Utara Pasar Soko', 'sdnsokosari2_186@yahoo.com', '-', 5, 34, -7.1162000, 111.9477000, 'belum', NULL, '2026-09-10 05:44:13', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sel_dimensi`
--

CREATE TABLE `sel_dimensi` (
  `id` int NOT NULL,
  `kode` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Identifier: kesadaran_diri, regulasi_emosi, kesadaran_sosial, keterampilan_relasi, tanggung_jawab',
  `nama` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama dimensi SEL Bahasa Indonesia',
  `modul_bsan_kode` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mapping ke modul_bsan.kode — menghubungkan dimensi SEL ke modul BSAN',
  `general_skill_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'General skill CASEL: self_awareness, self_regulation, dll',
  `urutan` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='5 dimensi SEL yang diamati (CASEL framework) — mapping ke 3 modul BSAN';

--
-- Dumping data for table `sel_dimensi`
--

INSERT INTO `sel_dimensi` (`id`, `kode`, `nama`, `modul_bsan_kode`, `general_skill_id`, `urutan`, `created_at`) VALUES
(1, 'kesadaran_diri', 'Kesadaran Diri', 'with_myself', 'self_awareness', 1, '2026-09-10 05:42:46'),
(2, 'regulasi_emosi', 'Regulasi Emosi', 'with_myself', 'self_regulation', 2, '2026-09-10 05:42:46'),
(3, 'kesadaran_sosial', 'Kesadaran Sosial', 'with_others', 'social_awareness', 3, '2026-09-10 05:42:46'),
(4, 'keterampilan_relasi', 'Keterampilan Relasi', 'with_others', 'positive_communication', 4, '2026-09-10 05:42:46'),
(5, 'tanggung_jawab', 'Tanggung Jawab', 'with_challenges', 'responsible_decision_making', 5, '2026-09-10 05:42:46');

-- --------------------------------------------------------

--
-- Table structure for table `sel_indikator`
--

CREATE TABLE `sel_indikator` (
  `id` int NOT NULL,
  `kode` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Kode unik: guru_kd_kls_1, murid_re_lngk_2, dll',
  `dimensi_id` int NOT NULL COMMENT 'FK ke sel_dimensi.id',
  `subjek` enum('guru','murid') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Subjek yang diamati: guru atau murid',
  `konteks` enum('kelas','lingkungan') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Konteks pengamatan: di dalam kelas atau di lingkungan sekolah',
  `teks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Deskripsi lengkap indikator yang diamati',
  `catatan` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Petunjuk tambahan untuk observer (opsional)',
  `urutan` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='55 indikator observasi SEL — Guru (26) + Murid (29) berdasarkan Instrumen BSAN-SEL';

--
-- Dumping data for table `sel_indikator`
--

INSERT INTO `sel_indikator` (`id`, `kode`, `dimensi_id`, `subjek`, `konteks`, `teks`, `catatan`, `urutan`, `is_active`, `created_at`, `deleted_at`) VALUES
(1, 'guru_kd_kls_1', 1, 'guru', 'kelas', 'Guru meminta murid menuliskan hal yang mereka kuasai dan hal yang perlu mereka tingkatkan', NULL, 1, 1, '2026-09-16 01:36:21', NULL),
(2, 'guru_kd_kls_2', 1, 'guru', 'kelas', 'Guru memberi apresiasi atas jawaban murid di kelas', NULL, 2, 1, '2026-09-16 01:36:21', NULL),
(3, 'guru_kd_kls_3', 1, 'guru', 'kelas', 'Guru memfasilitasi sesi refleksi di akhir pelajaran', NULL, 3, 1, '2026-09-16 01:36:21', NULL),
(4, 'guru_kd_lngk_1', 1, 'guru', 'lingkungan', 'Guru memberi pujian saat murid berani mencoba hal baru. Misal Berani maju ke depan kelas, mengajukan diri menjadi ketua kelas, menjadi petugas upacara dll]', 'Jika selama observasi tidak ada kegiatan, bisa ditanyakan ke guru [secara umum murid, atau hanya murid tertentu]', 4, 1, '2026-09-16 01:36:21', NULL),
(5, 'guru_kd_lngk_2', 1, 'guru', 'lingkungan', 'Guru mengajak diskusi ringan saat istirahat tentang pengalaman mereka hari itu', 'Wawancara guru jika tidak terjadi', 5, 1, '2026-09-16 01:36:21', NULL),
(6, 'guru_re_kls_1', 2, 'guru', 'kelas', 'Ketika kelas gaduh, guru mencontohkan dan mengajak murid menggunakan regulasi emosi (teknik STOP, afirmasi positif, penggunaan tepuk, dll)', NULL, 6, 1, '2026-09-16 01:36:21', NULL),
(7, 'guru_re_kls_2', 2, 'guru', 'kelas', 'Guru tetap tenang saat menghadapi situasi yang tak terkendali misalnya, saat kelas gaduh, ada murid tantrum, dll', NULL, 7, 1, '2026-09-16 01:36:21', NULL),
(8, 'guru_re_lngk_1', 2, 'guru', 'lingkungan', 'Guru menunjukkan sikap tenang, tidak berteriak atau membentak saat ada kegaduhan di jam istirahat', NULL, 8, 1, '2026-09-16 01:36:21', NULL),
(9, 'guru_re_lngk_2', 2, 'guru', 'lingkungan', 'Guru mengingatkan murid dengan kalimat postif saat murid melakukan kesalahan. Misal memecahkan pot, menyerobot antrian di kantin, bermain bola di Lorong kelas dll', NULL, 9, 1, '2026-09-16 01:36:21', NULL),
(10, 'guru_re_lngk_3', 2, 'guru', 'lingkungan', 'Guru memberi arahan dengan tenang (tidak memarahi atau membentak) ketika ada murid yang datang terlambat', NULL, 10, 1, '2026-09-16 01:36:21', NULL),
(11, 'guru_ks_kls_1', 3, 'guru', 'kelas', 'Guru bersikap terbuka dengan jawaban yg berbeda dalam diskusi', NULL, 11, 1, '2026-09-16 01:36:21', NULL),
(12, 'guru_ks_kls_2', 3, 'guru', 'kelas', 'Guru menggunakan Bahasa/istilah yang netral saat memberi contoh atau penyampaian materi (GEDSI)', 'Netral: tidak menggunakan bahasa yang mengasosiasikan kelompok tertentu dengan sifat tertentu, misalnya anak perempuan rajin, anak laki laki nakal', 12, 1, '2026-09-16 01:36:21', NULL),
(13, 'guru_ks_kls_3', 3, 'guru', 'kelas', 'Guru mengatur kelompok secara heterogen (keseimbangan jumlah laki-laki dan perempuan dan atau kemampuan)', NULL, 13, 1, '2026-09-16 01:36:21', NULL),
(14, 'guru_ks_kls_4', 3, 'guru', 'kelas', 'Guru berinteraksi secara merata dengan semua gender siswa, baik perempuan maupun laki-laki', NULL, 14, 1, '2026-09-16 01:36:21', NULL),
(15, 'guru_ks_kls_5', 3, 'guru', 'kelas', 'Guru berinteraksi secara merata ke dengan semua posisi duduk siswa di semua posisi duduk, baik depan, tengah, belakang, kiri dan kanan', NULL, 15, 1, '2026-09-16 01:36:21', NULL),
(16, 'guru_ks_lngk_1', 3, 'guru', 'lingkungan', 'Guru menyapa semua murid tanpa membeda-bedakan status sosial maupun gender jenis kelamin', NULL, 16, 1, '2026-09-16 01:36:21', NULL),
(17, 'guru_kr_kls_1', 4, 'guru', 'kelas', 'Guru memfasilitasi diskusi kelompok dengan aturan komunikasi positif [Menggunakan kata yang sopan, tidak menyela pembicaraan, memberi kesempatan bergiliran untuk berbicara, menghargai perbedaan pendapat]', NULL, 17, 1, '2026-09-16 01:36:21', NULL),
(18, 'guru_kr_kls_2', 4, 'guru', 'kelas', 'Guru membimbing/memberikan contoh/memfasilitasi murid dalam menyelesaikan perbedaan pendapat', NULL, 18, 1, '2026-09-16 01:36:21', NULL),
(19, 'guru_tj_kls_1', 5, 'guru', 'kelas', 'Guru datang tepat waktu dan menyiapkan kelas dengan rapi', NULL, 19, 1, '2026-09-16 01:36:21', NULL),
(20, 'guru_tj_kls_2', 5, 'guru', 'kelas', 'Guru mengingatkan murid untuk menyelesaikan tugas tepat waktu', NULL, 20, 1, '2026-09-16 01:36:21', NULL),
(21, 'guru_tj_kls_3', 5, 'guru', 'kelas', 'Guru mengajak murid bekerjasama dalam menyelesaikan tugas kelompok/diskusi', NULL, 21, 1, '2026-09-16 01:36:21', NULL),
(22, 'guru_tj_kls_4', 5, 'guru', 'kelas', 'Guru memberikan kesempatan pada anak untuk mencoba peran dan tanggung jawab yang berbeda dalam kerja/tugas kelompok', NULL, 22, 1, '2026-09-16 01:36:21', NULL),
(23, 'guru_tj_lngk_1', 5, 'guru', 'lingkungan', 'Guru memberikan contoh untuk ikut menjaga kebersihan lingkungan sekolah. Misalnya membuang sampah pada tempatnya', NULL, 23, 1, '2026-09-16 01:36:21', NULL),
(24, 'guru_tj_lngk_2', 5, 'guru', 'lingkungan', 'Guru menekankan pentingnya menjaga fasilitas sekolah bersama-sama', NULL, 24, 1, '2026-09-16 01:36:21', NULL),
(25, 'guru_tj_lngk_3', 5, 'guru', 'lingkungan', 'Guru mengajak murid ikut serta dalam kegiatan peduli lingkungan', NULL, 25, 1, '2026-09-16 01:36:21', NULL),
(26, 'murid_kd_kls_1', 1, 'murid', 'kelas', 'Murid dapat menyebutkan/menjelaskan perasaannya saat diminta guru', NULL, 26, 1, '2026-09-16 01:36:21', NULL),
(27, 'murid_kd_kls_2', 1, 'murid', 'kelas', 'Murid berani menjawab pertanyaan atau presentasi di depan kelas', NULL, 27, 1, '2026-09-16 01:36:21', NULL),
(28, 'murid_kd_kls_3', 1, 'murid', 'kelas', 'Murid mau mendengarkan pendapat temannya saat diskusi', NULL, 28, 1, '2026-09-16 01:36:21', NULL),
(29, 'murid_kd_lngk_1', 1, 'murid', 'lingkungan', 'Murid mengungkapkan perasaan kepada teman. Misalnya, sedih saat kalah bermain, sakit ketika tak sengaja terdorong teman hingga jatuh, dll', NULL, 29, 1, '2026-09-16 01:36:21', NULL),
(30, 'murid_kd_lngk_2', 1, 'murid', 'lingkungan', 'Murid secara aktif menawarkan diri untuk berkontribusi sesuai kemablennya saat kegiatan di luar jam pelajaran', 'Wawancara guru jika saat observasi tidak ditemukan peristiwa yang mendukung', 30, 1, '2026-09-16 01:36:21', NULL),
(31, 'murid_kd_lngk_3', 1, 'murid', 'lingkungan', 'Murid menyapa guru dengan ramah, atau mengajak teman (termasuk anak disabilitas-jika ada) bermain bersama', NULL, 31, 1, '2026-09-16 01:36:21', NULL),
(32, 'murid_kd_lngk_4', 1, 'murid', 'lingkungan', 'Murid tahu area pribadi yang boleh disentuh – mengingatkan temannya jika tersentuh/disentuh', 'Bisa ditanyakan guru jika tidak ada peristiwa mendukung', 32, 1, '2026-09-16 01:36:21', NULL),
(33, 'murid_re_kls_1', 2, 'murid', 'kelas', 'Murid menggunakan teknik regulasi emosi saat merasa kesulitan', 'Jika saat observasi tidak ada peristiwa yg mendukung, bisa ditanyakan kepada murid dan atau guru', 33, 1, '2026-09-16 01:36:21', NULL),
(34, 'murid_re_kls_2', 2, 'murid', 'kelas', 'Murid tidak langsung menangis atau marah saat gagal menjawab atau kelengkapan menulisnya tidak lengkap', 'Jika tidak ada peristiwa yg mendukung bisa ditanyakan ke guru', 34, 1, '2026-09-16 01:36:21', NULL),
(35, 'murid_re_kls_3', 2, 'murid', 'kelas', 'Murid kembali mengikuti pembelajaran setelah menenangkan diri', 'Bisa ditanyakan guru jika tidak ada peristiwa yang mendukung selama observasi', 35, 1, '2026-09-16 01:36:21', NULL),
(36, 'murid_re_lngk_1', 2, 'murid', 'lingkungan', 'Murid tidak membalas ejekan teman', NULL, 36, 1, '2026-09-16 01:36:21', NULL),
(37, 'murid_re_lngk_2', 2, 'murid', 'lingkungan', 'Murid bersikap positif saat kalah dalam bermain', NULL, 37, 1, '2026-09-16 01:36:21', NULL),
(38, 'murid_ks_kls_1', 3, 'murid', 'kelas', 'Murid mendengarkan pendapat teman tanpa memotong', NULL, 38, 1, '2026-09-16 01:36:21', NULL),
(39, 'murid_ks_kls_2', 3, 'murid', 'kelas', 'Murid menerima pendapat yang berbeda tanpa mengejek atau menertawakannya', NULL, 39, 1, '2026-09-16 01:36:21', NULL),
(40, 'murid_ks_kls_3', 3, 'murid', 'kelas', 'Murid menghibur atau memberi semangat ketika temannya mengalami kesulitan atau sedih', NULL, 40, 1, '2026-09-16 01:36:21', NULL),
(41, 'murid_ks_lngk_1', 3, 'murid', 'lingkungan', 'Murid menenangkan teman yang menangis saat bermain', NULL, 41, 1, '2026-09-16 01:36:21', NULL),
(42, 'murid_ks_lngk_2', 3, 'murid', 'lingkungan', 'Murid mau bermain bersama teman yang berbeda (jenis kelamin, dan kelompok sosial (berbeda ras, suku, agama), termasuk anak dengan disabilitas', NULL, 42, 1, '2026-09-16 01:36:21', NULL),
(43, 'murid_kr_1', 4, 'murid', 'kelas', 'Murid tidak berteriak atau mengejek saat konflik muncul', NULL, 43, 1, '2026-09-16 01:36:21', NULL),
(44, 'murid_kr_2', 4, 'murid', 'kelas', 'Murid meminta maaf saat berselisih dengan temannya', NULL, 44, 1, '2026-09-16 01:36:21', NULL),
(45, 'murid_kr_3', 4, 'murid', 'kelas', 'Murid secara aktif menggunakan 3 kata Ajaib (maaf, terima kasih, dan tolong)', NULL, 45, 1, '2026-09-16 01:36:21', NULL),
(46, 'murid_kr_4', 4, 'murid', 'kelas', 'Murid tidak membalas dorongan fisik/prilaku kekerasan fisik', NULL, 46, 1, '2026-09-16 01:36:21', NULL),
(47, 'murid_kr_5', 4, 'murid', 'kelas', 'Murid bisa berdamai setelah berselisih', NULL, 47, 1, '2026-09-16 01:36:21', NULL),
(48, 'murid_tj_kls_1', 5, 'murid', 'kelas', 'Murid membawa perlengkapan belajar dengan tertib', NULL, 48, 1, '2026-09-16 01:36:21', NULL),
(49, 'murid_tj_kls_2', 5, 'murid', 'kelas', 'Murid mengumpulkan tugas tepat waktu', NULL, 49, 1, '2026-09-16 01:36:21', NULL),
(50, 'murid_tj_kls_3', 5, 'murid', 'kelas', 'Murid membantu teman yang kesulitan', NULL, 50, 1, '2026-09-16 01:36:21', NULL),
(51, 'murid_tj_kls_4', 5, 'murid', 'kelas', 'Murid merapikan meja dan kursi setelah pembelajaran', NULL, 51, 1, '2026-09-16 01:36:21', NULL),
(52, 'murid_tj_kls_5', 5, 'murid', 'kelas', 'Murid menggunakan seragam sesuai dan rapi', NULL, 52, 1, '2026-09-16 01:36:21', NULL),
(53, 'murid_tj_lngk_1', 5, 'murid', 'lingkungan', 'Murid bisa mengatur diri sendiri untuk menaati aturan waktu istirahat dan masuk ke kelas tanpa diingatkan guru', NULL, 53, 1, '2026-09-16 01:36:21', NULL),
(54, 'murid_tj_lngk_2', 5, 'murid', 'lingkungan', 'Murid menghormati area tubuh teman yang boleh di sentuh dan tidak', NULL, 54, 1, '2026-09-16 01:36:21', NULL),
(55, 'murid_tj_lngk_3', 5, 'murid', 'lingkungan', 'Murid menggunakan Bahasa positif ketika berbicara dan bermain bersama teman', NULL, 55, 1, '2026-09-16 01:36:21', NULL),
(56, 'murid_tj_lngk_4', 5, 'murid', 'lingkungan', 'Murid mengingatkan ketika ada teman yang menggunakan bahasa yang negatif atau yang bisa membuat orang lain tidak nyaman', NULL, 56, 1, '2026-09-16 01:36:21', NULL),
(57, 'murid_tj_lngk_5', 5, 'murid', 'lingkungan', 'Murid menaati kesepakatan kelas dan aturan sekolah', NULL, 57, 1, '2026-09-16 01:36:21', NULL),
(58, 'murid_tj_lngk_6', 5, 'murid', 'lingkungan', 'Murid menjaga lingkungan sekolah seperti: membuang sampah pada tempatnya, memelihara tanaman kelas dll', NULL, 58, 1, '2026-09-16 01:36:21', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sel_jawaban_observasi`
--

CREATE TABLE `sel_jawaban_observasi` (
  `id` bigint NOT NULL,
  `sesi_id` int NOT NULL COMMENT 'FK ke sel_sesi_observasi.id',
  `indikator_id` int NOT NULL COMMENT 'FK ke sel_indikator.id',
  `skor` tinyint DEFAULT NULL COMMENT 'Skor observasi: NULL=tidak bisa diamati, 1=Tidak Terlihat, 2=Kadang, 3=Sering, 4=Konsisten',
  `catatan` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Catatan temuan observer untuk indikator ini',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sel_konteks_options`
--

CREATE TABLE `sel_konteks_options` (
  `id` int NOT NULL,
  `kategori` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'lokasi, waktu, jangkauan',
  `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `urutan` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sel_konteks_options`
--

INSERT INTO `sel_konteks_options` (`id`, `kategori`, `label`, `value_code`, `urutan`, `is_active`, `created_at`) VALUES
(1, 'lokasi', 'Ruang Kelas', 'Ruang Kelas', 1, 1, '2026-09-12 02:20:28'),
(2, 'lokasi', 'Halaman / Lapangan Sekolah', 'Halaman / Lapangan Sekolah', 2, 1, '2026-09-12 02:20:28'),
(3, 'lokasi', 'Kantin / Area Istirahat', 'Kantin / Area Istirahat', 3, 1, '2026-09-12 02:20:28'),
(4, 'lokasi', 'Perpustakaan / Laboratorium', 'Perpustakaan / Laboratorium', 4, 1, '2026-09-12 02:20:28'),
(5, 'lokasi', 'Kegiatan Ekstrakurikuler', 'Kegiatan Ekstrakurikuler', 5, 1, '2026-09-12 02:20:28'),
(6, 'waktu', 'Jam Pelajaran / Kegiatan Belajar', 'Jam Pelajaran / Kegiatan Belajar', 1, 1, '2026-09-12 02:20:28'),
(7, 'waktu', 'Jam Istirahat', 'Jam Istirahat', 2, 1, '2026-09-12 02:20:28'),
(8, 'waktu', 'Sebelum / Sesudah Jam Sekolah', 'Sebelum / Sesudah Jam Sekolah', 3, 1, '2026-09-12 02:20:28'),
(9, 'waktu', 'Kegiatan Khusus / Upacara', 'Kegiatan Khusus / Upacara', 4, 1, '2026-09-12 02:20:28'),
(10, 'jangkauan', 'Menjangkau seluruh siswa', 'Menjangkau seluruh siswa', 1, 1, '2026-09-12 02:20:28'),
(11, 'jangkauan', 'Menjangkau lebih dari separuh siswa', 'Menjangkau lebih dari separuh siswa', 2, 1, '2026-09-12 02:20:28'),
(12, 'jangkauan', 'Menjangkau kurang separuh siswa', 'Menjangkau kurang separuh siswa', 3, 1, '2026-09-12 02:20:28'),
(13, 'jangkauan', 'Hanya sebagian kecil siswa (jika memungkinkan sertakan jumlah, jika memilih ini)', 'Hanya sebagian kecil siswa (jika memungkinkan sertakan jumlah, jika memilih ini)', 4, 1),
(14, 'mapel', 'Tematik', 'Tematik', 1, 1, '2026-09-12 02:24:05'),
(15, 'mapel', 'Bahasa Indonesia', 'Bahasa Indonesia', 2, 1, '2026-09-12 02:24:05'),
(16, 'mapel', 'Matematika', 'Matematika', 3, 1, '2026-09-12 02:24:05'),
(17, 'mapel', 'IPA (Ilmu Pengetahuan Alam)', 'IPA', 4, 1, '2026-09-12 02:24:05'),
(18, 'mapel', 'IPS (Ilmu Pengetahuan Sosial)', 'IPS', 5, 1, '2026-09-12 02:24:05'),
(19, 'mapel', 'PJOK / Olahraga', 'PJOK', 6, 1, '2026-09-12 02:24:05'),
(20, 'mapel', 'Pendidikan Agama', 'PAI', 7, 1, '2026-09-12 02:24:05'),
(21, 'mapel', 'Seni Budaya & Prakarya', 'SBdP', 8, 1, '2026-09-12 02:24:05');

-- --------------------------------------------------------

--
-- Table structure for table `sel_sesi_observasi`
--

CREATE TABLE `sel_sesi_observasi` (
  `id` int NOT NULL,
  `sekolah_id` int NOT NULL COMMENT 'FK ke satuan_pendidikan.id — sekolah yang diobservasi',
  `observer_user_id` int DEFAULT NULL COMMENT 'FK ke users.id — observer yang melakukan pengamatan',
  `observer_nama` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama/inisial observer (input manual jika bukan user terdaftar)',
  `tanggal` date NOT NULL COMMENT 'Tanggal pelaksanaan observasi',
  `lokasi_diamati` json DEFAULT NULL COMMENT 'Array lokasi: ["Ruang kelas","Halaman","Kantin"]',
  `waktu_pengamatan` json DEFAULT NULL COMMENT 'Array waktu: ["Istirahat","Sebelum masuk"]',
  `jumlah_siswa_l` int DEFAULT '0' COMMENT 'Jumlah siswa laki-laki di sekolah',
  `jumlah_siswa_p` int DEFAULT '0' COMMENT 'Jumlah siswa perempuan di sekolah',
  `siswa_disabilitas_l` int DEFAULT '0' COMMENT 'Jumlah siswa disabilitas laki-laki',
  `siswa_disabilitas_p` int DEFAULT '0' COMMENT 'Jumlah siswa disabilitas perempuan',
  `jangkauan_siswa` tinyint NOT NULL DEFAULT '2' COMMENT '1=seluruh siswa, 2=lebih separuh, 3=kurang separuh, 4=sebagian kecil',
  `jumlah_siswa_sebagian_kecil` int DEFAULT NULL,
  `kelas_diamati` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Kelas yang diamati, e.g. 4A, 5B',
  `guru_inisial` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Inisial guru yang mengajar saat observasi',
  `guru_jk` enum('L','P') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Jenis kelamin guru yang diamati',
  `mata_pelajaran` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Mata pelajaran saat observasi (Tematik, Matematika, dll)',
  `status` enum('draft','submitted','reviewed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft' COMMENT 'Status sesi: draft (belum selesai), submitted (sudah dikirim), reviewed (sudah direview admin)',
  `reviewed_by` int DEFAULT NULL COMMENT 'FK ke users.id — admin yang mereview',
  `submitted_at` timestamp NULL DEFAULT NULL COMMENT 'Timestamp saat sesi dikirim (submit)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suara_responden`
--

CREATE TABLE `suara_responden` (
  `id` int NOT NULL,
  `sekolah_id` int NOT NULL COMMENT 'FK ke satuan_pendidikan.id',
  `responden_id` int DEFAULT NULL COMMENT 'FK ke responden_survey.id (opsional)',
  `modul_id` int DEFAULT NULL COMMENT 'FK ke modul_bsan.id — modul yang dikomentari',
  `komentar` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Isi narasi/komentar/suara dari responden',
  `sentimen` enum('positif','negatif','netral') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'netral' COMMENT 'Klasifikasi sentimen komentar',
  `tanggal` date DEFAULT NULL COMMENT 'Tanggal komentar ditulis',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Komentar narasi dan suara responden — halaman Suara Responden (Fase 2: + word cloud)';

-- --------------------------------------------------------

--
-- Table structure for table `survey_sections`
--

CREATE TABLE `survey_sections` (
  `id` int NOT NULL,
  `section_key` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `urutan` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `survey_sections`
--

INSERT INTO `survey_sections` (`id`, `section_key`, `title`, `description`, `urutan`, `is_active`, `created_at`) VALUES
(1, 'identitas', 'Identitas Responden', 'Kelola struktur pertanyaan, tipe isian (Esai/Pilihan), dan status kewajiban instrumen survei.', 1, 1, '2026-09-12 08:19:22'),
(2, 'pelatihan', 'Pelatihan & Implementasi', 'Identifikasi pelatihan & tingkat adopsi BSAN', 2, 1, '2026-09-12 08:19:22'),
(3, 'implementasi_awal', 'Implementasi Modul Kelas Awal', 'Evaluasi bagian mudah/sulit & media ajar kelas 1-3', 3, 1, '2026-09-12 08:19:22'),
(4, 'implementasi_tinggi', 'Implementasi Modul Kelas Tinggi', 'Evaluasi bagian mudah/sulit & media ajar kelas 4-6', 4, 1, '2026-09-12 08:19:22'),
(5, 'kepsek', 'Dukungan Kepala Sekolah', 'Dukungan manajemen & program sekolah', 5, 1, '2026-09-12 08:19:22'),
(6, 'refleksi', 'Refleksi & Perubahan Baik', 'Refleksi bersama murid, guru & cerita narasi', 6, 1, '2026-09-12 08:19:22'),
(7, 'kontak', 'Kontak Responden', 'Nomor WhatsApp responden untuk klarifikasi', 7, 1, '2026-09-12 08:19:22'),
(15, 'tes', 'tes', 'tes', 8, 0, '2026-09-12 08:24:53');

-- --------------------------------------------------------

--
-- Table structure for table `tantangan_implementasi`
--

CREATE TABLE `tantangan_implementasi` (
  `id` int NOT NULL,
  `sekolah_id` int NOT NULL COMMENT 'FK ke satuan_pendidikan.id',
  `responden_id` int DEFAULT NULL COMMENT 'FK ke responden_survey.id — sumber data tantangan',
  `kategori` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Kategori kendala: Keterbatasan Perangkat Digital, Jaringan Internet, dll',
  `deskripsi` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Deskripsi detail tantangan',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Data kendala/tantangan implementasi BSAN yang dilaporkan sekolah';

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `nama` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nama lengkap pengguna',
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Email login — unik per user',
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Password di-hash dengan bcrypt (min 10 rounds)',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nomor WhatsApp/telepon',
  `role` enum('admin','pengawas','sekolah') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'sekolah',
  `sekolah_id` int DEFAULT NULL COMMENT 'FK ke satuan_pendidikan.id — hanya untuk role operator_sekolah',
  `kabupaten_id` int DEFAULT NULL COMMENT 'FK ke kabupaten.id — hanya untuk role admin_kabupaten',
  `kecamatan_id` int DEFAULT NULL COMMENT 'FK ke kecamatan.id — hanya untuk role admin_kecamatan',
  `jabatan` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Jabatan/posisi di instansi',
  `instansi` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nama instansi/organisasi',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'FALSE = akun dinonaktifkan (soft delete)',
  `last_login` timestamp NULL DEFAULT NULL COMMENT 'Timestamp login terakhir',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master data pengguna sistem dengan role-based access control (RBAC)';

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nama`, `email`, `password_hash`, `phone`, `role`, `sekolah_id`, `kabupaten_id`, `kecamatan_id`, `jabatan`, `instansi`, `is_active`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Administrator BSAN', 'admin@survasi.com', '$2b$10$hgZg.hWGG4vWgfR2yjKvYOZRZfGdk5emzlguhtOYMZpoeC8oJeD5K', NULL, 'admin', NULL, NULL, NULL, 'Administrator Sistem Monitoring BSAN', 'Survasi.com / Dinas Pendidikan Jawa Timur', 1, '2026-09-16 01:45:53', '2026-09-10 05:42:46', '2026-09-16 01:45:53', NULL),
(2, 'Demo Pengawas', 'pengawas@survasi.com', '$2b$10$fntRNPJQytVXno/GG224Fu3RIA5eZdQyJ10i.dDQ2rwhEu7QyOzp6', NULL, 'pengawas', NULL, NULL, NULL, 'Pengawas Sekolah / Penilik', 'Dinas Pendidikan Kab. Sidoarjo', 1, '2026-09-16 01:45:16', '2026-09-10 05:42:46', '2026-09-16 01:45:16', NULL),
(1243, 'Testing Pengawas', 'pengawas@gmail.com', '$2a$10$ZBuPq0ewbhAoV8IVV7myA.rs4ynDcApuWRxvw2k27t1uIoo89YuNC', NULL, 'pengawas', NULL, NULL, NULL, NULL, 'Pengawas Sekolah', 1, NULL, '2026-09-11 18:52:29', '2026-09-11 18:52:29', NULL),
(1252, 'Test User Survasi', 'izukazumi2@gmail.com', '$2a$10$OXJv3scvHQnRh2No/2pexes8z8QbYANQMlGW5KLDpjjUiPVg.SO8y', NULL, 'sekolah', 1, 1, 1, NULL, 'SD AR RAHMAH PEPELEGI', 1, NULL, '2026-09-12 10:44:23', '2026-09-12 10:44:23', NULL),
(1253, 'fakun7507@gmail.com', 'fakun7507@gmail.com', '$2a$12$GkwLFcov8nmTEzQtsVXuWe.igz89WLfG.jzbb6/YC7XTdDsaMB4LC', NULL, 'sekolah', 77, 1, 1, NULL, 'SD AL FALAH ASSALAM', 1, NULL, '2026-09-12 10:45:00', '2026-09-12 10:47:07', NULL),
(1254, 'Irfan', 'marifirfannn@gmail.com', '$2a$10$PC4yfKAre0PPAbmebuONyOTYZP0nOd1PKSWMunheeqMndM9FyFYhq', NULL, 'sekolah', 544, 1, 7, NULL, 'SD ISLAM SARI BUMI', 1, '2026-09-16 00:48:45', '2026-09-13 09:10:29', '2026-09-16 00:48:45', NULL),
(1255, 'Syaifuddin', 'udinsaif@gmail.com', '$2a$10$ZIYg40L7zLsIK.XsdHujIeUTpJULPOF5qGsBWkYUYjzcgq/v62.q6', NULL, 'pengawas', NULL, NULL, NULL, NULL, 'Pengawas Sekolah', 1, '2026-09-15 17:05:12', '2026-09-14 05:47:03', '2026-09-15 17:05:12', NULL),
(1256, 'Triyana', 'annadamay@gmail.com', '$2a$10$WXKjdPK22rFfq6N3iTIutejyoY0a1BtGZXievQNCSZiJwO.ur3bKm', NULL, 'pengawas', NULL, NULL, NULL, NULL, 'SD DARUL ULUM', 1, NULL, '2026-09-14 06:43:56', '2026-09-15 17:28:02', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_preferences`
--

CREATE TABLE `user_preferences` (
  `id` int NOT NULL,
  `user_id` int NOT NULL COMMENT 'FK ke users.id — 1:1 relation',
  `bahasa` enum('id','en') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'id' COMMENT 'Bahasa pengantar dashboard',
  `tema` enum('light','dark') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'light' COMMENT 'Tema tampilan dashboard',
  `auto_save_interval` int NOT NULL DEFAULT '30' COMMENT 'Interval auto-save draft dalam detik (10-120)',
  `notif_weekly_report` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Kirim email rekapitulasi mingguan',
  `notif_instant_alert` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Notifikasi instan saat sekolah selesai mengisi',
  `notif_reminder_email` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Kirim reminder otomatis ke sekolah belum mengisi',
  `notif_system_update` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Berita update fitur & aplikasi',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_preferences`
--

INSERT INTO `user_preferences` (`id`, `user_id`, `bahasa`, `tema`, `auto_save_interval`, `notif_weekly_report`, `notif_instant_alert`, `notif_reminder_email`, `notif_system_update`, `updated_at`) VALUES
(1, 1, 'id', 'light', 30, 1, 1, 0, 1, '2026-09-10 05:42:46'),
(2, 2, 'id', 'light', 30, 1, 1, 0, 1, '2026-09-10 05:42:46'),
(1243, 1243, 'id', 'light', 30, 1, 1, 0, 1, '2026-09-11 18:52:29'),
(1255, 1252, 'id', 'light', 30, 1, 1, 0, 1, '2026-09-12 10:44:23'),
(1256, 1253, 'id', 'light', 30, 1, 1, 0, 1, '2026-09-12 10:45:00'),
(1257, 1254, 'id', 'light', 30, 1, 1, 0, 1, '2026-09-13 09:10:29'),
(1258, 1255, 'id', 'light', 30, 1, 1, 0, 1, '2026-09-14 05:47:03'),
(1259, 1256, 'id', 'light', 30, 1, 1, 0, 1, '2026-09-14 06:43:56');

-- --------------------------------------------------------

--
-- Table structure for table `v_kecamatan_stats`
--

CREATE TABLE `v_kecamatan_stats` (
  `kecamatan_id` int DEFAULT NULL,
  `kecamatan` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `kabupaten_id` int DEFAULT NULL,
  `kabupaten` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `total_sekolah` bigint DEFAULT NULL,
  `belum` decimal(23,0) DEFAULT NULL,
  `sebagian` decimal(23,0) DEFAULT NULL,
  `sudah` decimal(23,0) DEFAULT NULL,
  `response_rate` decimal(28,1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `v_sel_sesi_scores`
--

CREATE TABLE `v_sel_sesi_scores` (
  `sesi_id` int DEFAULT NULL,
  `sekolah` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `kecamatan` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `kabupaten` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `status` enum('draft','submitted','reviewed') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `skor_guru` decimal(6,2) DEFAULT NULL,
  `skor_murid` decimal(6,2) DEFAULT NULL,
  `skor_total` decimal(6,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_log_user` (`user_id`),
  ADD KEY `idx_log_aksi` (`aksi`),
  ADD KEY `idx_log_created` (`created_at`),
  ADD KEY `idx_log_target` (`target_tabel`,`target_id`);

--
-- Indexes for table `alur_tema`
--
ALTER TABLE `alur_tema`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_alur_modul` (`modul_id`),
  ADD KEY `idx_alur_target` (`target_kelas`);

--
-- Indexes for table `bsan_frameworks`
--
ALTER TABLE `bsan_frameworks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `framework_key` (`framework_key`);

--
-- Indexes for table `jawaban_survey`
--
ALTER TABLE `jawaban_survey`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_jawaban_resp_pert` (`responden_id`,`pertanyaan_id`) COMMENT 'Satu responden hanya bisa menjawab satu pertanyaan sekali',
  ADD KEY `idx_jawaban_responden` (`responden_id`),
  ADD KEY `idx_jawaban_pertanyaan` (`pertanyaan_id`);

--
-- Indexes for table `kabupaten`
--
ALTER TABLE `kabupaten`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_bps` (`kode_bps`),
  ADD KEY `idx_kab_provinsi` (`provinsi_id`),
  ADD KEY `idx_kab_nama` (`nama`);

--
-- Indexes for table `kecamatan`
--
ALTER TABLE `kecamatan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_bps` (`kode_bps`),
  ADD KEY `idx_kec_kabupaten` (`kabupaten_id`),
  ADD KEY `idx_kec_nama` (`nama`);

--
-- Indexes for table `laporan_export`
--
ALTER TABLE `laporan_export`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_export_user` (`user_id`),
  ADD KEY `idx_export_status` (`status`);

--
-- Indexes for table `modul_bsan`
--
ALTER TABLE `modul_bsan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode` (`kode`),
  ADD KEY `idx_modul_urutan` (`urutan`);

--
-- Indexes for table `notifikasi`
--
ALTER TABLE `notifikasi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notif_user` (`user_id`),
  ADD KEY `idx_notif_read` (`user_id`,`is_read`) COMMENT 'Composite index untuk query notif belum dibaca per user',
  ADD KEY `idx_notif_tipe` (`tipe`);

--
-- Indexes for table `pertanyaan_survey`
--
ALTER TABLE `pertanyaan_survey`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pertanyaan_modul` (`modul_id`),
  ADD KEY `idx_pertanyaan_urutan` (`urutan`),
  ADD KEY `idx_pertanyaan_section` (`section`);

--
-- Indexes for table `provinsi`
--
ALTER TABLE `provinsi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_bps` (`kode_bps`),
  ADD KEY `idx_provinsi_nama` (`nama`);

--
-- Indexes for table `responden_survey`
--
ALTER TABLE `responden_survey`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_resp_sekolah` (`sekolah_id`),
  ADD KEY `idx_resp_kabupaten` (`kabupaten_id`),
  ADD KEY `idx_resp_kecamatan` (`kecamatan_id`),
  ADD KEY `idx_resp_penerima` (`penerima_modul`),
  ADD KEY `idx_resp_implementasi` (`status_implementasi`);
ALTER TABLE `responden_survey` ADD FULLTEXT KEY `idx_resp_search` (`nama`,`npsn`) COMMENT 'Full-text search untuk pencarian responden';

--
-- Indexes for table `satuan_pendidikan`
--
ALTER TABLE `satuan_pendidikan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `npsn` (`npsn`),
  ADD KEY `idx_sp_kecamatan` (`kecamatan_id`),
  ADD KEY `idx_sp_status` (`status_pengisian`),
  ADD KEY `idx_sp_jenjang` (`jenjang`),
  ADD KEY `idx_sp_nama` (`nama`),
  ADD KEY `idx_sp_perf` (`kecamatan_id`,`nama`);
ALTER TABLE `satuan_pendidikan` ADD FULLTEXT KEY `idx_sp_search` (`nama`,`npsn`) COMMENT 'Full-text search untuk pencarian cepat sekolah by nama/NPSN';

--
-- Indexes for table `sel_dimensi`
--
ALTER TABLE `sel_dimensi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode` (`kode`),
  ADD KEY `idx_seldim_modul` (`modul_bsan_kode`);

--
-- Indexes for table `sel_indikator`
--
ALTER TABLE `sel_indikator`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode` (`kode`),
  ADD KEY `idx_selind_dimensi` (`dimensi_id`),
  ADD KEY `idx_selind_subjek` (`subjek`),
  ADD KEY `idx_selind_konteks` (`konteks`);

--
-- Indexes for table `sel_jawaban_observasi`
--
ALTER TABLE `sel_jawaban_observasi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_seljawab` (`sesi_id`,`indikator_id`) COMMENT 'Satu sesi hanya menilai satu indikator sekali',
  ADD KEY `idx_seljawab_sesi` (`sesi_id`),
  ADD KEY `idx_seljawab_indikator` (`indikator_id`);

--
-- Indexes for table `sel_konteks_options`
--
ALTER TABLE `sel_konteks_options`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sel_sesi_observasi`
--
ALTER TABLE `sel_sesi_observasi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_selobs_sekolah` (`sekolah_id`),
  ADD KEY `idx_selobs_tanggal` (`tanggal`),
  ADD KEY `idx_selobs_status` (`status`),
  ADD KEY `idx_selobs_observer` (`observer_user_id`),
  ADD KEY `fk_selobs_reviewer` (`reviewed_by`);

--
-- Indexes for table `suara_responden`
--
ALTER TABLE `suara_responden`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_suara_sekolah` (`sekolah_id`),
  ADD KEY `idx_suara_sentimen` (`sentimen`),
  ADD KEY `idx_suara_modul` (`modul_id`),
  ADD KEY `fk_suara_responden` (`responden_id`);

--
-- Indexes for table `survey_sections`
--
ALTER TABLE `survey_sections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `section_key` (`section_key`);

--
-- Indexes for table `tantangan_implementasi`
--
ALTER TABLE `tantangan_implementasi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tantangan_sekolah` (`sekolah_id`),
  ADD KEY `idx_tantangan_kategori` (`kategori`),
  ADD KEY `fk_tantangan_responden` (`responden_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_sekolah` (`sekolah_id`),
  ADD KEY `idx_users_kabupaten` (`kabupaten_id`),
  ADD KEY `fk_users_kecamatan` (`kecamatan_id`),
  ADD KEY `idx_users_perf` (`role`,`is_active`,`created_at` DESC);

--
-- Indexes for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `alur_tema`
--
ALTER TABLE `alur_tema`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `bsan_frameworks`
--
ALTER TABLE `bsan_frameworks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `jawaban_survey`
--
ALTER TABLE `jawaban_survey`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `kabupaten`
--
ALTER TABLE `kabupaten`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `kecamatan`
--
ALTER TABLE `kecamatan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `laporan_export`
--
ALTER TABLE `laporan_export`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `modul_bsan`
--
ALTER TABLE `modul_bsan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `notifikasi`
--
ALTER TABLE `notifikasi`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `pertanyaan_survey`
--
ALTER TABLE `pertanyaan_survey`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `provinsi`
--
ALTER TABLE `provinsi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `responden_survey`
--
ALTER TABLE `responden_survey`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `satuan_pendidikan`
--
ALTER TABLE `satuan_pendidikan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1239;

--
-- AUTO_INCREMENT for table `sel_dimensi`
--
ALTER TABLE `sel_dimensi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `sel_indikator`
--
ALTER TABLE `sel_indikator`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `sel_jawaban_observasi`
--
ALTER TABLE `sel_jawaban_observasi`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sel_konteks_options`
--
ALTER TABLE `sel_konteks_options`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `sel_sesi_observasi`
--
ALTER TABLE `sel_sesi_observasi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `suara_responden`
--
ALTER TABLE `suara_responden`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `survey_sections`
--
ALTER TABLE `survey_sections`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `tantangan_implementasi`
--
ALTER TABLE `tantangan_implementasi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1257;

--
-- AUTO_INCREMENT for table `user_preferences`
--
ALTER TABLE `user_preferences`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1260;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
