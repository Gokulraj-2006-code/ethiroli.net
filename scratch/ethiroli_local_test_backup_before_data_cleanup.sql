-- MySQL dump 10.13  Distrib 26.7.0, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: ethiroli_local_test
-- ------------------------------------------------------
-- Server version	26.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'df9755df-d2f5-11f1-be95-fed944c71b31:1-2013';

--
-- Table structure for table `account_invitations`
--

DROP TABLE IF EXISTS `account_invitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_invitations` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_hash` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `consumed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_invitation_token_hash` (`token_hash`),
  KEY `idx_invitation_user_expiry` (`user_id`,`expires_at`,`consumed_at`),
  CONSTRAINT `fk_invitation_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_invitations`
--

LOCK TABLES `account_invitations` WRITE;
/*!40000 ALTER TABLE `account_invitations` DISABLE KEYS */;
/*!40000 ALTER TABLE `account_invitations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_feeds`
--

DROP TABLE IF EXISTS `activity_feeds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_feeds` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actor_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payload` json DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `actor_id` (`actor_id`),
  CONSTRAINT `activity_feeds_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activity_feeds_ibfk_2` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_feeds`
--

LOCK TABLES `activity_feeds` WRITE;
/*!40000 ALTER TABLE `activity_feeds` DISABLE KEYS */;
INSERT INTO `activity_feeds` VALUES ('41c4ae5b-d365-11f1-83f3-559b0b62ccd9','922767e5-1d3b-4695-a444-db92f82057b3','922767e5-1d3b-4695-a444-db92f82057b3','ATTENDANCE_PUNCH_IN','Attendance',NULL,'{\"at\": \"2026-10-29T06:52:07.372Z\", \"work_date\": \"2026-10-29\"}',0,'2026-10-29 06:52:07'),('4323650d-d365-11f1-83f3-559b0b62ccd9','922767e5-1d3b-4695-a444-db92f82057b3','922767e5-1d3b-4695-a444-db92f82057b3','ATTENDANCE_PUNCH_OUT','Attendance',NULL,'{\"at\": \"2026-10-29T06:52:09.672Z\", \"work_date\": \"2026-10-29\", \"worked_hours\": 0}',0,'2026-10-29 06:52:09'),('499606bd-d2fa-11f1-8dda-52177c28573a','f89fa77e-a263-46df-b40c-32ba3f14738e','44f55fc2-753e-4d9b-b9d5-2ff1e0f994dc','LEAVE_APPROVED','Leave','91c56aab-563d-4df9-95f0-3bba2ae84443','{\"reason\": \"Isolated API workflow verification\", \"status\": \"APPROVED\", \"message\": \"Your CASUAL request for 2030-02-10 to 2030-02-10 was approved by HR Integration Fixture.\", \"end_date\": \"2030-02-10\", \"leave_type\": \"CASUAL\", \"start_date\": \"2030-02-10\", \"review_note\": \"Approved during isolated local integration check\", \"reviewed_at\": \"2026-10-28T18:06:24.341Z\", \"reviewed_by_name\": \"HR Integration Fixture\", \"reviewed_by_role\": \"HR\"}',0,'2026-10-28 18:06:24'),('53b96a8e-d365-11f1-83f3-559b0b62ccd9','922767e5-1d3b-4695-a444-db92f82057b3','922767e5-1d3b-4695-a444-db92f82057b3','ATTENDANCE_PUNCH_IN','Attendance',NULL,'{\"at\": \"2026-10-29T06:52:37.500Z\", \"work_date\": \"2026-10-29\"}',0,'2026-10-29 06:52:37'),('54c41d7b-d365-11f1-83f3-559b0b62ccd9','922767e5-1d3b-4695-a444-db92f82057b3','922767e5-1d3b-4695-a444-db92f82057b3','ATTENDANCE_PUNCH_OUT','Attendance',NULL,'{\"at\": \"2026-10-29T06:52:39.247Z\", \"work_date\": \"2026-10-29\", \"worked_hours\": 0}',0,'2026-10-29 06:52:39'),('8b3b8c72-d2fa-11f1-8dda-52177c28573a','f89fa77e-a263-46df-b40c-32ba3f14738e','44f55fc2-753e-4d9b-b9d5-2ff1e0f994dc','LEAVE_APPROVED','Leave','e0fce45a-a213-42ba-9876-146f7ac179ac','{\"reason\": \"Calendar migration integration verification\", \"status\": \"APPROVED\", \"message\": \"Your CASUAL request for 2030-02-11 to 2030-02-11 was approved by HR Integration Fixture.\", \"end_date\": \"2030-02-11\", \"leave_type\": \"CASUAL\", \"start_date\": \"2030-02-11\", \"review_note\": \"Verified against isolated calendar schema\", \"reviewed_at\": \"2026-10-28T18:08:14.477Z\", \"reviewed_by_name\": \"HR Integration Fixture\", \"reviewed_by_role\": \"HR\"}',0,'2026-10-28 18:08:14'),('a5a181a1-d36f-11f1-83f3-559b0b62ccd9','922767e5-1d3b-4695-a444-db92f82057b3','922767e5-1d3b-4695-a444-db92f82057b3','ATTENDANCE_PUNCH_IN','Attendance',NULL,'{\"at\": \"2026-10-29T08:06:29.881Z\", \"work_date\": \"2026-10-29\"}',0,'2026-10-29 08:06:29'),('a670c4bd-d365-11f1-83f3-559b0b62ccd9','a80f8109-e4bd-4f7c-a712-5f76f276deec','a80f8109-e4bd-4f7c-a712-5f76f276deec','ATTENDANCE_PUNCH_IN','Attendance',NULL,'{\"at\": \"2026-10-29T06:54:56.275Z\", \"work_date\": \"2026-10-29\"}',0,'2026-10-29 06:54:56'),('ded0dc3a-d35e-11f1-83f3-559b0b62ccd9','684b5dce-8c09-4128-b8eb-1e25bb2207ac','684b5dce-8c09-4128-b8eb-1e25bb2207ac','ATTENDANCE_PUNCH_IN','Attendance',NULL,'{\"at\": \"2026-10-29T06:06:24.380Z\", \"work_date\": \"2026-10-29\"}',0,'2026-10-29 06:06:24');
/*!40000 ALTER TABLE `activity_feeds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `anomaly_logs`
--

DROP TABLE IF EXISTS `anomaly_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anomaly_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `anomaly_type` enum('IMPOSSIBLE_TRAVEL','BRUTE_FORCE','RAPID_DATA_ACCESS','SUSPICIOUS_IP') COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` enum('LOW','MEDIUM','HIGH','CRITICAL') COLLATE utf8mb4_unicode_ci DEFAULT 'MEDIUM',
  `details` json NOT NULL,
  `is_resolved` tinyint(1) DEFAULT '0',
  `resolved_at` datetime DEFAULT NULL,
  `resolved_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `resolved_by` (`resolved_by`),
  KEY `idx_tenant` (`tenant_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_severity` (`severity`),
  CONSTRAINT `anomaly_logs_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `anomaly_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `anomaly_logs_ibfk_3` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anomaly_logs`
--

LOCK TABLES `anomaly_logs` WRITE;
/*!40000 ALTER TABLE `anomaly_logs` DISABLE KEYS */;
INSERT INTO `anomaly_logs` VALUES (1,'368f5c88-12cd-11ed-861d-0242ac120002','368f5c88-12cd-11ed-861d-0242ac120002','IMPOSSIBLE_TRAVEL','CRITICAL','{\"to\": \"San Francisco\", \"from\": \"Delhi\", \"hours_difference\": 0.5}',0,NULL,NULL,'2026-10-29 07:10:38');
/*!40000 ALTER TABLE `anomaly_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `api_keys`
--

DROP TABLE IF EXISTS `api_keys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_keys` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `api_key` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `api_secret` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `scopes` json DEFAULT NULL,
  `rate_limit_per_minute` int DEFAULT '60',
  `expires_at` datetime DEFAULT NULL,
  `last_used_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `api_key` (`api_key`),
  KEY `user_id` (`user_id`),
  KEY `idx_api_key` (`api_key`),
  KEY `idx_tenant` (`tenant_id`),
  CONSTRAINT `api_keys_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `api_keys_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_keys`
--

LOCK TABLES `api_keys` WRITE;
/*!40000 ALTER TABLE `api_keys` DISABLE KEYS */;
INSERT INTO `api_keys` VALUES ('ee897c9e-f1a1-4bf9-88da-0553a468e51d','46f13687-ec4b-468e-b8cf-c6803c0f8792','368f5c88-12cd-11ed-861d-0242ac120002','Webhook Ingestion key','cbe-key-1793257837746','api-secret-bytes-token-enc-value','[\"read:leads\"]',60,NULL,NULL,1,'2026-10-29 07:10:37','2026-10-29 07:10:37');
/*!40000 ALTER TABLE `api_keys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_status_history`
--

DROP TABLE IF EXISTS `application_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application_status_history` (
  `history_id` int NOT NULL AUTO_INCREMENT,
  `application_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_id` int NOT NULL,
  `changed_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `change_notes` text COLLATE utf8mb4_unicode_ci,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `status_id` (`status_id`),
  KEY `changed_by` (`changed_by`),
  KEY `idx_application` (`application_id`),
  KEY `idx_changed_at` (`changed_at`),
  CONSTRAINT `application_status_history_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `application_status_history_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `application_statuses` (`status_id`) ON DELETE CASCADE,
  CONSTRAINT `application_status_history_ibfk_3` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_status_history`
--

LOCK TABLES `application_status_history` WRITE;
/*!40000 ALTER TABLE `application_status_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `application_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_statuses`
--

DROP TABLE IF EXISTS `application_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application_statuses` (
  `status_id` int NOT NULL AUTO_INCREMENT,
  `status_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `is_final` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`status_id`),
  UNIQUE KEY `status_name` (`status_name`),
  UNIQUE KEY `status_code` (`status_code`),
  CONSTRAINT `application_statuses_chk_1` CHECK ((`display_order` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_statuses`
--

LOCK TABLES `application_statuses` WRITE;
/*!40000 ALTER TABLE `application_statuses` DISABLE KEYS */;
/*!40000 ALTER TABLE `application_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `candidate_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `job_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_id` int DEFAULT NULL,
  `cover_letter` text COLLATE utf8mb4_unicode_ci,
  `applied_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_candidate` (`candidate_id`),
  KEY `idx_job` (`job_id`),
  KEY `idx_status` (`status_id`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `applications_ibfk_3` FOREIGN KEY (`status_id`) REFERENCES `application_statuses` (`status_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `approval_chains`
--

DROP TABLE IF EXISTS `approval_chains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approval_chains` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `workflow_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `step_order` int NOT NULL,
  `approver_role` enum('HR','FINANCE','MANAGER','ADMIN','SUPER_ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `approval_condition` json DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_step` (`workflow_id`,`step_order`),
  KEY `idx_workflow` (`workflow_id`),
  KEY `idx_approval_chains_name` (`name`),
  CONSTRAINT `approval_chains_ibfk_1` FOREIGN KEY (`workflow_id`) REFERENCES `workflows` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approval_chains`
--

LOCK TABLES `approval_chains` WRITE;
/*!40000 ALTER TABLE `approval_chains` DISABLE KEYS */;
/*!40000 ALTER TABLE `approval_chains` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `approval_instances`
--

DROP TABLE IF EXISTS `approval_instances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approval_instances` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `workflow_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_step` int DEFAULT '1',
  `status` enum('PENDING','APPROVED','REJECTED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `decisions` json DEFAULT NULL,
  `initiated_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `initiated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `completed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `initiated_by` (`initiated_by`),
  KEY `idx_workflow` (`workflow_id`),
  KEY `idx_entity` (`entity_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `approval_instances_ibfk_1` FOREIGN KEY (`workflow_id`) REFERENCES `workflows` (`id`) ON DELETE CASCADE,
  CONSTRAINT `approval_instances_ibfk_2` FOREIGN KEY (`initiated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approval_instances`
--

LOCK TABLES `approval_instances` WRITE;
/*!40000 ALTER TABLE `approval_instances` DISABLE KEYS */;
/*!40000 ALTER TABLE `approval_instances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignment_submissions`
--

DROP TABLE IF EXISTS `assignment_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignment_submissions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `assignment_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `text_content` longtext COLLATE utf8mb4_unicode_ci,
  `grade` int DEFAULT NULL,
  `feedback` text COLLATE utf8mb4_unicode_ci,
  `graded_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `graded_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_submission` (`assignment_id`,`student_id`),
  KEY `student_id` (`student_id`),
  KEY `graded_by` (`graded_by`),
  KEY `idx_assignment` (`assignment_id`),
  CONSTRAINT `assignment_submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assignment_submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assignment_submissions_ibfk_3` FOREIGN KEY (`graded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment_submissions`
--

LOCK TABLES `assignment_submissions` WRITE;
/*!40000 ALTER TABLE `assignment_submissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignment_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `course_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `due_date` date DEFAULT NULL,
  `max_score` int DEFAULT '100',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_course` (`course_id`),
  CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;
/*!40000 ALTER TABLE `assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `check_in_time` datetime DEFAULT NULL,
  `check_out_time` datetime DEFAULT NULL,
  `total_hours` decimal(5,2) GENERATED ALWAYS AS (round((timestampdiff(SECOND,`check_in_time`,`check_out_time`) / 3600.0),2)) STORED,
  `is_late` tinyint(1) DEFAULT '0',
  `status` enum('PRESENT','ABSENT','HALF_DAY','LEAVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PRESENT',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `work_mode` enum('REMOTE','OFFICE') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `worked_minutes` int NOT NULL DEFAULT '0',
  `session_count` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_attendance` (`user_id`,`date`),
  KEY `idx_date` (`date`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` (`id`, `user_id`, `date`, `check_in_time`, `check_out_time`, `is_late`, `status`, `created_at`, `updated_at`, `work_mode`, `worked_minutes`, `session_count`) VALUES ('087e2c24-9c20-4f32-82b6-a89b5fc7c8dd','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-28','2026-10-28 09:20:00','2026-10-28 15:10:00',0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',350,1),('09804907-ba2c-4b2f-bdf9-b00df7fc714b','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-28','2026-10-28 10:15:00','2026-10-28 15:30:00',0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',315,1),('0c3e9405-11c4-46af-9e9d-c91532582a27','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-26',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('0e36a140-5cc5-4720-ab84-67bcc73665db','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-14','2026-10-14 09:20:00','2026-10-14 15:00:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',340,1),('10f08b03-0653-4286-a1c1-a0b19dd8e45f','5b594108-98b0-4cde-b908-80928e642998','2026-10-12',NULL,NULL,0,'ABSENT','2026-10-29 08:27:24','2026-10-29 08:49:44','REMOTE',0,0),('14c774c2-64d2-448a-b515-c3ba352c28d9','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-16','2026-10-16 10:00:00','2026-10-16 15:33:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',333,1),('18c22b41-0f83-4824-b20a-b1e3c862426f','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-17',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('191bb0b7-05d8-4193-915d-3fbbef089518','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-08','2026-10-08 10:00:00','2026-10-08 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',330,1),('1d11d42f-2137-44b6-837c-45827c1e50fb','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-16',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('1dd8a7f9-a146-4d70-afde-35b235f4850d','5b594108-98b0-4cde-b908-80928e642998','2026-09-25','2026-09-25 10:45:00','2026-09-25 15:30:00',1,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',285,1),('20297f0a-8fc9-4d8c-b77d-6a564cba0b3e','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-01','2026-10-01 10:20:00','2026-10-01 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',310,1),('2237819b-0976-4aac-9ba5-83bcd807f7e0','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-24',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('225881c1-b0f8-4bf9-a76e-805c7471af2f','5b594108-98b0-4cde-b908-80928e642998','2026-10-03','2026-10-03 10:10:00','2026-10-03 15:38:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',328,1),('233e1a2b-c26c-4c5a-9c7b-f5dbf417ec9d','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-23',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('240214cd-4987-4ec1-9ad6-4a99951fa286','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-13','2026-10-13 10:15:00','2026-10-13 15:40:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',325,1),('2524948d-4d0b-4bd9-91f7-edc8bfb459ed','76be4023-e449-409e-a129-a1cfd95ec590','2026-09-26','2026-09-26 10:20:00','2026-09-26 15:20:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',300,1),('26879c2a-388d-4174-b0c5-2345e6bda631','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-28',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('26c7eeb9-c9b3-4e33-bd81-2e7d93121eec','6987ebe0-6585-4ad4-b030-521fca873756','2026-09-29','2026-09-29 09:45:00','2026-09-29 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',345,1),('27ca9867-2510-4d8e-9ab9-8c3616d6dd2f','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-05',NULL,NULL,0,'ABSENT','2026-10-29 08:27:24','2026-10-29 08:49:44','REMOTE',0,0),('28f4fbcc-468e-464a-b933-805cb7cfbe67','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-16','2026-10-16 09:35:00','2026-10-16 15:10:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',335,1),('2ba4a98e-c038-4176-a894-183c5f8d8acf','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-17',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('2bb421e5-4453-419c-aa3a-a0c964724c68','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-21',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('2d38bc64-39c6-4ea3-9bb5-78ea9e3ac45b','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-06','2026-10-06 10:20:00','2026-10-06 15:50:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',330,1),('306c77de-ba3b-4b88-b056-49e9dfe28869','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-03','2026-10-03 10:15:00','2026-10-03 15:38:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',323,1),('312efada-97a0-4d8f-87f8-ca4046f370de','5b594108-98b0-4cde-b908-80928e642998','2026-10-09',NULL,NULL,0,'ABSENT','2026-10-29 08:27:24','2026-10-29 08:49:44','REMOTE',0,0),('322e0dde-003d-4c21-9078-1facb6176e79','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-06','2026-10-06 09:30:00','2026-10-06 15:50:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',380,1),('35f6316c-0096-4131-a4eb-9de258724545','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-01','2026-10-01 10:00:00','2026-10-01 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',330,1),('36e22b59-0579-44bb-8b90-a46cb53e7d9e','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-15','2026-10-15 09:25:00','2026-10-15 15:05:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',340,1),('393da907-a867-4db9-888b-887fea7f107f','76be4023-e449-409e-a129-a1cfd95ec590','2026-09-29',NULL,NULL,0,'ABSENT','2026-10-29 08:27:24','2026-10-29 08:49:44','REMOTE',0,0),('3962e47a-f9fd-4227-9145-f0dd15386312','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-07','2026-10-07 10:30:00','2026-10-07 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',300,1),('3a942adb-3ba2-40c2-a3c0-26449bf2ae47','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-22',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('3b448cd6-c88d-49d0-b2c2-22c5b27f8818','5b594108-98b0-4cde-b908-80928e642998','2026-10-22','2026-10-22 10:20:00','2026-10-22 15:00:00',0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',280,1),('3fc86709-1707-4c48-8010-5a47beb4b575','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-08',NULL,NULL,0,'ABSENT','2026-10-29 08:27:24','2026-10-29 08:49:44','REMOTE',0,0),('41b5b8b0-a94d-4617-beaf-f2067129aec7','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-15','2026-10-15 10:00:00','2026-10-15 15:38:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',338,1),('41c23f29-d365-11f1-83f3-559b0b62ccd9','922767e5-1d3b-4695-a444-db92f82057b3','2026-10-29','2026-10-29 12:22:07',NULL,1,'PRESENT','2026-10-29 06:52:07','2026-10-29 08:06:29','OFFICE',0,3),('435f73e7-87c9-4e87-90f0-9fa523c17d7d','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-20','2026-10-20 09:30:00','2026-10-20 14:40:00',0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',310,1),('43d8a88a-ec6f-4b6c-a72e-642a0ec4a6a6','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-24','2026-10-24 09:20:00','2026-10-24 15:00:00',0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',340,1),('4446d106-9d13-4b59-be0c-d6199d5fbb5b','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-20',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('461b675c-a3fd-4f13-9bed-52b807c9bc21','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-07','2026-10-07 10:00:00','2026-10-07 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',330,1),('477fea5f-28f3-46a3-a9e3-5ba044655b00','5b594108-98b0-4cde-b908-80928e642998','2026-09-28','2026-09-28 10:35:00','2026-09-28 15:30:00',1,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',295,1),('48feef67-9319-4e41-b7b1-950101a647c2','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-29',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('49576b94-4802-4823-a737-daf93b9b8e7d','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-24','2026-10-24 10:00:00',NULL,0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,1),('4df90555-95fd-41d2-a2df-e299d2d305e8','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-13','2026-10-13 09:28:00','2026-10-13 15:00:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',332,1),('50db6889-9ea6-4869-ac19-a52e337b83b9','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-02','2026-10-02 10:10:00','2026-10-02 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',320,1),('519b9f51-a0d7-449a-8d97-47642d9faf3d','6987ebe0-6585-4ad4-b030-521fca873756','2026-09-26','2026-09-26 10:20:00','2026-09-26 15:20:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',300,1),('52c11244-1fe5-459d-ac4b-cdb356c7711c','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-21','2026-10-21 09:30:00','2026-10-21 15:10:00',0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',340,1),('52d182b5-0495-470e-864d-f0a2e3cb222b','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-02','2026-10-02 09:40:00','2026-10-02 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',350,1),('52ff6d6b-51fb-41fd-845f-5ccdf0799955','5b594108-98b0-4cde-b908-80928e642998','2026-10-05','2026-10-05 10:15:00','2026-10-05 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',315,1),('537ac712-0b47-4034-9509-68cac4c2965b','5b594108-98b0-4cde-b908-80928e642998','2026-10-26',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('5404919b-dc4c-425a-899c-cc8c4691860c','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-13','2026-10-13 10:15:00','2026-10-13 15:40:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',325,1),('57249e8c-1b95-4564-8684-2244df211867','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-28','2026-10-28 10:15:00','2026-10-28 15:30:00',0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',315,1),('572ff8cf-413e-41ef-ac77-4e7f60554fca','5b594108-98b0-4cde-b908-80928e642998','2026-10-15','2026-10-15 10:20:00','2026-10-15 15:38:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',318,1),('5805614b-9edf-438f-acf5-499ba763cccb','5b594108-98b0-4cde-b908-80928e642998','2026-09-24','2026-09-24 10:40:00','2026-09-24 15:30:00',1,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',290,1),('583a5986-5058-4b2a-86de-bb6dd8ff3b69','76be4023-e449-409e-a129-a1cfd95ec590','2026-09-28','2026-09-28 10:15:00','2026-09-28 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',315,1),('58504ed0-66f9-457d-b295-5e12673e710e','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-12',NULL,NULL,0,'ABSENT','2026-10-29 08:27:24','2026-10-29 08:49:44','REMOTE',0,0),('59ffa5ed-7371-4395-ae9d-0b585d600d03','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-05','2026-10-05 10:05:00','2026-10-05 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',325,1),('5a7f8c7b-bf0f-4b05-a379-45f7756a6f1a','76be4023-e449-409e-a129-a1cfd95ec590','2026-09-30','2026-09-30 10:15:00','2026-09-30 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',315,1),('5ad8ae21-87d2-4c74-a574-9e2500e0807d','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-16','2026-10-16 10:00:00','2026-10-16 15:33:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',333,1),('5c303ba4-1289-417f-913b-ee89370ee78c','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-22','2026-10-22 09:20:00','2026-10-22 15:00:00',0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',340,1),('5ce341b2-8ea3-4bb3-9909-583f8159e292','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-09','2026-10-09 10:15:00','2026-10-09 16:00:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',345,1),('5d3149fa-dd75-4cad-a24f-62f269a9350b','5b594108-98b0-4cde-b908-80928e642998','2026-10-23',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('635ec7d4-8879-4056-9da4-2db02fa72bd4','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-07',NULL,NULL,0,'ABSENT','2026-10-29 08:27:24','2026-10-29 08:49:44','REMOTE',0,0),('6492f1cd-59f5-4469-87d4-f59c2b1b2c9a','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-12','2026-10-12 09:00:00','2026-10-12 12:00:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',180,1),('68adce29-664b-4163-84f4-45de84c94e28','5b594108-98b0-4cde-b908-80928e642998','2026-09-29',NULL,NULL,0,'ABSENT','2026-10-29 08:27:24','2026-10-29 08:49:44','REMOTE',0,0),('69138154-a6f7-41f5-96cf-f3a5c4028372','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-06',NULL,NULL,0,'ABSENT','2026-10-29 08:27:24','2026-10-29 08:49:44','REMOTE',0,0),('69824c72-4a82-4319-b2d4-b73fdfec3427','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-07','2026-10-07 10:00:00','2026-10-07 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',330,1),('6b2d973c-7e38-4b92-8a39-4643fc7b3022','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-08','2026-10-08 10:10:00','2026-10-08 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',320,1),('6c594d29-d80d-4ea8-ab8b-c889d7cfad07','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-27',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('729764e9-4ab2-48f1-999a-a84eae453e31','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-13','2026-10-13 10:15:00','2026-10-13 15:40:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',325,1),('748461ae-db1f-4fec-8902-0470c537abb5','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-29',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('7739de60-57d7-437a-b26e-fe3748872377','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-27',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('7940e344-3c28-459d-88a2-7f4055a141da','5b594108-98b0-4cde-b908-80928e642998','2026-10-27',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('7d0b15fd-e96b-4df4-ac29-13c045d64c71','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-22','2026-10-22 10:20:00','2026-10-22 15:00:00',0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',280,1),('8060c233-53fd-42c8-a6a1-52480e753d60','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-09','2026-10-09 10:15:00','2026-10-09 16:00:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',345,1),('816a0e56-fcbd-483f-932d-2988d3b3af3b','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-24','2026-10-24 09:20:00','2026-10-24 15:00:00',0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',340,1),('8185c254-e6ff-482f-9c5e-96bbf78c0f24','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-22','2026-10-22 09:20:00','2026-10-22 15:00:00',0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',340,1),('818edb31-6810-4fb7-88a7-040d6f5987ad','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-27',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('843eceaf-11ed-4183-8e70-4bb78501447f','6987ebe0-6585-4ad4-b030-521fca873756','2026-09-25','2026-09-25 10:00:00','2026-09-25 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',330,1),('84d1dfac-879c-4ade-a24c-ae61f1e29d28','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-28',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('850dc2d8-be96-46c8-904f-af8eca79e8df','5b594108-98b0-4cde-b908-80928e642998','2026-10-17',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('89f109fa-d2fa-11f1-8dda-52177c28573a','f89fa77e-a263-46df-b40c-32ba3f14738e','2026-10-28','2026-10-28 23:38:12',NULL,1,'PRESENT','2026-10-28 18:08:12','2026-10-28 18:08:12','OFFICE',0,0),('8e19a830-0d73-48a8-9239-bd607ad0f11e','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-12','2026-10-12 09:00:00','2026-10-12 12:00:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',180,1),('8f28f383-a6ad-481d-a929-9643d2a3c621','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-15','2026-10-15 10:00:00','2026-10-15 15:38:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',338,1),('92233f0c-44be-4dce-b95b-53b9f9e4c70e','5b594108-98b0-4cde-b908-80928e642998','2026-10-14','2026-10-14 10:00:00','2026-10-14 15:00:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',300,1),('929f13fe-d482-42ba-8e93-02b06d606040','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-17','2026-10-17 10:00:00','2026-10-17 15:00:00',0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',300,1),('93d18d92-60f6-4256-8353-ed7ce867e4e1','5b594108-98b0-4cde-b908-80928e642998','2026-10-02','2026-10-02 10:10:00','2026-10-02 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',320,1),('9509a4ea-6e38-42c7-82ec-587bbb9ae7ce','5b594108-98b0-4cde-b908-80928e642998','2026-09-26','2026-09-26 10:20:00','2026-09-26 15:20:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',300,1),('95c87293-de28-4c5c-a9a9-0fa2581a7b67','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-29','2026-10-29 10:30:00',NULL,0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,1),('96534ff2-9ace-4a50-b294-b287509f7909','5b594108-98b0-4cde-b908-80928e642998','2026-10-07',NULL,NULL,0,'ABSENT','2026-10-29 08:27:24','2026-10-29 08:49:44','REMOTE',0,0),('96e9e1c7-8055-4898-9ce1-4ebb68b5994a','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-23',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('987d6209-8631-4422-b10c-2354cef83e2c','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-14','2026-10-14 09:20:00','2026-10-14 15:00:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',340,1),('98e78a73-9e28-43a3-80aa-85d2277bdd70','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-29','2026-10-29 09:30:00',NULL,0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,1),('9daaf764-792b-4b80-a6fc-942d08dbc70e','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-15',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('9fa85aac-be10-4298-8d70-0b41253a0c09','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-26',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('a039c323-7fad-4228-9232-1f9fdb52a675','76be4023-e449-409e-a129-a1cfd95ec590','2026-09-25','2026-09-25 10:20:00','2026-09-25 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',310,1),('a06eae28-30e7-4eee-9b83-c928a80777d4','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-24',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('a09805fe-ad37-4f29-baf0-63c8ebf9c079','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-17','2026-10-17 09:20:00','2026-10-17 15:00:00',0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',340,1),('a11d3251-c382-4d3c-a288-66c771ba585c','5b594108-98b0-4cde-b908-80928e642998','2026-09-30',NULL,NULL,0,'ABSENT','2026-10-29 08:27:24','2026-10-29 08:49:44','REMOTE',0,0),('a1afe342-5599-4adf-92ca-bbad3375982c','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-17',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('a27e941b-81a1-4e37-96e5-e2c4d029a268','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-29','2026-10-29 10:00:00',NULL,0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,1),('a2acfa9b-9931-4797-b2cd-4500c3f1fffe','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-26','2026-10-26 09:20:00','2026-10-26 15:00:00',0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',340,1),('a670076f-d365-11f1-83f3-559b0b62ccd9','a80f8109-e4bd-4f7c-a712-5f76f276deec','2026-10-29','2026-10-29 12:24:56',NULL,1,'PRESENT','2026-10-29 06:54:56','2026-10-29 08:49:44','REMOTE',0,1),('a70f378a-d078-40cc-8ecb-1f0fe27434f5','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-27','2026-10-27 10:00:00','2026-10-27 16:00:00',0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',360,1),('a796c2e6-08e0-4c1a-9ad3-a8fbec68b0d7','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-22',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('a88ed57e-76bb-48a9-a6c5-b53b64e73ad7','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-15','2026-10-15 10:20:00','2026-10-15 15:38:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',318,1),('ac3d5311-450c-4f28-b838-4ea12796373e','5b594108-98b0-4cde-b908-80928e642998','2026-10-13',NULL,NULL,0,'ABSENT','2026-10-29 08:27:24','2026-10-29 08:49:44','REMOTE',0,0),('ad0eb01a-9fd4-4fe0-875a-2888ab2cbcd1','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-17',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('adb29452-9e51-4032-b546-a66dddf8bcbe','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-27','2026-10-27 10:35:00','2026-10-27 15:40:00',1,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',305,1),('addab27f-bc6d-4866-b866-29a93df4a092','5b594108-98b0-4cde-b908-80928e642998','2026-10-20',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('af755a55-419d-4d5d-895d-ca78d71c6bd6','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-20',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('b05e2566-a85d-4d5e-a398-704b561ee459','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-27','2026-10-27 09:20:00','2026-10-27 15:00:00',0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',340,1),('b1347466-0127-4f36-8ff0-5d5c9dc28b55','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-03','2026-10-03 09:50:00','2026-10-03 15:37:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',347,1),('b2b91d0d-be46-46c3-a674-384c806c04c4','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-14','2026-10-14 09:00:00','2026-10-14 15:00:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',360,1),('b3662ebd-c1ff-40b4-b2fa-2571da3fccbf','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-20',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('b40589ee-7e31-4673-ab6f-039b09770404','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-14','2026-10-14 10:00:00','2026-10-14 15:00:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',300,1),('b80a9825-37f4-40a8-9425-986dce5150c3','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-21','2026-10-21 10:10:00','2026-10-21 15:35:00',0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',325,1),('b885f36e-da7d-4e38-860e-f6257c18eac5','5b594108-98b0-4cde-b908-80928e642998','2026-10-16',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('b8e50f64-a3fd-43ff-9a76-b89635dc5287','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-15','2026-10-15 09:25:00','2026-10-15 15:05:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',340,1),('bb64a612-aa92-47e0-b67d-655598594efd','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-12','2026-10-12 10:00:00','2026-10-12 15:20:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',320,1),('c0113a10-adfa-4ee5-bb4c-333f3f5f1e3c','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-16','2026-10-16 10:00:00','2026-10-16 17:00:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',420,1),('c084852d-8492-40de-86c7-032b22ca0276','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-16','2026-10-16 09:35:00','2026-10-16 15:10:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',335,1),('c1557283-546c-42ce-aba0-6ac18cf3e064','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-13','2026-10-13 10:00:00','2026-10-13 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',330,1),('c26fbe89-3708-465a-bad3-0779be531da5','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-24','2026-10-24 10:15:00','2026-10-24 15:25:00',0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',310,1),('c3a5c52b-7875-4a5f-bee7-71a7fff30ed1','6987ebe0-6585-4ad4-b030-521fca873756','2026-09-30','2026-09-30 09:45:00','2026-09-30 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',345,1),('c3ab14ae-9816-44a4-a724-972bc2ea83fb','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-23','2026-10-23 09:20:00',NULL,0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,1),('c3bca58f-0afa-4e90-b8f5-b822f9bc57ac','5b594108-98b0-4cde-b908-80928e642998','2026-10-08',NULL,NULL,0,'ABSENT','2026-10-29 08:27:24','2026-10-29 08:49:44','REMOTE',0,0),('c46d5590-8ccf-4599-9cc6-7424e0c08e2a','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-28',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('c4bce115-a44d-4e0d-923c-fe9a12e8f10d','5b594108-98b0-4cde-b908-80928e642998','2026-10-29',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('c76e4dc8-3a7c-41bb-ae72-ce519cb39ffc','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-23','2026-10-23 09:30:00',NULL,0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,1),('c88341b5-44f2-4b53-b792-c8707025c67e','5b594108-98b0-4cde-b908-80928e642998','2026-10-06',NULL,NULL,0,'ABSENT','2026-10-29 08:27:24','2026-10-29 08:49:44','REMOTE',0,0),('c91d3be5-9456-4b44-93ae-580fddb41249','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-29',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('cd74d1d7-58d2-40f4-aa77-924f6da79164','5b594108-98b0-4cde-b908-80928e642998','2026-10-21',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('d09bd4e6-ce36-4181-902c-a85b75e911a2','5b594108-98b0-4cde-b908-80928e642998','2026-10-24',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('d1010702-c58d-40ea-86d8-ff51e5565fa1','5b594108-98b0-4cde-b908-80928e642998','2026-10-28',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('d1574d6f-fa31-4ef7-ac55-16e39b163f0f','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-26',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('d6379ed7-3573-4c34-a63d-9f494bcb1c83','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-21','2026-10-21 09:30:00','2026-10-21 15:10:00',0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',340,1),('d6a7ea30-53ea-424b-9820-d448c68033c7','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-12','2026-10-12 10:00:00','2026-10-12 15:00:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',300,1),('d6f3ae09-c204-480f-86ce-6b267a4fddba','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-26',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('d7c7eb7f-d8a5-4e5d-8644-e965cd00828d','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-22','2026-10-22 09:30:00','2026-10-22 15:00:00',0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',330,1),('d9ba5353-a78d-416b-b77e-a32301d13168','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-21','2026-10-21 10:10:00','2026-10-21 15:35:00',0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',325,1),('db3b3df2-46c9-451f-8f0e-9cf80c3f1e8f','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-23',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('dbe74086-cb35-4b18-b63d-15a583d1d4b7','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-09','2026-10-09 10:03:00','2026-10-09 16:00:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',357,1),('ded0652f-d35e-11f1-83f3-559b0b62ccd9','684b5dce-8c09-4128-b8eb-1e25bb2207ac','2026-10-29','2026-10-29 11:36:24',NULL,1,'PRESENT','2026-10-29 06:06:24','2026-10-29 08:49:44','REMOTE',0,1),('e1bb72e7-b390-4bf4-993b-c58f55166f79','6987ebe0-6585-4ad4-b030-521fca873756','2026-09-24','2026-09-24 11:00:00','2026-09-24 15:30:00',1,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',270,1),('e48abfb6-76bb-4e8b-80b0-360e9f2ad515','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-21','2026-10-21 10:30:00',NULL,0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,1),('e89d4630-58a9-49b1-aed5-a2466a6e0782','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-12','2026-10-12 10:05:00','2026-10-12 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',325,1),('e926855e-09a4-4581-96fe-f0d7baed0567','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-20',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('ea519cae-fb05-4ee5-bca0-8e1c957a2667','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-08','2026-10-08 10:00:00','2026-10-08 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',330,1),('f0d8dc76-8580-4f4d-9906-1960a40f402a','6987ebe0-6585-4ad4-b030-521fca873756','2026-09-28','2026-09-28 10:15:00','2026-09-28 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',315,1),('f4f575c9-f28d-4087-866c-7b4abc3e8f14','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-14','2026-10-14 10:00:00','2026-10-14 15:00:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',300,1),('f5779861-fe65-49d1-84b8-5d7ca954451e','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-26',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('f78382de-80a6-4bfc-b5c4-8f07a427b14d','5b594108-98b0-4cde-b908-80928e642998','2026-10-01',NULL,NULL,0,'ABSENT','2026-10-29 08:27:24','2026-10-29 08:49:44','REMOTE',0,0),('f8226987-32ad-4a21-a0c1-11cf6519bb56','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-09','2026-10-09 10:03:00','2026-10-09 16:00:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',357,1),('f9403f6f-edd9-4183-9043-4639bb0c8b73','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-14','2026-10-14 10:00:00','2026-10-14 15:10:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',310,1),('f947018a-b8c6-4bec-9e61-36ef0b32dcf4','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-23',NULL,NULL,0,'ABSENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,0),('fd1ce26d-a84e-4f67-8f3d-2545b544dc57','76be4023-e449-409e-a129-a1cfd95ec590','2026-09-24','2026-09-24 10:30:00','2026-09-24 15:30:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',300,1),('fd7faa48-95b3-44df-bb3b-6ac13636b8d3','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-13','2026-10-13 09:28:00','2026-10-13 15:00:00',0,'PRESENT','2026-10-29 05:49:33','2026-10-29 08:49:44','REMOTE',332,1),('fea92f9b-1be9-45ff-b936-083435d7c6ef','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-20','2026-10-20 09:30:00',NULL,0,'PRESENT','2026-10-29 08:27:25','2026-10-29 08:49:44','REMOTE',0,1);
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_coverage`
--

DROP TABLE IF EXISTS `attendance_coverage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_coverage` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `work_date` date NOT NULL,
  `absent_user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `replacement_user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `task_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_coverage_date` (`work_date`,`replacement_user_id`),
  KEY `idx_coverage_absent` (`absent_user_id`,`work_date`),
  KEY `fk_coverage_replacement_user` (`replacement_user_id`),
  KEY `fk_coverage_task` (`task_id`),
  KEY `fk_coverage_assigned_by` (`assigned_by`),
  CONSTRAINT `fk_coverage_absent_user` FOREIGN KEY (`absent_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_coverage_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_coverage_replacement_user` FOREIGN KEY (`replacement_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_coverage_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_coverage`
--

LOCK TABLES `attendance_coverage` WRITE;
/*!40000 ALTER TABLE `attendance_coverage` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance_coverage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_sessions`
--

DROP TABLE IF EXISTS `attendance_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_sessions` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `work_date` date NOT NULL,
  `check_in_time` datetime NOT NULL,
  `check_out_time` datetime DEFAULT NULL,
  `worked_minutes` int GENERATED ALWAYS AS (ifnull(timestampdiff(MINUTE,`check_in_time`,`check_out_time`),0)) STORED,
  `status` enum('ACTIVE','COMPLETED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sessions_user_date` (`user_id`,`work_date`),
  KEY `idx_sessions_user_status` (`user_id`,`status`),
  CONSTRAINT `fk_attendance_session_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_sessions`
--

LOCK TABLES `attendance_sessions` WRITE;
/*!40000 ALTER TABLE `attendance_sessions` DISABLE KEYS */;
INSERT INTO `attendance_sessions` (`id`, `user_id`, `work_date`, `check_in_time`, `check_out_time`, `status`, `created_at`, `updated_at`) VALUES ('00b00ef8-f10f-58bd-8259-08f9adec69b2','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-21','2026-10-21 10:10:00','2026-10-21 15:35:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('0318f43c-fd07-5070-8455-436ddea0cff4','5b594108-98b0-4cde-b908-80928e642998','2026-10-03','2026-10-03 10:10:00','2026-10-03 15:38:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('0584b889-e241-5cbd-b874-1e74cc393e18','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-22','2026-10-22 09:30:00','2026-10-22 15:00:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('07f706bf-852c-5b73-9a00-4abad650a324','5b594108-98b0-4cde-b908-80928e642998','2026-10-14','2026-10-14 10:00:00','2026-10-14 15:00:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('07f814e8-ea0f-5ce5-b775-4bd7c4ddcbcc','5b594108-98b0-4cde-b908-80928e642998','2026-10-15','2026-10-15 10:20:00','2026-10-15 15:38:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('0b8f984f-41dc-5006-85d1-bf8289923b24','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-13','2026-10-13 10:15:00','2026-10-13 15:40:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('10010a9c-0711-56af-9b4b-1ba6c283f630','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-14','2026-10-14 10:00:00','2026-10-14 15:00:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('1030dd9b-5a91-54bd-a96c-3308b0fde12a','6987ebe0-6585-4ad4-b030-521fca873756','2026-09-29','2026-09-29 09:45:00','2026-09-29 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('133b2798-7a9b-523f-bb4a-cbe3aeee9678','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-23','2026-10-23 09:20:00',NULL,'COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('134327d7-d612-5c7c-a8b5-7fc65dc6ba2a','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-20','2026-10-20 09:30:00',NULL,'COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('13a4e6db-69c4-53d7-9769-d8e0284358cc','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-29','2026-10-29 10:00:00',NULL,'COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('14a6160e-b40f-5f27-8f05-c3c95879f555','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-06','2026-10-06 10:20:00','2026-10-06 15:50:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('15da8b84-4676-513e-be6a-f5e4cdd260af','6987ebe0-6585-4ad4-b030-521fca873756','2026-09-28','2026-09-28 10:15:00','2026-09-28 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('1719231e-0549-513c-a4a7-fc7deddd1f73','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-16','2026-10-16 10:00:00','2026-10-16 17:00:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('17ec1128-5b18-5c21-85ee-1455a977fda8','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-21','2026-10-21 10:10:00','2026-10-21 15:35:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('192765f2-e8f6-55b2-a1b3-d103ed4afd42','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-08','2026-10-08 10:00:00','2026-10-08 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('1a14f6d3-713e-4230-aaee-d468e20a7b91','922767e5-1d3b-4695-a444-db92f82057b3','2026-10-29','2026-10-29 12:22:37','2026-10-29 12:22:39','COMPLETED','2026-10-29 06:52:37','2026-10-29 06:52:39'),('1a46c6cd-cc04-53be-bab5-7cf1d08f2ef4','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-14','2026-10-14 09:20:00','2026-10-14 15:00:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('224ebdc8-4c53-5090-9b60-1cae1ebac965','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-28','2026-10-28 10:15:00','2026-10-28 15:30:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('25fe9352-9bca-5c19-affb-af1ddd7c2633','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-12','2026-10-12 09:00:00','2026-10-12 12:00:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('260f33f6-d1b8-484a-801c-ec2c97f7b0c0','922767e5-1d3b-4695-a444-db92f82057b3','2026-10-29','2026-10-29 13:36:30',NULL,'ACTIVE','2026-10-29 08:06:29','2026-10-29 08:06:29'),('2843cce9-ebf6-546b-9d56-a33724afb6b8','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-15','2026-10-15 09:25:00','2026-10-15 15:05:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('29b055df-e4d3-5807-b613-2bc4511be5a8','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-13','2026-10-13 09:28:00','2026-10-13 15:00:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('2a2ff843-d2d1-58fd-ba5e-12b7ecd770f2','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-12','2026-10-12 10:00:00','2026-10-12 15:00:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('2aa455f4-f098-58a3-870b-bcfa73860f7b','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-03','2026-10-03 09:50:00','2026-10-03 15:37:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('2cb89869-6ffa-5c3b-b2bb-93e1faca293b','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-24','2026-10-24 10:00:00',NULL,'COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('30986116-f54a-55aa-b1fe-65cc682b75aa','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-16','2026-10-16 09:35:00','2026-10-16 15:10:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('3218d20a-6cde-5161-8632-efc9179bcc7d','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-12','2026-10-12 10:00:00','2026-10-12 15:20:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('326ca8e6-c367-59cd-b8f8-50160e610033','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-15','2026-10-15 09:25:00','2026-10-15 15:05:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('32aa7631-fe94-5d26-9632-d4ef772a585c','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-14','2026-10-14 10:00:00','2026-10-14 15:00:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('35703ca7-d856-559c-8359-b76d2c9ac718','5b594108-98b0-4cde-b908-80928e642998','2026-09-28','2026-09-28 10:35:00','2026-09-28 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('3626beb5-e50c-5d33-8c1b-351b58c243c3','5b594108-98b0-4cde-b908-80928e642998','2026-09-25','2026-09-25 10:45:00','2026-09-25 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('372a4cd1-8824-57e6-ad43-c64602ba1fde','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-16','2026-10-16 10:00:00','2026-10-16 15:33:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('393df371-5586-540d-bc03-eeed52614729','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-02','2026-10-02 09:40:00','2026-10-02 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('3a4b84fe-4a18-5189-bf51-a9f46014f783','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-06','2026-10-06 09:30:00','2026-10-06 15:50:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('4212294e-c532-5c44-9e32-84ca4dd4937e','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-16','2026-10-16 10:00:00','2026-10-16 15:33:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('42b112c8-bfb2-567c-8e18-7ec117235564','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-14','2026-10-14 10:00:00','2026-10-14 15:10:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('47f9cac3-9f71-5cf0-93a7-221f6c164cd2','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-21','2026-10-21 09:30:00','2026-10-21 15:10:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('4bef928e-2f48-5c41-9a6a-3716387fe5bd','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-09','2026-10-09 10:03:00','2026-10-09 16:00:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('51ca0422-b51a-551e-9e3f-580265f0ce2c','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-24','2026-10-24 10:15:00','2026-10-24 15:25:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('52301f9d-f9f3-5279-977c-387b43b9012c','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-13','2026-10-13 10:00:00','2026-10-13 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('53e8b6f5-9edc-5e6a-be58-a0e6692a6216','5b594108-98b0-4cde-b908-80928e642998','2026-10-22','2026-10-22 10:20:00','2026-10-22 15:00:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('54207873-5dee-5f12-b7df-7ba0751a096c','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-09','2026-10-09 10:03:00','2026-10-09 16:00:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('56d5453f-5f28-5f37-8bab-cc77ec9d2f18','5b594108-98b0-4cde-b908-80928e642998','2026-10-02','2026-10-02 10:10:00','2026-10-02 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('57b12695-8756-5707-bb0a-2aea5aadede7','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-23','2026-10-23 09:30:00',NULL,'COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('596c7874-277a-51f1-9cf8-589dc362ab93','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-07','2026-10-07 10:00:00','2026-10-07 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('65428e27-2c95-535a-ae1e-28dc8c26809b','76be4023-e449-409e-a129-a1cfd95ec590','2026-09-26','2026-09-26 10:20:00','2026-09-26 15:20:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('65d12638-7c57-50b4-9b3b-ee1d0d604c94','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-21','2026-10-21 09:30:00','2026-10-21 15:10:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('68181e63-81c2-5cb4-8e03-73232c77e716','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-15','2026-10-15 10:00:00','2026-10-15 15:38:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('6897a421-205b-5e94-8c1f-b31df82288d6','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-24','2026-10-24 09:20:00','2026-10-24 15:00:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('68d75318-404b-5f1d-9e13-0b75da7af0c5','6987ebe0-6585-4ad4-b030-521fca873756','2026-09-25','2026-09-25 10:00:00','2026-09-25 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('690139d1-3468-53eb-92b3-bc709ff09759','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-15','2026-10-15 10:00:00','2026-10-15 15:38:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('6d916762-b364-5c6e-8f96-05bdd5eefd8d','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-29','2026-10-29 09:30:00',NULL,'COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('6e1c4934-4519-52ae-bd86-0abe562051c9','76be4023-e449-409e-a129-a1cfd95ec590','2026-09-24','2026-09-24 10:30:00','2026-09-24 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('6f132293-0df6-55b1-ada5-cff3d1b6be59','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-22','2026-10-22 09:20:00','2026-10-22 15:00:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('7633abed-eab2-5033-bbbc-32d6e14ea520','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-12','2026-10-12 09:00:00','2026-10-12 12:00:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('809171b7-d7cf-5e08-b3cb-b0115f0f4c75','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-01','2026-10-01 10:00:00','2026-10-01 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('8185a206-2187-508f-b561-07b8302c4657','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-16','2026-10-16 09:35:00','2026-10-16 15:10:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('82ec6214-9d87-5038-96e8-de469b9bc50b','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-21','2026-10-21 10:30:00',NULL,'COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('8345bbe6-0ed7-5990-ab41-a2769ee86256','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-09','2026-10-09 10:15:00','2026-10-09 16:00:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('8abf9612-0c01-54c5-9f82-f0249c023194','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-12','2026-10-12 10:05:00','2026-10-12 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('8f84e331-108d-5917-a4ad-bb8ac28b7b51','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-28','2026-10-28 09:20:00','2026-10-28 15:10:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('935d5f72-73d7-49d3-94d1-ce14c228af77','a80f8109-e4bd-4f7c-a712-5f76f276deec','2026-10-29','2026-10-29 12:24:56',NULL,'ACTIVE','2026-10-29 06:54:56','2026-10-29 06:54:56'),('93e4f167-7a75-527a-a119-75b09c737cb1','6987ebe0-6585-4ad4-b030-521fca873756','2026-09-26','2026-09-26 10:20:00','2026-09-26 15:20:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('95b6eb67-1f8b-5d71-9601-e4729a69a398','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-14','2026-10-14 09:20:00','2026-10-14 15:00:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('9632e0ab-4090-5abd-9b26-bfa2b6460238','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-27','2026-10-27 10:00:00','2026-10-27 16:00:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('9a342e7e-756d-5c02-b77e-d9aae369b8a1','76be4023-e449-409e-a129-a1cfd95ec590','2026-09-30','2026-09-30 10:15:00','2026-09-30 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('9a4c14c7-ea34-54c0-88d6-34aca3d6a47e','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-08','2026-10-08 10:00:00','2026-10-08 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('a5cbcca4-1592-5add-9c73-3a950a11d071','76be4023-e449-409e-a129-a1cfd95ec590','2026-09-25','2026-09-25 10:20:00','2026-09-25 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('abd29e45-e120-58bb-a45c-256a36acc717','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-17','2026-10-17 10:00:00','2026-10-17 15:00:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('b2fdcc47-8570-503a-b508-521136f51aa9','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-14','2026-10-14 09:00:00','2026-10-14 15:00:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('b306908c-4451-5777-ba00-efacd8f9d80b','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-02','2026-10-02 10:10:00','2026-10-02 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('b7d9f09e-3a9b-50f0-853b-937ef0a27bb6','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-22','2026-10-22 10:20:00','2026-10-22 15:00:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('bcb35400-02c9-568d-b072-df661d8b9c2b','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-01','2026-10-01 10:20:00','2026-10-01 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('bd421103-4576-51d1-836f-cf1e4a42d4e2','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-05','2026-10-05 10:05:00','2026-10-05 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('be0aba62-6840-515c-9dbd-d729be314af5','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-27','2026-10-27 10:35:00','2026-10-27 15:40:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('c3a022c0-43ca-59bd-9757-8a80231d0d52','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-24','2026-10-24 09:20:00','2026-10-24 15:00:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('c91ee3ec-165d-5c24-b96d-ffa39e8e4b05','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-15','2026-10-15 10:20:00','2026-10-15 15:38:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('cb4289af-38d0-5b59-bdb0-9b74f93a17e6','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-07','2026-10-07 10:30:00','2026-10-07 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('ce414527-acab-5877-886c-1c6a0dbe2757','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-28','2026-10-28 10:15:00','2026-10-28 15:30:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('cfaec1ff-af35-5c9e-a8c7-18e34553cdac','6987ebe0-6585-4ad4-b030-521fca873756','2026-09-30','2026-09-30 09:45:00','2026-09-30 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('d1a881d2-287f-5d83-be7e-639da2b094d4','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-03','2026-10-03 10:15:00','2026-10-03 15:38:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('d8502393-db0f-56cc-92f3-ad1a6da0c41e','76be4023-e449-409e-a129-a1cfd95ec590','2026-10-09','2026-10-09 10:15:00','2026-10-09 16:00:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('d9e9b970-991b-5ae8-9113-0b3b905ee990','5b594108-98b0-4cde-b908-80928e642998','2026-09-26','2026-09-26 10:20:00','2026-09-26 15:20:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('db164ca2-ceda-5127-b609-0ca369d20542','2c8fcffb-5516-4eea-99e1-dc970454b8c2','2026-10-13','2026-10-13 09:28:00','2026-10-13 15:00:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('e0303082-0d93-461b-ad5d-b5080d8b99f3','684b5dce-8c09-4128-b8eb-1e25bb2207ac','2026-10-29','2026-10-29 11:36:24',NULL,'ACTIVE','2026-10-29 06:06:24','2026-10-29 06:06:24'),('e5792ced-84c7-5820-9a1f-f1983bc6ef9f','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-08','2026-10-08 10:10:00','2026-10-08 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('e5f7ddaf-a00e-57b1-95cf-9c6460819074','d0ad4394-a479-4c93-9b30-179d9d09d05d','2026-10-13','2026-10-13 10:15:00','2026-10-13 15:40:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('e7423b95-d97a-561c-b020-41f69307c77b','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-20','2026-10-20 09:30:00','2026-10-20 14:40:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('e8701f54-586c-4a43-ba5b-e20475171387','922767e5-1d3b-4695-a444-db92f82057b3','2026-10-29','2026-10-29 12:22:07','2026-10-29 12:22:10','COMPLETED','2026-10-29 06:52:07','2026-10-29 06:52:09'),('eb4a63c8-9435-5aae-8cd3-4a9881f7b478','76be4023-e449-409e-a129-a1cfd95ec590','2026-09-28','2026-09-28 10:15:00','2026-09-28 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('eced1956-594c-5fee-889a-7a476628ab21','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-13','2026-10-13 10:15:00','2026-10-13 15:40:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('ed47c980-fb1c-530d-86c6-d4189b820803','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-27','2026-10-27 09:20:00','2026-10-27 15:00:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('ed553925-98cd-51c5-a9e3-bc8ebba49b23','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-17','2026-10-17 09:20:00','2026-10-17 15:00:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('f13f3641-2025-5eb7-b87c-3f2139ac464a','5b594108-98b0-4cde-b908-80928e642998','2026-09-24','2026-09-24 10:40:00','2026-09-24 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('f1f094e7-3337-5220-8443-dbe84bf95621','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-22','2026-10-22 09:20:00','2026-10-22 15:00:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('f2086361-021d-5e7e-a1c6-b58ab414243b','6987ebe0-6585-4ad4-b030-521fca873756','2026-10-29','2026-10-29 10:30:00',NULL,'COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25'),('f72b3f27-ef8d-5046-9662-0770cab5fc90','e9941b4c-c368-4337-98e5-361a9845de01','2026-10-07','2026-10-07 10:00:00','2026-10-07 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('f7e3c858-c78c-5069-a1ef-d0fd007e4ad6','5b594108-98b0-4cde-b908-80928e642998','2026-10-05','2026-10-05 10:15:00','2026-10-05 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('fa6f7401-6145-5b21-bde6-8ff15cdaa1dc','6987ebe0-6585-4ad4-b030-521fca873756','2026-09-24','2026-09-24 11:00:00','2026-09-24 15:30:00','COMPLETED','2026-10-29 08:27:24','2026-10-29 08:27:24'),('fb59edee-33bf-5897-890b-64102a1d24ea','6e96d5e7-db7f-4b38-ad35-8d44477279fa','2026-10-26','2026-10-26 09:20:00','2026-10-26 15:00:00','COMPLETED','2026-10-29 08:27:25','2026-10-29 08:27:25');
/*!40000 ALTER TABLE `attendance_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_value` json DEFAULT NULL,
  `new_value` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_action_created` (`user_id`,`action`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=218 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,'f89fa77e-a263-46df-b40c-32ba3f14738e','LOGIN','USER','f89fa77e-a263-46df-b40c-32ba3f14738e',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-28 18:05:45'),(2,'f89fa77e-a263-46df-b40c-32ba3f14738e','LOGIN','USER','f89fa77e-a263-46df-b40c-32ba3f14738e',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-28 18:06:15'),(3,'f89fa77e-a263-46df-b40c-32ba3f14738e','LOGIN','USER','f89fa77e-a263-46df-b40c-32ba3f14738e',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-28 18:06:24'),(4,'f89fa77e-a263-46df-b40c-32ba3f14738e','APPLY_LEAVE','LEAVE',NULL,NULL,'{\"reason\": \"Isolated API workflow verification\", \"end_date\": \"2030-02-10\", \"leave_type\": \"CASUAL\", \"start_date\": \"2030-02-10\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-28 18:06:24'),(5,'44f55fc2-753e-4d9b-b9d5-2ff1e0f994dc','LOGIN','USER','44f55fc2-753e-4d9b-b9d5-2ff1e0f994dc',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-28 18:06:24'),(6,'44f55fc2-753e-4d9b-b9d5-2ff1e0f994dc','UPDATE_LEAVE_STATUS','LEAVE','91c56aab-563d-4df9-95f0-3bba2ae84443','{\"id\": \"91c56aab-563d-4df9-95f0-3bba2ae84443\", \"email\": null, \"reason\": \"Isolated API workflow verification\", \"status\": \"PENDING\", \"user_id\": \"f89fa77e-a263-46df-b40c-32ba3f14738e\", \"end_date\": \"2030-02-09T18:30:00.000Z\", \"full_name\": null, \"user_name\": null, \"created_at\": \"2026-10-28T18:06:24.000Z\", \"leave_type\": \"CASUAL\", \"start_date\": \"2030-02-09T18:30:00.000Z\", \"updated_at\": \"2026-10-28T18:06:24.000Z\", \"approved_by\": null, \"review_note\": null, \"employee_name\": null, \"approved_by_name\": null, \"approval_chain_step\": 1}','{\"status\": \"APPROVED\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-28 18:06:24'),(7,'44f55fc2-753e-4d9b-b9d5-2ff1e0f994dc','LOGIN','USER','44f55fc2-753e-4d9b-b9d5-2ff1e0f994dc',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-28 18:06:45'),(8,'44f55fc2-753e-4d9b-b9d5-2ff1e0f994dc','LOGIN','USER','44f55fc2-753e-4d9b-b9d5-2ff1e0f994dc',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-28 18:08:12'),(9,'44f55fc2-753e-4d9b-b9d5-2ff1e0f994dc','CHECK_IN','ATTENDANCE','f89fa77e-a263-46df-b40c-32ba3f14738e',NULL,'{\"date\": \"2026-10-28\", \"time\": \"2026-10-28T18:08:12.315Z\", \"status\": \"PRESENT\", \"user_id\": \"f89fa77e-a263-46df-b40c-32ba3f14738e\", \"work_mode\": \"OFFICE\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-28 18:08:12'),(10,'f89fa77e-a263-46df-b40c-32ba3f14738e','LOGIN','USER','f89fa77e-a263-46df-b40c-32ba3f14738e',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-28 18:08:12'),(11,'f89fa77e-a263-46df-b40c-32ba3f14738e','APPLY_LEAVE','LEAVE',NULL,NULL,'{\"reason\": \"Calendar migration integration verification\", \"end_date\": \"2030-02-11\", \"leave_type\": \"CASUAL\", \"start_date\": \"2030-02-11\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-28 18:08:12'),(12,'44f55fc2-753e-4d9b-b9d5-2ff1e0f994dc','UPDATE_LEAVE_STATUS','LEAVE','e0fce45a-a213-42ba-9876-146f7ac179ac','{\"id\": \"e0fce45a-a213-42ba-9876-146f7ac179ac\", \"email\": null, \"reason\": \"Calendar migration integration verification\", \"status\": \"PENDING\", \"user_id\": \"f89fa77e-a263-46df-b40c-32ba3f14738e\", \"end_date\": \"2030-02-10T18:30:00.000Z\", \"full_name\": null, \"user_name\": null, \"created_at\": \"2026-10-28T18:08:12.000Z\", \"leave_type\": \"CASUAL\", \"start_date\": \"2030-02-10T18:30:00.000Z\", \"updated_at\": \"2026-10-28T18:08:12.000Z\", \"approved_by\": null, \"review_note\": null, \"employee_name\": null, \"approved_by_name\": null, \"approval_chain_step\": 1}','{\"status\": \"APPROVED\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-28 18:08:14'),(13,'f89fa77e-a263-46df-b40c-32ba3f14738e','LOGIN','USER','f89fa77e-a263-46df-b40c-32ba3f14738e',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-28 18:08:21'),(52,'68557fb9-209d-4efa-a558-7dcff689444e','LOGIN','USER','68557fb9-209d-4efa-a558-7dcff689444e',NULL,'{\"portal\": \"super-admin\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:23:07'),(53,'f55ab612-cec0-492e-9f6d-2518ce43c976','LOGIN','USER','f55ab612-cec0-492e-9f6d-2518ce43c976',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:23:07'),(54,'fae21754-aae1-437e-9256-45ff69f09700','LOGIN','USER','fae21754-aae1-437e-9256-45ff69f09700',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:23:07'),(55,'a80f8109-e4bd-4f7c-a712-5f76f276deec','LOGIN','USER','a80f8109-e4bd-4f7c-a712-5f76f276deec',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:23:08'),(56,'429d254c-ece3-4e52-b445-0e87b541b5f4','LOGIN','USER','429d254c-ece3-4e52-b445-0e87b541b5f4',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:23:08'),(57,'fae21754-aae1-437e-9256-45ff69f09700','LOGIN','USER','fae21754-aae1-437e-9256-45ff69f09700',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:23:42'),(58,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"portal\": \"super-admin\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:27:06'),(59,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:27:06'),(60,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:27:06'),(61,'684b5dce-8c09-4128-b8eb-1e25bb2207ac','LOGIN','USER','684b5dce-8c09-4128-b8eb-1e25bb2207ac',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:27:07'),(62,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"portal\": \"super-admin\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0','2026-10-29 05:28:24'),(63,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0','2026-10-29 05:29:24'),(64,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0','2026-10-29 05:30:20'),(65,NULL,'LOGIN_ATTEMPT','AUTH',NULL,NULL,'{\"success\": false, \"portal_slug\": \"employee\", \"failure_reason\": \"user_not_found\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0','2026-10-29 05:31:00'),(66,'684b5dce-8c09-4128-b8eb-1e25bb2207ac','LOGIN','USER','684b5dce-8c09-4128-b8eb-1e25bb2207ac',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0','2026-10-29 05:31:18'),(67,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:48:13'),(68,'d0ad4394-a479-4c93-9b30-179d9d09d05d','LOGIN','USER','d0ad4394-a479-4c93-9b30-179d9d09d05d',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:52:14'),(69,'6987ebe0-6585-4ad4-b030-521fca873756','LOGIN','USER','6987ebe0-6585-4ad4-b030-521fca873756',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:52:14'),(70,'76be4023-e449-409e-a129-a1cfd95ec590','LOGIN','USER','76be4023-e449-409e-a129-a1cfd95ec590',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:52:14'),(71,'e9941b4c-c368-4337-98e5-361a9845de01','LOGIN','USER','e9941b4c-c368-4337-98e5-361a9845de01',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:52:14'),(72,'6e96d5e7-db7f-4b38-ad35-8d44477279fa','LOGIN','USER','6e96d5e7-db7f-4b38-ad35-8d44477279fa',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:52:15'),(73,'2c8fcffb-5516-4eea-99e1-dc970454b8c2','LOGIN','USER','2c8fcffb-5516-4eea-99e1-dc970454b8c2',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:52:15'),(74,'5b594108-98b0-4cde-b908-80928e642998','LOGIN','USER','5b594108-98b0-4cde-b908-80928e642998',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:52:15'),(75,'5b594108-98b0-4cde-b908-80928e642998','LOGIN','USER','5b594108-98b0-4cde-b908-80928e642998',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:52:39'),(76,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"portal\": \"super-admin\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:52:39'),(77,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:52:39'),(78,'d0ad4394-a479-4c93-9b30-179d9d09d05d','LOGIN','USER','d0ad4394-a479-4c93-9b30-179d9d09d05d',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:52:40'),(79,'5b594108-98b0-4cde-b908-80928e642998','LOGIN','USER','5b594108-98b0-4cde-b908-80928e642998',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:53:30'),(80,'5b594108-98b0-4cde-b908-80928e642998','LOGIN','USER','5b594108-98b0-4cde-b908-80928e642998',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:55:58'),(81,'d0ad4394-a479-4c93-9b30-179d9d09d05d','LOGIN','USER','d0ad4394-a479-4c93-9b30-179d9d09d05d',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 05:55:58'),(82,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"portal\": \"super-admin\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0','2026-10-29 06:02:04'),(83,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0','2026-10-29 06:02:36'),(84,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0','2026-10-29 06:03:44'),(85,NULL,'LOGIN_ATTEMPT','AUTH',NULL,NULL,'{\"success\": false, \"portal_slug\": \"employee\", \"failure_reason\": \"user_not_found\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0','2026-10-29 06:05:52'),(86,'684b5dce-8c09-4128-b8eb-1e25bb2207ac','LOGIN','USER','684b5dce-8c09-4128-b8eb-1e25bb2207ac',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0','2026-10-29 06:06:10'),(87,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:06:11'),(88,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:06:31'),(89,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:06:32'),(90,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:06:32'),(91,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0','2026-10-29 06:07:07'),(92,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:08:26'),(93,NULL,'LOGIN_ATTEMPT','AUTH',NULL,NULL,'{\"success\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"user_not_found\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:10:44'),(94,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:12:34'),(95,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"portal\": \"super-admin\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:12:34'),(96,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:12:34'),(97,'5b594108-98b0-4cde-b908-80928e642998','LOGIN','USER','5b594108-98b0-4cde-b908-80928e642998',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:12:34'),(98,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:12:40'),(99,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:13:22'),(100,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:13:26'),(101,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:13:52'),(102,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"portal\": \"super-admin\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:13:52'),(103,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:13:52'),(104,'5b594108-98b0-4cde-b908-80928e642998','LOGIN','USER','5b594108-98b0-4cde-b908-80928e642998',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:13:52'),(105,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:14:41'),(106,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"portal\": \"super-admin\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:14:41'),(107,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:14:41'),(108,'a80f8109-e4bd-4f7c-a712-5f76f276deec','LOGIN','USER','a80f8109-e4bd-4f7c-a712-5f76f276deec',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:14:41'),(109,'5b594108-98b0-4cde-b908-80928e642998','LOGIN','USER','5b594108-98b0-4cde-b908-80928e642998',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:14:41'),(110,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:15:12'),(111,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:15:12'),(112,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:19:43'),(113,'922767e5-1d3b-4695-a444-db92f82057b3','CREATE_TASK','TASK','578353da-c0f3-4423-809b-20c31384680d',NULL,'{\"due_date\": \"2026-11-30\", \"priority\": \"MEDIUM\", \"assigned_to\": \"d0ad4394-a479-4c93-9b30-179d9d09d05d\", \"description\": \"Local assignment workflow verification\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:19:43'),(114,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:26:16'),(115,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:26:26'),(116,'922767e5-1d3b-4695-a444-db92f82057b3','UPDATE_TASK_STATUS','TASK','578353da-c0f3-4423-809b-20c31384680d','{\"status\": \"PENDING\"}','{\"status\": \"CANCELLED\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:26:26'),(117,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:26:27'),(118,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:26:33'),(119,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:26:37'),(120,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:27:50'),(121,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:27:50'),(122,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"portal\": \"super-admin\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:27:50'),(123,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:27:58'),(124,'922767e5-1d3b-4695-a444-db92f82057b3','CREATE_TASK','TASK','582ed233-89f2-437e-972f-38d0c9c2ff54',NULL,'{\"due_date\": \"2026-11-28\", \"priority\": \"LOW\", \"assigned_to\": \"2c8fcffb-5516-4eea-99e1-dc970454b8c2\", \"description\": \"Temporary local task assignment verification\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:27:58'),(125,'922767e5-1d3b-4695-a444-db92f82057b3','UPDATE_TASK_STATUS','TASK','582ed233-89f2-437e-972f-38d0c9c2ff54','{\"status\": \"PENDING\"}','{\"status\": \"CANCELLED\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:27:58'),(126,'5b594108-98b0-4cde-b908-80928e642998','LOGIN','USER','5b594108-98b0-4cde-b908-80928e642998',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:27:58'),(127,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:30:17'),(128,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:30:18'),(129,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"portal\": \"super-admin\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:30:18'),(130,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:30:42'),(133,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:31:02'),(134,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:31:02'),(135,'922767e5-1d3b-4695-a444-db92f82057b3','CREATE_TASK','TASK','804272b0-17c9-48ef-b204-9c281f63e8db',NULL,'{\"due_date\": \"2026-10-29\", \"priority\": \"LOW\", \"assigned_to\": \"2c8fcffb-5516-4eea-99e1-dc970454b8c2\", \"description\": \"Temporary local coverage reassignment verification\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:31:02'),(138,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:32:35'),(139,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:32:35'),(140,'5b594108-98b0-4cde-b908-80928e642998','LOGIN','USER','5b594108-98b0-4cde-b908-80928e642998',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:32:35'),(141,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"portal\": \"super-admin\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:32:36'),(142,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:33:29'),(143,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:33:29'),(144,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:36:43'),(145,NULL,'LOGIN_ATTEMPT','AUTH',NULL,NULL,'{\"success\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"user_not_found\"}','::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','2026-10-29 06:42:26'),(146,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"portal\": \"super-admin\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0','2026-10-29 06:49:55'),(147,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0','2026-10-29 06:52:04'),(148,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0','2026-10-29 06:53:22'),(149,NULL,'LOGIN_ATTEMPT','AUTH',NULL,NULL,'{\"success\": false, \"portal_slug\": \"employee\", \"failure_reason\": \"user_not_found\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0','2026-10-29 06:54:31'),(150,'a80f8109-e4bd-4f7c-a712-5f76f276deec','LOGIN','USER','a80f8109-e4bd-4f7c-a712-5f76f276deec',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0','2026-10-29 06:54:50'),(151,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0','2026-10-29 08:24:29'),(152,NULL,'LOGIN_ATTEMPT','AUTH',NULL,NULL,'{\"success\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"user_not_found\"}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:39:23'),(153,NULL,'LOGIN_ATTEMPT','AUTH',NULL,NULL,'{\"success\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"user_not_found\"}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:39:23'),(154,NULL,'LOGIN_ATTEMPT','AUTH',NULL,NULL,'{\"success\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"user_not_found\"}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:39:23'),(155,NULL,'LOGIN_ATTEMPT','AUTH',NULL,NULL,'{\"success\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"user_not_found\"}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:39:23'),(156,NULL,'LOGIN_ATTEMPT','AUTH',NULL,NULL,'{\"success\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"user_not_found\"}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:39:23'),(157,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN_ATTEMPT','AUTH','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"success\": false, \"is_locked\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"invalid_password\", \"failed_attempts\": 1}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:41:39'),(158,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN_ATTEMPT','AUTH','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"success\": false, \"is_locked\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"invalid_password\", \"failed_attempts\": 2}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:41:40'),(159,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN_ATTEMPT','AUTH','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"success\": false, \"is_locked\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"invalid_password\", \"failed_attempts\": 3}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:41:40'),(160,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN_ATTEMPT','AUTH','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"success\": false, \"is_locked\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"invalid_password\", \"failed_attempts\": 4}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:41:40'),(161,'5e402aed-f6c0-4bdb-926a-f3310d27240f','SECURITY_ACCOUNT_LOCKOUT','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"lockoutUntil\": \"2026-10-29T08:56:40.475Z\", \"failedAttempts\": 5}','127.0.0.1',NULL,'2026-10-29 08:41:40'),(162,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN_ATTEMPT','AUTH','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"success\": false, \"is_locked\": true, \"portal_slug\": \"unknown\", \"failure_reason\": \"invalid_password\", \"failed_attempts\": 5}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:41:40'),(163,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN_ATTEMPT','AUTH','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"success\": false, \"is_locked\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"invalid_password\", \"failed_attempts\": 1}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:41:40'),(164,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN_ATTEMPT','AUTH','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"success\": false, \"is_locked\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"invalid_password\", \"failed_attempts\": 2}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:41:40'),(165,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN_ATTEMPT','AUTH','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"success\": false, \"is_locked\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"invalid_password\", \"failed_attempts\": 3}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:41:41'),(166,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN_ATTEMPT','AUTH','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"success\": false, \"is_locked\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"invalid_password\", \"failed_attempts\": 4}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:41:41'),(167,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','SECURITY_ACCOUNT_LOCKOUT','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"lockoutUntil\": \"2026-10-29T08:56:42.009Z\", \"failedAttempts\": 5}','127.0.0.1',NULL,'2026-10-29 08:41:42'),(168,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN_ATTEMPT','AUTH','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"success\": false, \"is_locked\": true, \"portal_slug\": \"unknown\", \"failure_reason\": \"invalid_password\", \"failed_attempts\": 5}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:41:42'),(169,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN_ATTEMPT','AUTH','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"success\": false, \"is_locked\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"invalid_password\", \"failed_attempts\": 1}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:41:42'),(170,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN_ATTEMPT','AUTH','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"success\": false, \"is_locked\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"invalid_password\", \"failed_attempts\": 2}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:41:42'),(171,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN_ATTEMPT','AUTH','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"success\": false, \"is_locked\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"invalid_password\", \"failed_attempts\": 3}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:41:42'),(172,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN_ATTEMPT','AUTH','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"success\": false, \"is_locked\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"invalid_password\", \"failed_attempts\": 4}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:41:43'),(173,'922767e5-1d3b-4695-a444-db92f82057b3','SECURITY_ACCOUNT_LOCKOUT','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"lockoutUntil\": \"2026-10-29T08:56:43.382Z\", \"failedAttempts\": 5}','127.0.0.1',NULL,'2026-10-29 08:41:43'),(174,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN_ATTEMPT','AUTH','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"success\": false, \"is_locked\": true, \"portal_slug\": \"unknown\", \"failure_reason\": \"invalid_password\", \"failed_attempts\": 5}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:41:43'),(175,'a80f8109-e4bd-4f7c-a712-5f76f276deec','LOGIN_ATTEMPT','AUTH','a80f8109-e4bd-4f7c-a712-5f76f276deec',NULL,'{\"success\": false, \"is_locked\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"invalid_password\", \"failed_attempts\": 1}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:41:43'),(176,'a80f8109-e4bd-4f7c-a712-5f76f276deec','LOGIN_ATTEMPT','AUTH','a80f8109-e4bd-4f7c-a712-5f76f276deec',NULL,'{\"success\": false, \"is_locked\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"invalid_password\", \"failed_attempts\": 2}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:41:43'),(177,'a80f8109-e4bd-4f7c-a712-5f76f276deec','LOGIN_ATTEMPT','AUTH','a80f8109-e4bd-4f7c-a712-5f76f276deec',NULL,'{\"success\": false, \"is_locked\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"invalid_password\", \"failed_attempts\": 3}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:41:44'),(178,'a80f8109-e4bd-4f7c-a712-5f76f276deec','LOGIN_ATTEMPT','AUTH','a80f8109-e4bd-4f7c-a712-5f76f276deec',NULL,'{\"success\": false, \"is_locked\": false, \"portal_slug\": \"unknown\", \"failure_reason\": \"invalid_password\", \"failed_attempts\": 4}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:41:44'),(179,'a80f8109-e4bd-4f7c-a712-5f76f276deec','SECURITY_ACCOUNT_LOCKOUT','USER','a80f8109-e4bd-4f7c-a712-5f76f276deec',NULL,'{\"lockoutUntil\": \"2026-10-29T08:56:44.501Z\", \"failedAttempts\": 5}','127.0.0.1',NULL,'2026-10-29 08:41:44'),(180,'a80f8109-e4bd-4f7c-a712-5f76f276deec','LOGIN_ATTEMPT','AUTH','a80f8109-e4bd-4f7c-a712-5f76f276deec',NULL,'{\"success\": false, \"is_locked\": true, \"portal_slug\": \"unknown\", \"failure_reason\": \"invalid_password\", \"failed_attempts\": 5}','::1','opencode/latest/2.0.22/cli','2026-10-29 08:41:44'),(181,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"portal\": \"super-admin\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::1','node','2026-10-29 08:42:41'),(182,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','node','2026-10-29 08:42:42'),(183,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','node','2026-10-29 08:42:42'),(184,'a80f8109-e4bd-4f7c-a712-5f76f276deec','LOGIN','USER','a80f8109-e4bd-4f7c-a712-5f76f276deec',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::1','node','2026-10-29 08:42:42'),(185,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"portal\": \"super-admin\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::1','node','2026-10-29 08:43:51'),(186,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','node','2026-10-29 08:43:52'),(187,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','node','2026-10-29 08:43:56'),(188,'a80f8109-e4bd-4f7c-a712-5f76f276deec','LOGIN','USER','a80f8109-e4bd-4f7c-a712-5f76f276deec',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::1','node','2026-10-29 08:43:58'),(189,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"portal\": \"super-admin\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::1','node','2026-10-29 08:50:28'),(190,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','node','2026-10-29 08:50:28'),(191,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','node','2026-10-29 08:50:31'),(192,'a80f8109-e4bd-4f7c-a712-5f76f276deec','LOGIN','USER','a80f8109-e4bd-4f7c-a712-5f76f276deec',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::1','node','2026-10-29 08:50:33'),(193,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"portal\": \"super-admin\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::1','node','2026-10-29 08:52:03'),(194,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','node','2026-10-29 08:52:03'),(195,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','node','2026-10-29 08:52:03'),(196,'a80f8109-e4bd-4f7c-a712-5f76f276deec','LOGIN','USER','a80f8109-e4bd-4f7c-a712-5f76f276deec',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::1','node','2026-10-29 08:52:04'),(197,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"portal\": \"super-admin\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::1','node','2026-10-29 08:53:14'),(198,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','node','2026-10-29 08:53:14'),(199,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','node','2026-10-29 08:53:14'),(200,'a80f8109-e4bd-4f7c-a712-5f76f276deec','LOGIN','USER','a80f8109-e4bd-4f7c-a712-5f76f276deec',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::1','node','2026-10-29 08:53:14'),(201,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"portal\": \"super-admin\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::1','node','2026-10-29 08:55:52'),(202,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','node','2026-10-29 08:56:04'),(203,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','node','2026-10-29 08:56:29'),(204,'a80f8109-e4bd-4f7c-a712-5f76f276deec','LOGIN','USER','a80f8109-e4bd-4f7c-a712-5f76f276deec',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::1','node','2026-10-29 08:56:43'),(205,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','node','2026-10-29 08:57:39'),(206,'a80f8109-e4bd-4f7c-a712-5f76f276deec','LOGIN','USER','a80f8109-e4bd-4f7c-a712-5f76f276deec',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::1','node','2026-10-29 08:57:40'),(207,'a80f8109-e4bd-4f7c-a712-5f76f276deec','LOGIN','USER','a80f8109-e4bd-4f7c-a712-5f76f276deec',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::1','node','2026-10-29 08:57:40'),(208,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"portal\": \"super-admin\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::1','node','2026-10-29 08:58:04'),(209,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','node','2026-10-29 08:58:17'),(210,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','node','2026-10-29 08:58:45'),(211,'a80f8109-e4bd-4f7c-a712-5f76f276deec','LOGIN','USER','a80f8109-e4bd-4f7c-a712-5f76f276deec',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::1','node','2026-10-29 08:59:00'),(212,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"portal\": \"super-admin\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::1','node','2026-10-29 08:59:39'),(213,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','node','2026-10-29 08:59:51'),(214,'922767e5-1d3b-4695-a444-db92f82057b3','LOGIN','USER','922767e5-1d3b-4695-a444-db92f82057b3',NULL,'{\"portal\": \"manager\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"manager\"}','::1','node','2026-10-29 09:00:20'),(215,'a80f8109-e4bd-4f7c-a712-5f76f276deec','LOGIN','USER','a80f8109-e4bd-4f7c-a712-5f76f276deec',NULL,'{\"portal\": \"employee\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"employee\"}','::1','node','2026-10-29 09:00:34'),(216,'c661ef02-aeb6-42e6-a31e-0f07ccf69989','LOGIN','USER','c661ef02-aeb6-42e6-a31e-0f07ccf69989',NULL,'{\"portal\": \"hr\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"hr\"}','::1','node','2026-10-29 09:01:03'),(217,'5e402aed-f6c0-4bdb-926a-f3310d27240f','LOGIN','USER','5e402aed-f6c0-4bdb-926a-f3310d27240f',NULL,'{\"portal\": \"super-admin\", \"success\": true, \"mfa_used\": false, \"strategy\": \"password\", \"portal_slug\": \"super-admin\"}','::1','node','2026-10-29 09:04:56');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `automation_workflows`
--

DROP TABLE IF EXISTS `automation_workflows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `automation_workflows` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `trigger_type` enum('SCHEDULE','EVENT','WEBHOOK') COLLATE utf8mb4_unicode_ci NOT NULL,
  `trigger_config` json NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `execution_count` int DEFAULT '0',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_tenant` (`tenant_id`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `automation_workflows_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `automation_workflows_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `automation_workflows`
--

LOCK TABLES `automation_workflows` WRITE;
/*!40000 ALTER TABLE `automation_workflows` DISABLE KEYS */;
INSERT INTO `automation_workflows` VALUES ('8b71edca-e369-415f-80da-e9199acee84e','368f5c88-12cd-11ed-861d-0242ac120002','Onboard Student upon Payment','Auto-invoice, auto-enroll, auto-welcome','EVENT','{\"event\": \"lead_payment\"}',1,0,'368f5c88-12cd-11ed-861d-0242ac120002','2026-10-29 07:10:38','2026-10-29 07:10:38');
/*!40000 ALTER TABLE `automation_workflows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `badges`
--

DROP TABLE IF EXISTS `badges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `badges` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `criteria` json NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `badges`
--

LOCK TABLES `badges` WRITE;
/*!40000 ALTER TABLE `badges` DISABLE KEYS */;
INSERT INTO `badges` VALUES ('2c11d575-def1-48e3-aad2-4709a965b74a','Quiz Master 1793257833315','Score 90%+ on any quiz session.','fa-trophy','{\"type\": \"quiz_score\", \"threshold\": 90}',1,'2026-10-29 07:10:33','2026-10-29 07:10:33'),('b3f1a000000000000000000000000001','Course Completed','Finished every lesson in a course from start to finish.','workspace_premium','{\"type\": \"COURSE_COMPLETION\", \"courses\": 1}',1,'2026-10-29 08:48:33','2026-10-29 08:48:33'),('b3f1a000000000000000000000000002','First Lesson','Completed your very first lesson.','flag','{\"type\": \"LESSON_COMPLETION\", \"lessons\": 1}',1,'2026-10-29 08:48:33','2026-10-29 08:48:33'),('b3f1a000000000000000000000000003','Module Master','Completed five course modules.','menu_book','{\"type\": \"MODULE_COMPLETION\", \"modules\": 5}',1,'2026-10-29 08:48:33','2026-10-29 08:48:33'),('b3f1a000000000000000000000000004','Quiz Whiz','Scored 100% on a published quiz.','quiz','{\"type\": \"QUIZ_PASS\", \"score\": 100}',1,'2026-10-29 08:48:33','2026-10-29 08:48:33'),('b3f1a000000000000000000000000005','Assignment Pro','Scored 90% or better on a graded assignment.','assignment_turned_in','{\"type\": \"ASSIGNMENT_GRADE\", \"score\": 90}',1,'2026-10-29 08:48:33','2026-10-29 08:48:33');
/*!40000 ALTER TABLE `badges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `batch_students`
--

DROP TABLE IF EXISTS `batch_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batch_students` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `batch_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_batch_student` (`batch_id`,`student_id`),
  KEY `idx_batch` (`batch_id`),
  KEY `idx_student` (`student_id`),
  CONSTRAINT `batch_students_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `batch_students_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batch_students`
--

LOCK TABLES `batch_students` WRITE;
/*!40000 ALTER TABLE `batch_students` DISABLE KEYS */;
/*!40000 ALTER TABLE `batch_students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `batches`
--

DROP TABLE IF EXISTS `batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batches` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `course_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tutor_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `max_capacity` int DEFAULT '30',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `batch_code` (`batch_code`),
  KEY `idx_course` (`course_id`),
  KEY `idx_tutor` (`tutor_id`),
  KEY `idx_code` (`batch_code`),
  CONSTRAINT `batches_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `batches_ibfk_2` FOREIGN KEY (`tutor_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batches`
--

LOCK TABLES `batches` WRITE;
/*!40000 ALTER TABLE `batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branches`
--

DROP TABLE IF EXISTS `branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branches` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_branches_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
INSERT INTO `branches` VALUES ('4a0d717e-d2f7-11f1-8dda-52177c28573a','Salem',1,'2026-10-28 17:44:56','2026-10-28 17:44:56'),('4a0d7d86-d2f7-11f1-8dda-52177c28573a','Erode',1,'2026-10-28 17:44:56','2026-10-28 17:44:56'),('4a0d80b5-d2f7-11f1-8dda-52177c28573a','Namakkal',1,'2026-10-28 17:44:56','2026-10-28 17:44:56');
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `break_glass_events`
--

DROP TABLE IF EXISTS `break_glass_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `break_glass_events` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `initiator_user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approver_user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `incident_ticket_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','ACTIVE','REVOKED','EXPIRED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `activated_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_bg_initiator` (`initiator_user_id`),
  CONSTRAINT `fk_bg_initiator` FOREIGN KEY (`initiator_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `break_glass_events`
--

LOCK TABLES `break_glass_events` WRITE;
/*!40000 ALTER TABLE `break_glass_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `break_glass_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calendar_event_types`
--

DROP TABLE IF EXISTS `calendar_event_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calendar_event_types` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'event',
  `default_duration_minutes` int DEFAULT '30',
  `color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#6366f1',
  `allowed_create_roles` json NOT NULL,
  `allowed_write_roles` json NOT NULL,
  `notification_target_roles` json NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_calendar_event_type_label` (`label`),
  KEY `idx_calendar_event_type_active` (`is_active`),
  KEY `idx_calendar_event_type_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendar_event_types`
--

LOCK TABLES `calendar_event_types` WRITE;
/*!40000 ALTER TABLE `calendar_event_types` DISABLE KEYS */;
INSERT INTO `calendar_event_types` VALUES ('evt_appointment','Appointment','Front-desk or visitor appointment','bi-calendar-check',30,'#64748b','[\"RECEPTION\", \"ADMIN\", \"SUPER_ADMIN\"]','[\"RECEPTION\", \"ADMIN\", \"SUPER_ADMIN\"]','[\"RECEPTION\"]',1,9,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('evt_call','Sales Call','Prospective client pitch or follow-up call','bi-telephone',30,'#f97316','[\"SALES\", \"ADMIN\", \"SUPER_ADMIN\"]','[\"SALES\", \"ADMIN\", \"SUPER_ADMIN\"]','[\"SALES\"]',1,8,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('evt_class','Class','Live academic lecture or training session','bi-mortarboard',60,'#10b981','[\"TUTOR\", \"ADMIN\", \"SUPER_ADMIN\"]','[\"TUTOR\", \"ADMIN\", \"SUPER_ADMIN\"]','[\"TUTOR\", \"STUDENT\"]',1,2,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('evt_deadline','Deadline','Task or assignment submission deadline','bi-clock-history',0,'#dc2626','[\"ALL\"]','[\"ALL\"]','[\"SELF\"]',1,11,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('evt_holiday','Holiday','Official company holiday or public day off','bi-sun',0,'#eab308','[\"ADMIN\", \"HR\", \"SUPER_ADMIN\"]','[\"ADMIN\", \"HR\", \"SUPER_ADMIN\"]','[\"ALL\"]',1,12,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('evt_interview','Interview','Candidate recruitment and hiring interviews','bi-person-video',45,'#3b82f6','[\"HR\", \"PROJECT_MANAGER\", \"ADMIN\", \"SUPER_ADMIN\"]','[\"HR\", \"PROJECT_MANAGER\", \"ADMIN\", \"SUPER_ADMIN\"]','[\"HR\", \"PROJECT_MANAGER\"]',1,1,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('evt_leave','Leave','Staff approved leave or time-off','bi-calendar-x',0,'#ef4444','[\"EMPLOYEE\", \"INTERN\", \"HR\", \"ADMIN\", \"SUPER_ADMIN\"]','[\"HR\", \"ADMIN\", \"SUPER_ADMIN\"]','[\"HR\", \"EMPLOYEE\", \"INTERN\"]',1,10,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('evt_meeting','Meeting','General team meeting or client consultation','bi-people',30,'#06b6d4','[\"HR\", \"PROJECT_MANAGER\", \"EMPLOYEE\", \"INTERN\", \"ADMIN\", \"SUPER_ADMIN\", \"FINANCE\", \"SALES\", \"RECEPTION\", \"TUTOR\", \"STUDENT\"]','[\"HR\", \"PROJECT_MANAGER\", \"EMPLOYEE\", \"INTERN\", \"ADMIN\", \"SUPER_ADMIN\"]','[\"SELF\", \"CREATOR_ROLE\"]',1,4,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('evt_milestone','Milestone','Project milestone or delivery deadline','bi-flag',0,'#ec4899','[\"PROJECT_MANAGER\", \"ADMIN\", \"SUPER_ADMIN\"]','[\"PROJECT_MANAGER\", \"ADMIN\", \"SUPER_ADMIN\"]','[\"PROJECT_MANAGER\", \"EMPLOYEE\"]',1,6,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('evt_payment','Payment','Invoice due date or salary disbursement','bi-cash-coin',0,'#14b8a6','[\"FINANCE\", \"ADMIN\", \"SUPER_ADMIN\"]','[\"FINANCE\", \"ADMIN\", \"SUPER_ADMIN\"]','[\"FINANCE\", \"ADMIN\"]',1,7,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('evt_quiz','Quiz','Examination or assessment session','bi-question-diamond',30,'#8b5cf6','[\"TUTOR\", \"ADMIN\", \"SUPER_ADMIN\"]','[\"TUTOR\", \"ADMIN\", \"SUPER_ADMIN\"]','[\"TUTOR\", \"STUDENT\"]',1,3,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('evt_training','Training','Employee or intern skill workshop','bi-journal-code',90,'#f59e0b','[\"HR\", \"ADMIN\", \"SUPER_ADMIN\"]','[\"HR\", \"ADMIN\", \"SUPER_ADMIN\"]','[\"HR\", \"EMPLOYEE\", \"INTERN\"]',1,5,'2026-10-29 08:49:59','2026-10-29 08:49:59');
/*!40000 ALTER TABLE `calendar_event_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calendar_events`
--

DROP TABLE IF EXISTS `calendar_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calendar_events` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `event_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEETING',
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `is_all_day` tinyint(1) DEFAULT '0',
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meeting_link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_users` json DEFAULT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `event_type_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recurrence_rule` json DEFAULT NULL,
  `recurrence_end_date` date DEFAULT NULL,
  `recurrence_instance_count` int DEFAULT NULL,
  `index_key` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_event_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cancelled_instance_dates` json DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `status` enum('scheduled','completed','cancelled','postponed') COLLATE utf8mb4_unicode_ci DEFAULT 'scheduled',
  `priority` enum('low','medium','high','urgent') COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_start` (`start_time`),
  KEY `idx_end` (`end_time`),
  KEY `idx_type` (`event_type`),
  KEY `idx_events_event_type_id` (`event_type_id`),
  KEY `idx_events_parent_id` (`parent_event_id`),
  KEY `idx_events_role` (`role`),
  KEY `idx_events_status` (`status`),
  CONSTRAINT `calendar_events_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendar_events`
--

LOCK TABLES `calendar_events` WRITE;
/*!40000 ALTER TABLE `calendar_events` DISABLE KEYS */;
INSERT INTO `calendar_events` VALUES ('afced5fc-d739-4d5b-a8a8-a6c82795a595','Leave: CASUAL - Staff Member','Approved leave: Calendar migration integration verification','LEAVE','2030-02-10 09:00:00','2030-02-10 18:00:00',1,NULL,NULL,'[\"f89fa77e-a263-46df-b40c-32ba3f14738e\"]','f89fa77e-a263-46df-b40c-32ba3f14738e','2026-10-28 18:08:14','2026-10-28 18:08:14','evt_leave',NULL,NULL,NULL,NULL,NULL,NULL,'[]','[]','{}','scheduled','medium','HR');
/*!40000 ALTER TABLE `calendar_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calendar_role_configs`
--

DROP TABLE IF EXISTS `calendar_role_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calendar_role_configs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `calendar_title` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Calendar',
  `default_view` enum('day','week','month','agenda') COLLATE utf8mb4_unicode_ci DEFAULT 'month',
  `work_start_time` time DEFAULT '09:00:00',
  `work_end_time` time DEFAULT '18:00:00',
  `show_others_events` tinyint(1) DEFAULT '1',
  `event_type_visibility` json DEFAULT NULL,
  `quick_create_types` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_calendar_role_config_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendar_role_configs`
--

LOCK TABLES `calendar_role_configs` WRITE;
/*!40000 ALTER TABLE `calendar_role_configs` DISABLE KEYS */;
INSERT INTO `calendar_role_configs` VALUES ('cfg_admin','ADMIN','Executive Operations Calendar','month','09:00:00','18:00:00',1,'[]','[\"evt_meeting\", \"evt_holiday\", \"evt_training\"]',1,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('cfg_client','CLIENT','Client Milestones & Reviews','month','09:00:00','18:00:00',0,'[\"evt_milestone\", \"evt_meeting\"]','[\"evt_meeting\"]',1,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('cfg_employee','EMPLOYEE','Employee Work Schedule','month','09:00:00','18:00:00',1,'[\"evt_meeting\", \"evt_training\", \"evt_milestone\", \"evt_leave\", \"evt_holiday\"]','[\"evt_meeting\", \"evt_leave\"]',1,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('cfg_finance','FINANCE','Finance & Billing Calendar','month','09:00:00','18:00:00',1,'[\"evt_payment\", \"evt_meeting\", \"evt_holiday\"]','[\"evt_payment\", \"evt_meeting\"]',1,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('cfg_hr','HR','HR & People Operations Calendar','month','09:00:00','18:00:00',1,'[\"evt_interview\", \"evt_leave\", \"evt_training\", \"evt_holiday\", \"evt_meeting\"]','[\"evt_interview\", \"evt_leave\", \"evt_training\"]',1,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('cfg_intern','INTERN','Intern Training & Tasks','week','09:00:00','18:00:00',1,'[\"evt_meeting\", \"evt_training\", \"evt_deadline\", \"evt_leave\", \"evt_holiday\"]','[\"evt_meeting\", \"evt_leave\"]',1,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('cfg_pm','PROJECT_MANAGER','Project Delivery & Milestones','month','09:00:00','18:00:00',1,'[\"evt_milestone\", \"evt_meeting\", \"evt_interview\", \"evt_deadline\", \"evt_holiday\"]','[\"evt_milestone\", \"evt_meeting\"]',1,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('cfg_reception','RECEPTION','Front Desk & Visitors','day','09:00:00','18:00:00',1,'[\"evt_appointment\", \"evt_meeting\", \"evt_interview\", \"evt_holiday\"]','[\"evt_appointment\"]',1,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('cfg_sales','SALES','Sales & Pitch Pipeline','day','09:00:00','18:00:00',1,'[\"evt_call\", \"evt_meeting\", \"evt_holiday\"]','[\"evt_call\", \"evt_meeting\"]',1,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('cfg_student','STUDENT','My Learning Schedule','month','09:00:00','18:00:00',0,'[\"evt_class\", \"evt_quiz\", \"evt_deadline\", \"evt_holiday\"]','[\"evt_deadline\"]',1,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('cfg_super_admin','SUPER_ADMIN','Master Operations Calendar','month','09:00:00','18:00:00',1,'[]','[\"evt_meeting\", \"evt_holiday\", \"evt_training\"]',1,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('cfg_tutor','TUTOR','Academic & Class Schedule','week','09:00:00','18:00:00',1,'[\"evt_class\", \"evt_quiz\", \"evt_meeting\", \"evt_holiday\"]','[\"evt_class\", \"evt_quiz\"]',1,'2026-10-29 08:49:59','2026-10-29 08:49:59'),('cfg_vendor','VENDOR','Vendor Schedule','month','09:00:00','18:00:00',0,'[\"evt_meeting\", \"evt_payment\"]','[\"evt_meeting\"]',1,'2026-10-29 08:49:59','2026-10-29 08:49:59');
/*!40000 ALTER TABLE `calendar_role_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_documents`
--

DROP TABLE IF EXISTS `candidate_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_documents` (
  `document_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `candidate_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `application_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `document_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size_bytes` bigint DEFAULT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_verified` tinyint(1) DEFAULT '0',
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`document_id`),
  KEY `idx_candidate` (`candidate_id`),
  KEY `idx_application` (`application_id`),
  CONSTRAINT `candidate_documents_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `candidate_documents_ibfk_2` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_documents`
--

LOCK TABLES `candidate_documents` WRITE;
/*!40000 ALTER TABLE `candidate_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `candidate_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidates`
--

DROP TABLE IF EXISTS `candidates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidates` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `job_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resume_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source` enum('INDEED','LINKEDIN','NAUKRI','REFERRAL','WEBSITE','MANUAL') COLLATE utf8mb4_unicode_ci DEFAULT 'MANUAL',
  `indeed_candidate_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('NEW','CONTACTED','SCREENING','INTERVIEWING','OFFER','HIRED','REJECTED') COLLATE utf8mb4_unicode_ci DEFAULT 'NEW',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_job` (`job_id`),
  KEY `idx_status` (`status`),
  KEY `idx_source` (`source`),
  CONSTRAINT `candidates_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidates`
--

LOCK TABLES `candidates` WRITE;
/*!40000 ALTER TABLE `candidates` DISABLE KEYS */;
/*!40000 ALTER TABLE `candidates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `career_applications`
--

DROP TABLE IF EXISTS `career_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `career_applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'General Application',
  `portfolio_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `experience_level` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Entry',
  `message` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'NEW',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `career_applications`
--

LOCK TABLES `career_applications` WRITE;
/*!40000 ALTER TABLE `career_applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `career_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_sessions`
--

DROP TABLE IF EXISTS `cart_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_sessions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `session_token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `items` json NOT NULL,
  `coupon_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  KEY `idx_session_token` (`session_token`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `cart_sessions_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_sessions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_sessions`
--

LOCK TABLES `cart_sessions` WRITE;
/*!40000 ALTER TABLE `cart_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificates` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `enrollment_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `certificate_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issue_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qr_code_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `certificate_number` (`certificate_number`),
  KEY `enrollment_id` (`enrollment_id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_course` (`course_id`),
  KEY `idx_certificate_number` (`certificate_number`),
  CONSTRAINT `certificates_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `certificates_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `certificates_ibfk_3` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
INSERT INTO `certificates` VALUES ('9f9f46a4-6596-4bbf-8b78-6f4558cc51f1','368f5c88-12cd-11ed-861d-0242ac120003','368f5c88-12cd-11ed-861d-0242ac120002','368f5c88-12cd-11ed-861d-0242ac120002','ETH-2026-N1793257837193','2026-08-21',NULL,'/assets/certs/mock-cert.pdf',NULL,1,'2026-10-29 07:10:37','2026-10-29 07:10:37');
/*!40000 ALTER TABLE `certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gst` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `communication_logs`
--

DROP TABLE IF EXISTS `communication_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `communication_logs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `channel` enum('EMAIL','SMS','WHATSAPP') COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sender` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','SENT','FAILED','DELIVERED','READ') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `provider_response` text COLLATE utf8mb4_unicode_ci,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `scheduled_at` datetime DEFAULT NULL,
  `sent_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `read_at` datetime DEFAULT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `template_id` (`template_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_recipient` (`recipient`),
  KEY `idx_status` (`status`),
  KEY `idx_channel` (`channel`),
  KEY `idx_sent_at` (`sent_at`),
  CONSTRAINT `communication_logs_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `communication_templates` (`id`) ON DELETE SET NULL,
  CONSTRAINT `communication_logs_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `communication_logs`
--

LOCK TABLES `communication_logs` WRITE;
/*!40000 ALTER TABLE `communication_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `communication_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `communication_templates`
--

DROP TABLE IF EXISTS `communication_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `communication_templates` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` enum('EMAIL','SMS','WHATSAPP') COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `variables` json DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_channel` (`channel`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `communication_templates`
--

LOCK TABLES `communication_templates` WRITE;
/*!40000 ALTER TABLE `communication_templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `communication_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_settings`
--

DROP TABLE IF EXISTS `company_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_settings` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gst` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_ifsc` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'INR',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_settings`
--

LOCK TABLES `company_settings` WRITE;
/*!40000 ALTER TABLE `company_settings` DISABLE KEYS */;
INSERT INTO `company_settings` VALUES ('7d24c18b-88b8-4a22-9387-452759381be6','Ethiroli Tech Solutions','8a007fc9d78faa49c1756f96:8ddd43f04d17af067831fbfe6ffc00ff:0b98994835becbbfe5c6cd58d0b87e','e5e4d9433e1262f1c446bc65:ef5e2d04b29036f1f6964366a596e533:a54cce828afe6e7959c1','f7183a36d1b3f81045f8c19b:6b379112e3e3c837b8cacaa4a723035b:aca1fcad9b3a7fdb562bcf0aa1c503c49aa80e','00adb96b1611caedc3de39de:e6fd1582e2dd9b42bd645f977874553d:8f33661e9a33e72b1c8cf6ee',NULL,'123 Tech Park, Coimbatore',NULL,NULL,NULL,'INR','2026-10-29 07:10:36','2026-10-29 07:10:36');
/*!40000 ALTER TABLE `company_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_inquiries`
--

DROP TABLE IF EXISTS `contact_inquiries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_inquiries` (
  `inquiry_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `inquiry_source` enum('WEBSITE','REFERRAL','SOCIAL_MEDIA','WALK_IN','PHONE','OTHER') COLLATE utf8mb4_unicode_ci DEFAULT 'WEBSITE',
  `is_read` tinyint(1) DEFAULT '0',
  `is_resolved` tinyint(1) DEFAULT '0',
  `resolved_at` datetime DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  `category` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'General',
  `status` enum('NEW','IN_PROGRESS','AWAITING_RESPONSE','MEETING_REQUESTED','RESOLVED','CLOSED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEW',
  `meeting_preference` datetime DEFAULT NULL,
  `assigned_to` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `legacy_message_id` int DEFAULT NULL,
  PRIMARY KEY (`inquiry_id`),
  UNIQUE KEY `uq_contact_legacy_message` (`legacy_message_id`),
  KEY `idx_email` (`email`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_is_resolved` (`is_resolved`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_inquiries`
--

LOCK TABLES `contact_inquiries` WRITE;
/*!40000 ALTER TABLE `contact_inquiries` DISABLE KEYS */;
INSERT INTO `contact_inquiries` VALUES ('38e5fc0b-e986-457b-9ad5-1e2055b08126','Local','Integration Check','integration-check@example.invalid',NULL,'Local isolated contact workflow test','Testing public enquiry persistence in the disposable database.','WEBSITE',0,0,NULL,NULL,'2026-10-28 18:00:33','2026-10-28 18:00:33',0,NULL,'General','NEW',NULL,NULL,NULL),('4fe00052-110d-4e34-aa8a-3e9956075484','Local','Meeting Check','meeting-check@example.invalid',NULL,'Local isolated meeting request test','Testing requested meeting persistence in the disposable database.','WEBSITE',0,0,NULL,NULL,'2026-10-28 18:01:30','2026-10-28 18:01:30',0,NULL,'Consultation','MEETING_REQUESTED','2030-01-15 15:30:00',NULL,NULL);
/*!40000 ALTER TABLE `contact_inquiries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_inquiry_attachments`
--

DROP TABLE IF EXISTS `contact_inquiry_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_inquiry_attachments` (
  `attachment_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `inquiry_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size_bytes` bigint DEFAULT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`attachment_id`),
  KEY `idx_inquiry` (`inquiry_id`),
  CONSTRAINT `contact_inquiry_attachments_ibfk_1` FOREIGN KEY (`inquiry_id`) REFERENCES `contact_inquiries` (`inquiry_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_inquiry_attachments`
--

LOCK TABLES `contact_inquiry_attachments` WRITE;
/*!40000 ALTER TABLE `contact_inquiry_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact_inquiry_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Website Inquiry',
  `message` text COLLATE utf8mb4_unicode_ci,
  `source` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'WEBSITE',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'General',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEW',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_type` enum('PERCENTAGE','FIXED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `min_order_value` decimal(10,2) DEFAULT '0.00',
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int DEFAULT NULL,
  `used_count` int DEFAULT '0',
  `valid_from` date NOT NULL,
  `valid_to` date NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `tenant_id` (`tenant_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_code` (`code`),
  KEY `idx_valid` (`valid_from`,`valid_to`),
  CONSTRAINT `coupons_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `coupons_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES ('0704210c-a883-4b11-8cc9-4dee20aaf330','46f13687-ec4b-468e-b8cf-c6803c0f8792','DISCOUNT1793257837717','PERCENTAGE',10.00,500.00,NULL,NULL,0,'2026-08-01','2026-12-31',1,'368f5c88-12cd-11ed-861d-0242ac120002','2026-10-29 07:10:37','2026-10-29 07:10:37');
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_completions`
--

DROP TABLE IF EXISTS `course_completions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_completions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `enrollment_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `completed_at` datetime NOT NULL,
  `certificate_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qr_code_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','ISSUED','EXPIRED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_course_completions_enrollment` (`enrollment_id`),
  KEY `idx_completions_student` (`student_id`),
  KEY `idx_completions_course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_completions`
--

LOCK TABLES `course_completions` WRITE;
/*!40000 ALTER TABLE `course_completions` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_completions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_modules`
--

DROP TABLE IF EXISTS `course_modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_modules` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `course_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module_order` int NOT NULL,
  `is_optional` tinyint(1) DEFAULT '0',
  `custom_duration_days` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `module_id` (`module_id`),
  KEY `idx_course_order` (`course_id`,`module_order`),
  CONSTRAINT `course_modules_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_modules_ibfk_2` FOREIGN KEY (`module_id`) REFERENCES `technology_modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_modules`
--

LOCK TABLES `course_modules` WRITE;
/*!40000 ALTER TABLE `course_modules` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_modules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thumbnail_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration_days` int NOT NULL,
  `fee` decimal(10,2) DEFAULT NULL,
  `tutor_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_tutor` (`tutor_id`),
  KEY `idx_code` (`code`),
  KEY `idx_courses_category` (`category`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`tutor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES ('mock-c-1','C-1','Mock Course',NULL,NULL,NULL,NULL,5,NULL,NULL,1,'2026-10-29 07:10:33','2026-10-29 07:10:33');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_handovers`
--

DROP TABLE IF EXISTS `customer_handovers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_handovers` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `deal_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `handover_to` enum('PROJECT_MANAGER','ACADEMIC_COORDINATOR','OPERATIONS') COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_person_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scope_summary` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `kickoff_date` date NOT NULL,
  `status` enum('PENDING','ACCEPTED','ONBOARDED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `handover_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `deal_id` (`deal_id`),
  KEY `client_id` (`client_id`),
  KEY `assigned_person_id` (`assigned_person_id`),
  KEY `handover_by` (`handover_by`),
  KEY `idx_handover_status` (`status`),
  CONSTRAINT `customer_handovers_ibfk_1` FOREIGN KEY (`deal_id`) REFERENCES `sales_deals` (`id`) ON DELETE CASCADE,
  CONSTRAINT `customer_handovers_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `customer_handovers_ibfk_3` FOREIGN KEY (`assigned_person_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `customer_handovers_ibfk_4` FOREIGN KEY (`handover_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_handovers`
--

LOCK TABLES `customer_handovers` WRITE;
/*!40000 ALTER TABLE `customer_handovers` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_handovers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `department_id` int NOT NULL AUTO_INCREMENT,
  `department_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`department_id`),
  UNIQUE KEY `department_name` (`department_name`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'Social Media','Company division',NULL,1,'2026-10-28 17:44:56','2026-10-28 17:44:56'),(2,'Technical','Company division',NULL,1,'2026-10-28 17:44:56','2026-10-28 17:44:56'),(3,'Content Creator','Company division',NULL,1,'2026-10-28 17:44:56','2026-10-28 17:44:56'),(4,'Marketing','Company division',NULL,1,'2026-10-28 17:44:56','2026-10-28 17:44:56');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `device_registrations`
--

DROP TABLE IF EXISTS `device_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `device_registrations` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `platform` enum('IOS','ANDROID','WEB') COLLATE utf8mb4_unicode_ci NOT NULL,
  `push_token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `app_version` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_active_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_device` (`user_id`,`device_id`),
  KEY `idx_tenant` (`tenant_id`),
  CONSTRAINT `device_registrations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `device_registrations_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device_registrations`
--

LOCK TABLES `device_registrations` WRITE;
/*!40000 ALTER TABLE `device_registrations` DISABLE KEYS */;
INSERT INTO `device_registrations` VALUES ('8f5bae36-8b2c-44ad-8986-5f35659ca37d','368f5c88-12cd-11ed-861d-0242ac120002','368f5c88-12cd-11ed-861d-0242ac120002','iphone-pro-15-mock-id','IOS','apns-dev-token-string-value-hash',NULL,1,'2026-10-29 12:40:38','2026-10-29 07:10:38','2026-10-29 07:10:38');
/*!40000 ALTER TABLE `device_registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doubts`
--

DROP TABLE IF EXISTS `doubts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doubts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lesson_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `code_snippet` text COLLATE utf8mb4_unicode_ci,
  `screenshot_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('OPEN','IN_REVIEW','RESOLVED') COLLATE utf8mb4_unicode_ci DEFAULT 'OPEN',
  `assigned_tutor_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolution_notes` text COLLATE utf8mb4_unicode_ci,
  `resolved_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_course_status` (`course_id`,`status`),
  KEY `idx_student` (`student_id`),
  KEY `idx_tutor` (`assigned_tutor_id`),
  CONSTRAINT `doubts_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `doubts_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `doubts_ibfk_3` FOREIGN KEY (`assigned_tutor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doubts`
--

LOCK TABLES `doubts` WRITE;
/*!40000 ALTER TABLE `doubts` DISABLE KEYS */;
/*!40000 ALTER TABLE `doubts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_daily_quota`
--

DROP TABLE IF EXISTS `email_daily_quota`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_daily_quota` (
  `quota_date` date NOT NULL,
  `emails_sent` int DEFAULT '0',
  `max_limit` int DEFAULT '300',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`quota_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_daily_quota`
--

LOCK TABLES `email_daily_quota` WRITE;
/*!40000 ALTER TABLE `email_daily_quota` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_daily_quota` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_documents`
--

DROP TABLE IF EXISTS `employee_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_documents` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `employee_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_type` enum('RESUME','OFFER_LETTER','APPOINTMENT_LETTER','NDA','ID_PROOF','DEGREE_CERTIFICATE','EXPERIENCE_LETTER','PAYSLIP','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size_bytes` bigint DEFAULT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','VERIFIED','REJECTED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `verified_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `uploaded_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `verified_by` (`verified_by`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_type` (`document_type`),
  KEY `idx_status` (`status`),
  CONSTRAINT `employee_documents_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `employee_documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `employee_documents_ibfk_3` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_documents`
--

LOCK TABLES `employee_documents` WRITE;
/*!40000 ALTER TABLE `employee_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `designation` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_joining` date DEFAULT NULL,
  `salary_structure_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_ifsc` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pf_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uan` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `blood_group` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `branch_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `sub_role_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reporting_manager_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_status` enum('ACTIVE','INACTIVE','ON_LEAVE','ARCHIVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `employee_code` (`employee_code`),
  KEY `idx_employee_code` (`employee_code`),
  KEY `idx_employee_branch_dept` (`branch_id`,`department`),
  KEY `idx_employee_department_id` (`department_id`),
  KEY `idx_employee_subrole` (`sub_role_id`),
  KEY `idx_employee_manager` (`reporting_manager_id`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_employee_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_employee_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_employee_manager` FOREIGN KEY (`reporting_manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_employee_subrole` FOREIGN KEY (`sub_role_id`) REFERENCES `organizational_sub_roles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES ('0641e650-be7c-4a0a-92cb-24459c294843','d0ad4394-a479-4c93-9b30-179d9d09d05d','ETH-EMP-2026-001','Technical','AI Automation Employee','2026-10-07',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-29 05:49:31','2026-10-29 05:49:31','4a0d717e-d2f7-11f1-8dda-52177c28573a',2,'4a152e3a-d2f7-11f1-8dda-52177c28573a',NULL,'ACTIVE'),('13591b28-a4a3-4469-89b2-ef44c01efbf3','e9941b4c-c368-4337-98e5-361a9845de01','ETH-EMP-2026-004','Content Creator','Video Editor','2026-10-06',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-29 05:49:32','2026-10-29 05:49:32','4a0d717e-d2f7-11f1-8dda-52177c28573a',3,'4a151825-d2f7-11f1-8dda-52177c28573a',NULL,'ACTIVE'),('2cc57e8a-de40-4241-8746-1863b0c521c2','5b594108-98b0-4cde-b908-80928e642998','ETH-HR-2026-001','Human Resources','HR','2026-09-24',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-29 05:49:33','2026-10-29 05:49:33','4a0d717e-d2f7-11f1-8dda-52177c28573a',NULL,NULL,NULL,'ACTIVE'),('36e1d42d-9246-4b4e-bf68-88ff3894ec5d','2c8fcffb-5516-4eea-99e1-dc970454b8c2','ETH-EMP-2026-006','Marketing','BDA','2026-10-12',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-29 05:49:32','2026-10-29 05:49:32','4a0d717e-d2f7-11f1-8dda-52177c28573a',4,'4a1523ea-d2f7-11f1-8dda-52177c28573a',NULL,'ACTIVE'),('52e6044e-d359-11f1-83f3-559b0b62ccd9','684b5dce-8c09-4128-b8eb-1e25bb2207ac','TEST-EMPLOYEE-001','Technical','Test Employee','2026-10-29',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-29 05:26:42','2026-10-29 06:14:07',NULL,NULL,NULL,NULL,'ACTIVE'),('a2ae5574-56fb-4aa6-b74e-96cefe942b71','6987ebe0-6585-4ad4-b030-521fca873756','ETH-EMP-2026-002','Technical','AI Automation Employee','2026-09-24',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-29 05:49:31','2026-10-29 05:49:31','4a0d717e-d2f7-11f1-8dda-52177c28573a',2,'4a152e3a-d2f7-11f1-8dda-52177c28573a',NULL,'ACTIVE'),('a8e8c32d-a7d1-46e9-98a5-717f13c9a5b3','76be4023-e449-409e-a129-a1cfd95ec590','ETH-EMP-2026-003','Technical','Web Developer','2026-09-24',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-29 05:49:31','2026-10-29 05:49:31','4a0d717e-d2f7-11f1-8dda-52177c28573a',2,'4a152fed-d2f7-11f1-8dda-52177c28573a',NULL,'ACTIVE'),('ae8e454f-524e-49e8-8a29-55dd53ee4e48','6e96d5e7-db7f-4b38-ad35-8d44477279fa','ETH-EMP-2026-005','Content Creator','Content Writer','2026-10-12',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-29 05:49:32','2026-10-29 05:49:32','4a0d717e-d2f7-11f1-8dda-52177c28573a',3,'4a150c78-d2f7-11f1-8dda-52177c28573a',NULL,'ACTIVE'),('c1985613-d358-11f1-83f3-559b0b62ccd9','a80f8109-e4bd-4f7c-a712-5f76f276deec','CODEX-E001','Technical','Test Employee','2026-10-29',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-29 05:22:38','2026-10-29 06:14:07',NULL,NULL,NULL,NULL,'ACTIVE');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_by_tutor_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enrolled_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `progress_percentage` decimal(5,2) DEFAULT '0.00',
  `status` enum('ACTIVE','COMPLETED','DROPPED') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `due_date` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_enrollment` (`student_id`,`course_id`),
  KEY `idx_enrollment_student` (`student_id`),
  KEY `idx_enrollment_course` (`course_id`),
  KEY `idx_enrollment_tutor` (`assigned_by_tutor_id`),
  KEY `idx_enrollment_status` (`status`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollments_ibfk_3` FOREIGN KEY (`assigned_by_tutor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exit_requests`
--

DROP TABLE IF EXISTS `exit_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exit_requests` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `employee_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resignation_date` date NOT NULL,
  `requested_last_day` date NOT NULL,
  `approved_last_day` date DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `notice_period_days` int DEFAULT '30',
  `status` enum('SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','WITHDRAWN','COMPLETED') COLLATE utf8mb4_unicode_ci DEFAULT 'SUBMITTED',
  `exit_interview_notes` text COLLATE utf8mb4_unicode_ci,
  `approved_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `exit_requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exit_requests_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exit_requests`
--

LOCK TABLES `exit_requests` WRITE;
/*!40000 ALTER TABLE `exit_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `exit_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feature_flags`
--

DROP TABLE IF EXISTS `feature_flags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feature_flags` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `flag_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `environment` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PROD',
  `rollout_percentage` int NOT NULL DEFAULT '100',
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `flag_key` (`flag_key`),
  KEY `idx_flag_key` (`flag_key`),
  KEY `idx_flag_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feature_flags`
--

LOCK TABLES `feature_flags` WRITE;
/*!40000 ALTER TABLE `feature_flags` DISABLE KEYS */;
INSERT INTO `feature_flags` VALUES ('908ea808-d375-11f1-83f3-559b0b62ccd9','enable_ai_analytics','Gemini AI Telemetry','Enables predictive student drop-off analytics and AI curriculum assistant.','PROD',100,1,NULL,NULL,'2026-10-29 08:48:51','2026-10-29 08:48:51'),('908eac96-d375-11f1-83f3-559b0b62ccd9','enable_stripe_billing','Stripe International Gateway','Allows USD and multi-currency credit card settlements.','PROD',100,1,NULL,NULL,'2026-10-29 08:48:51','2026-10-29 08:48:51'),('908eae51-d375-11f1-83f3-559b0b62ccd9','enable_gamification_v2','Gamification Badges v2.0','New leaderboard algorithms and seasonal streak challenges.','CANARY',50,1,NULL,NULL,'2026-10-29 08:48:51','2026-10-29 08:48:51'),('908eaf41-d375-11f1-83f3-559b0b62ccd9','enable_automated_whatsapp','Automated WhatsApp Workflows','Dispatches interview and attendance notifications via WhatsApp gateway.','PROD',100,1,NULL,NULL,'2026-10-29 08:48:51','2026-10-29 08:48:51'),('908eb029-d375-11f1-83f3-559b0b62ccd9','enable_dark_mode_global','Global OLED Dark Theme','Platform-wide dark theme toggle for high-density portals.','PROD',100,1,NULL,NULL,'2026-10-29 08:48:51','2026-10-29 08:48:51');
/*!40000 ALTER TABLE `feature_flags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `financial_budgets`
--

DROP TABLE IF EXISTS `financial_budgets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `financial_budgets` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `fiscal_year` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quarter` enum('Q1','Q2','Q3','Q4','ANNUAL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` enum('ENGINEERING','MARKETING','OPERATIONS','HUMAN_RESOURCES','GENERAL_ADMIN','SALES') COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `allocated_amount` decimal(12,2) NOT NULL,
  `spent_amount` decimal(12,2) DEFAULT '0.00',
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'INR',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_budget_dept` (`fiscal_year`,`quarter`,`department`,`category`),
  KEY `created_by` (`created_by`),
  KEY `idx_fiscal_dept` (`fiscal_year`,`department`),
  CONSTRAINT `financial_budgets_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `financial_budgets`
--

LOCK TABLES `financial_budgets` WRITE;
/*!40000 ALTER TABLE `financial_budgets` DISABLE KEYS */;
/*!40000 ALTER TABLE `financial_budgets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `financial_refunds`
--

DROP TABLE IF EXISTS `financial_refunds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `financial_refunds` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `invoice_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'INR',
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','APPROVED','PROCESSED','REJECTED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `gateway_refund_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `utr_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requested_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `processed_at` datetime DEFAULT NULL,
  `processed_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `payment_id` (`payment_id`),
  KEY `processed_by` (`processed_by`),
  KEY `idx_refund_status` (`status`),
  KEY `idx_invoice` (`invoice_id`),
  CONSTRAINT `financial_refunds_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL,
  CONSTRAINT `financial_refunds_ibfk_2` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `financial_refunds_ibfk_3` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `financial_refunds`
--

LOCK TABLES `financial_refunds` WRITE;
/*!40000 ALTER TABLE `financial_refunds` DISABLE KEYS */;
/*!40000 ALTER TABLE `financial_refunds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_post_votes`
--

DROP TABLE IF EXISTS `forum_post_votes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_post_votes` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `post_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vote` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_post_user` (`post_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `forum_post_votes_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `forum_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `forum_post_votes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_post_votes`
--

LOCK TABLES `forum_post_votes` WRITE;
/*!40000 ALTER TABLE `forum_post_votes` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_post_votes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_posts`
--

DROP TABLE IF EXISTS `forum_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_posts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `course_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_pinned` tinyint(1) DEFAULT '0',
  `is_locked` tinyint(1) DEFAULT '0',
  `view_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  PRIMARY KEY (`id`),
  KEY `author_id` (`author_id`),
  KEY `idx_course` (`course_id`),
  KEY `idx_pinned` (`is_pinned`),
  KEY `idx_forum_category` (`category`),
  CONSTRAINT `forum_posts_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `forum_posts_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_posts`
--

LOCK TABLES `forum_posts` WRITE;
/*!40000 ALTER TABLE `forum_posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_replies`
--

DROP TABLE IF EXISTS `forum_replies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_replies` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `post_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_best_answer` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `author_id` (`author_id`),
  KEY `idx_post` (`post_id`),
  KEY `idx_best` (`is_best_answer`),
  CONSTRAINT `forum_replies_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `forum_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `forum_replies_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_replies`
--

LOCK TABLES `forum_replies` WRITE;
/*!40000 ALTER TABLE `forum_replies` DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_replies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `holidays`
--

DROP TABLE IF EXISTS `holidays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `holidays` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `is_restricted` tinyint(1) DEFAULT '0',
  `restricted_to` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_holiday_date` (`date`),
  KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `holidays`
--

LOCK TABLES `holidays` WRITE;
/*!40000 ALTER TABLE `holidays` DISABLE KEYS */;
INSERT INTO `holidays` VALUES ('1372fdcd-091d-5cda-af9c-555b5a594088','General Holiday','2026-10-19',0,NULL,'2026-10-29 08:27:24','2026-10-29 08:27:24'),('2e7db1a4-7734-5310-9835-1f86c6404571','Weekly Holiday - Sunday','2026-10-04',0,NULL,'2026-10-29 08:27:24','2026-10-29 08:27:24'),('8665b186-d375-11f1-83f3-559b0b62ccd9','Republic Day','2026-01-26',0,NULL,'2026-10-29 08:48:34','2026-10-29 08:48:34'),('8665c100-d375-11f1-83f3-559b0b62ccd9','Holi','2026-03-04',0,NULL,'2026-10-29 08:48:34','2026-10-29 08:48:34'),('8665c382-d375-11f1-83f3-559b0b62ccd9','Mahashivratri','2026-02-15',0,NULL,'2026-10-29 08:48:34','2026-10-29 08:48:34'),('8665c5a5-d375-11f1-83f3-559b0b62ccd9','Ugadi','2026-03-19',0,NULL,'2026-10-29 08:48:34','2026-10-29 08:48:34'),('8665c727-d375-11f1-83f3-559b0b62ccd9','Dr. Ambedkar Jayanti','2026-04-14',0,NULL,'2026-10-29 08:48:34','2026-10-29 08:48:34'),('8665c8c7-d375-11f1-83f3-559b0b62ccd9','Good Friday','2026-04-03',0,NULL,'2026-10-29 08:48:34','2026-10-29 08:48:34'),('8665ca22-d375-11f1-83f3-559b0b62ccd9','May Day','2026-05-01',0,NULL,'2026-10-29 08:48:34','2026-10-29 08:48:34'),('8665cb6d-d375-11f1-83f3-559b0b62ccd9','Independence Day','2026-08-15',0,NULL,'2026-10-29 08:48:34','2026-10-29 08:48:34'),('8665cccd-d375-11f1-83f3-559b0b62ccd9','Ganesh Chaturthi','2026-09-14',0,NULL,'2026-10-29 08:48:34','2026-10-29 08:48:34'),('8665ce54-d375-11f1-83f3-559b0b62ccd9','Gandhi Jayanti','2026-10-02',0,NULL,'2026-10-29 08:48:34','2026-10-29 08:48:34'),('8665cfa5-d375-11f1-83f3-559b0b62ccd9','Dussehra','2026-10-20',0,NULL,'2026-10-29 08:48:34','2026-10-29 08:48:34'),('8665d0ea-d375-11f1-83f3-559b0b62ccd9','Diwali Balipratipada','2026-11-08',0,NULL,'2026-10-29 08:48:34','2026-10-29 08:48:34'),('8665d28f-d375-11f1-83f3-559b0b62ccd9','Christmas','2026-12-25',0,NULL,'2026-10-29 08:48:34','2026-10-29 08:48:34'),('8e5537e7-18d2-59a3-8945-cdcb3fa2492c','Weekly Holiday - Sunday','2026-10-18',0,NULL,'2026-10-29 08:27:24','2026-10-29 08:27:24'),('9d181872-2de4-5935-b897-3c629d8a9e42','Weekly Holiday - Sunday','2026-10-25',0,NULL,'2026-10-29 08:27:24','2026-10-29 08:27:24'),('d209bca4-040a-54c3-99a1-65eb04f0d927','Weekly Holiday - Sunday','2026-09-27',0,NULL,'2026-10-29 08:27:24','2026-10-29 08:27:24'),('d6307385-e383-5455-b7e9-57e03a3ee03e','Saturday Holiday','2026-10-10',0,NULL,'2026-10-29 08:27:24','2026-10-29 08:27:24'),('ee47259a-3ebb-5d46-8fed-c07c4b16ad1f','Weekly Holiday - Sunday','2026-10-11',0,NULL,'2026-10-29 08:27:24','2026-10-29 08:27:24'),('faccabb2-9474-4a68-b034-bf94cd7eaffa','Test Holiday 1793257836261','2027-12-20',0,NULL,'2026-10-29 07:10:36','2026-10-29 07:10:36');
/*!40000 ALTER TABLE `holidays` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_issued_documents`
--

DROP TABLE IF EXISTS `hr_issued_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_issued_documents` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_role` enum('EMPLOYEE','INTERN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_type` enum('OFFER_LETTER','APPOINTMENT_LETTER','INTERNSHIP_CERTIFICATE','EMPLOYMENT_CERTIFICATE','EXPERIENCE_LETTER','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `storage_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size_bytes` bigint unsigned NOT NULL,
  `uploaded_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `storage_key` (`storage_key`),
  KEY `fk_hr_docs_uploader` (`uploaded_by`),
  KEY `idx_hr_docs_recipient` (`recipient_user_id`,`created_at`),
  CONSTRAINT `fk_hr_docs_recipient` FOREIGN KEY (`recipient_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hr_docs_uploader` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_issued_documents`
--

LOCK TABLES `hr_issued_documents` WRITE;
/*!40000 ALTER TABLE `hr_issued_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_issued_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_requests`
--

DROP TABLE IF EXISTS `hr_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_requests` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requester_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requester_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'EMPLOYEE',
  `request_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'MEDIUM',
  `details` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_req_status` (`status`),
  KEY `idx_req_type` (`request_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_requests`
--

LOCK TABLES `hr_requests` WRITE;
/*!40000 ALTER TABLE `hr_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incoming_webhook_logs`
--

DROP TABLE IF EXISTS `incoming_webhook_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incoming_webhook_logs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payload` json DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'PROCESSED',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incoming_webhook_logs`
--

LOCK TABLES `incoming_webhook_logs` WRITE;
/*!40000 ALTER TABLE `incoming_webhook_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `incoming_webhook_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `integrations`
--

DROP TABLE IF EXISTS `integrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `integrations` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `service_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('SECURITY','PAYMENTS','COMMUNICATION','CALENDAR','ANALYTICS','AUTOMATION','CRM','DEVTOOLS','JOBS') COLLATE utf8mb4_unicode_ci NOT NULL,
  `config` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_enabled` tinyint(1) DEFAULT '0',
  `connection_status` enum('PENDING','CONNECTED','ERROR','DISABLED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `last_synced_at` datetime DEFAULT NULL,
  `sync_log` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `service_name` (`service_name`),
  KEY `idx_category` (`category`),
  KEY `idx_enabled` (`is_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `integrations`
--

LOCK TABLES `integrations` WRITE;
/*!40000 ALTER TABLE `integrations` DISABLE KEYS */;
INSERT INTO `integrations` VALUES ('4c6a3b4e-0602-4be6-bb16-bc49f5e53cee','twilio-1793257834978','COMMUNICATION','40a2cb9b38546478bbbdd0ad:d0f685e50329bb9fddb1e68502182b37:29bf3408b436a7659ad35b51c5970dc6a3a8bab00c2ba15ebf7d040e26dde38b0e1361b444d9119408c68e41bd94935d022c250b87165acd5236b52e85fc6d9235a2f2',1,'PENDING',NULL,NULL,'2026-10-29 07:10:34','2026-10-29 07:10:34');
/*!40000 ALTER TABLE `integrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interns`
--

DROP TABLE IF EXISTS `interns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interns` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mentor_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `college_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stipend` decimal(10,2) DEFAULT '0.00',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `employee_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `branch_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `sub_role_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reporting_manager_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_status` enum('ACTIVE','INACTIVE','COMPLETED','ARCHIVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `project_target` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Full Stack Development',
  `progress` int DEFAULT '10',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `uq_intern_employee_code` (`employee_code`),
  KEY `idx_mentor` (`mentor_id`),
  KEY `idx_intern_branch_department` (`branch_id`,`department_id`),
  KEY `idx_intern_subrole` (`sub_role_id`),
  KEY `idx_intern_manager` (`reporting_manager_id`),
  KEY `fk_intern_department` (`department_id`),
  CONSTRAINT `fk_intern_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_intern_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_intern_manager` FOREIGN KEY (`reporting_manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_intern_subrole` FOREIGN KEY (`sub_role_id`) REFERENCES `organizational_sub_roles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `interns_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `interns_ibfk_2` FOREIGN KEY (`mentor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interns`
--

LOCK TABLES `interns` WRITE;
/*!40000 ALTER TABLE `interns` DISABLE KEYS */;
INSERT INTO `interns` VALUES ('c198f8d8-d358-11f1-83f3-559b0b62ccd9','429d254c-ece3-4e52-b445-0e87b541b5f4','fae21754-aae1-437e-9256-45ff69f09700','Local Test University',0.00,'2026-10-29','2027-01-29','2026-10-29 05:22:38','2026-10-29 06:14:07','CODEX-I001',NULL,NULL,NULL,NULL,'ACTIVE','ACTIVE','Full Stack Development',10);
/*!40000 ALTER TABLE `interns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interview_schedules`
--

DROP TABLE IF EXISTS `interview_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interview_schedules` (
  `interview_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `application_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `interview_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `interview_round` int DEFAULT '1',
  `scheduled_date` date NOT NULL,
  `scheduled_time` time DEFAULT NULL,
  `duration_minutes` int DEFAULT '60',
  `timezone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Asia/Kolkata',
  `interview_mode` enum('ONLINE','OFFLINE','PHONE') COLLATE utf8mb4_unicode_ci DEFAULT 'ONLINE',
  `location_link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `interviewer_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `interviewer_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `interviewer_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `is_confirmed` tinyint(1) DEFAULT '0',
  `is_completed` tinyint(1) DEFAULT '0',
  `feedback_text` text COLLATE utf8mb4_unicode_ci,
  `feedback_score` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`interview_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_application` (`application_id`),
  KEY `idx_scheduled` (`scheduled_date`,`scheduled_time`),
  CONSTRAINT `interview_schedules_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `interview_schedules_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interview_schedules`
--

LOCK TABLES `interview_schedules` WRITE;
/*!40000 ALTER TABLE `interview_schedules` DISABLE KEYS */;
/*!40000 ALTER TABLE `interview_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interviews`
--

DROP TABLE IF EXISTS `interviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interviews` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `candidate_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `round` enum('ROUND_1','ROUND_2','HR_ROUND') COLLATE utf8mb4_unicode_ci NOT NULL,
  `interviewer_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scheduled_at` datetime NOT NULL,
  `duration_minutes` int DEFAULT '60',
  `meeting_link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `feedback` text COLLATE utf8mb4_unicode_ci,
  `rating` int DEFAULT '0',
  `status` enum('SCHEDULED','COMPLETED','CANCELLED','NO_SHOW') COLLATE utf8mb4_unicode_ci DEFAULT 'SCHEDULED',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `interviewer_id` (`interviewer_id`),
  KEY `idx_candidate` (`candidate_id`),
  KEY `idx_round` (`round`),
  KEY `idx_status` (`status`),
  KEY `idx_scheduled` (`scheduled_at`),
  CONSTRAINT `interviews_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `interviews_ibfk_2` FOREIGN KEY (`interviewer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interviews`
--

LOCK TABLES `interviews` WRITE;
/*!40000 ALTER TABLE `interviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `interviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `invoice_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issue_date` date NOT NULL,
  `due_date` date NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `gst_rate` decimal(5,2) DEFAULT '0.00',
  `gst_amount` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `status` enum('DRAFT','SENT','PAID','OVERDUE','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `is_recurring` tinyint(1) DEFAULT '0',
  `recurring_schedule_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sent_at` datetime DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `client_id` (`client_id`),
  KEY `student_id` (`student_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_status` (`status`),
  KEY `idx_due_date` (`due_date`),
  KEY `idx_invoice_number` (`invoice_number`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `invoices_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_board_posts`
--

DROP TABLE IF EXISTS `job_board_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_board_posts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `job_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `platform` enum('LINKEDIN','NAUKRI','INDEED','INTERNSHALA') COLLATE utf8mb4_unicode_ci NOT NULL,
  `external_post_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `posted_at` datetime DEFAULT NULL,
  `status` enum('PENDING','POSTED','FAILED','EXPIRED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `platform_response` json DEFAULT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_job_platform` (`job_id`,`platform`),
  KEY `created_by` (`created_by`),
  KEY `idx_job` (`job_id`),
  KEY `idx_platform` (`platform`),
  KEY `idx_status` (`status`),
  CONSTRAINT `job_board_posts_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `job_board_posts_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_board_posts`
--

LOCK TABLES `job_board_posts` WRITE;
/*!40000 ALTER TABLE `job_board_posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_board_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_categories`
--

DROP TABLE IF EXISTS `job_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_categories`
--

LOCK TABLES `job_categories` WRITE;
/*!40000 ALTER TABLE `job_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_types`
--

DROP TABLE IF EXISTS `job_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_types` (
  `job_type_id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`job_type_id`),
  UNIQUE KEY `type_name` (`type_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_types`
--

LOCK TABLES `job_types` WRITE;
/*!40000 ALTER TABLE `job_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `salary_range` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `required_skills` json DEFAULT NULL,
  `status` enum('DRAFT','OPEN','CLOSED','FILLED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `posted_at` datetime DEFAULT NULL,
  `closed_at` datetime DEFAULT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_status` (`status`),
  KEY `idx_title` (`title`),
  CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leads`
--

DROP TABLE IF EXISTS `leads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leads` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source` enum('WEBSITE','REFERRAL','SOCIAL_MEDIA','WALK_IN','PHONE','INDEED','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OTHER',
  `status` enum('NEW','CONTACTED','DEMO','COUNSELLING','ADMISSION','PAYMENT','LOST') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEW',
  `assigned_to` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `follow_up_date` date DEFAULT NULL,
  `converted_at` timestamp NULL DEFAULT NULL,
  `lost_reason` text COLLATE utf8mb4_unicode_ci,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `assigned_to` (`assigned_to`),
  KEY `created_by` (`created_by`),
  KEY `idx_leads_company` (`company_name`),
  CONSTRAINT `leads_ibfk_1` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `leads_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leads`
--

LOCK TABLES `leads` WRITE;
/*!40000 ALTER TABLE `leads` DISABLE KEYS */;
/*!40000 ALTER TABLE `leads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_balances`
--

DROP TABLE IF EXISTS `leave_balances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_balances` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leave_type` enum('CASUAL','SICK','EARNED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `financial_year` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_credited` decimal(4,1) NOT NULL DEFAULT '0.0',
  `consumed` decimal(4,1) NOT NULL DEFAULT '0.0',
  `balance` decimal(4,1) GENERATED ALWAYS AS ((`total_credited` - `consumed`)) STORED,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_year_type` (`user_id`,`financial_year`,`leave_type`),
  KEY `idx_user` (`user_id`),
  KEY `idx_fin_year` (`financial_year`),
  CONSTRAINT `leave_balances_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_balances`
--

LOCK TABLES `leave_balances` WRITE;
/*!40000 ALTER TABLE `leave_balances` DISABLE KEYS */;
/*!40000 ALTER TABLE `leave_balances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leaves`
--

DROP TABLE IF EXISTS `leaves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leaves` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leave_type` enum('CASUAL','SICK','EARNED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `status` enum('PENDING','APPROVED','REJECTED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `approved_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_chain_step` int DEFAULT '1',
  `review_note` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_dates` (`start_date`,`end_date`),
  CONSTRAINT `leaves_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `leaves_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leaves`
--

LOCK TABLES `leaves` WRITE;
/*!40000 ALTER TABLE `leaves` DISABLE KEYS */;
INSERT INTO `leaves` VALUES ('91c56aab-563d-4df9-95f0-3bba2ae84443','f89fa77e-a263-46df-b40c-32ba3f14738e','CASUAL','2030-02-10','2030-02-10','Isolated API workflow verification','APPROVED','44f55fc2-753e-4d9b-b9d5-2ff1e0f994dc',1,'Approved during isolated local integration check','2026-10-28 18:06:24','2026-10-28 18:06:24'),('e0fce45a-a213-42ba-9876-146f7ac179ac','f89fa77e-a263-46df-b40c-32ba3f14738e','CASUAL','2030-02-11','2030-02-11','Calendar migration integration verification','APPROVED','44f55fc2-753e-4d9b-b9d5-2ff1e0f994dc',1,'Verified against isolated calendar schema','2026-10-28 18:08:12','2026-10-28 18:08:14');
/*!40000 ALTER TABLE `leaves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lesson_blocks`
--

DROP TABLE IF EXISTS `lesson_blocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_blocks` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `lesson_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `block_type` enum('VIDEO','MARKDOWN','CODE_PLAYGROUND','QUIZ_EMBED','RESOURCE_DOWNLOAD','CALLOUT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `block_order` int NOT NULL DEFAULT '1',
  `content_payload` json NOT NULL,
  `is_interactive` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lesson_block_order` (`lesson_id`,`block_order`),
  CONSTRAINT `lesson_blocks_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson_blocks`
--

LOCK TABLES `lesson_blocks` WRITE;
/*!40000 ALTER TABLE `lesson_blocks` DISABLE KEYS */;
/*!40000 ALTER TABLE `lesson_blocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lesson_progress`
--

DROP TABLE IF EXISTS `lesson_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_progress` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `enrollment_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lesson_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('NOT_STARTED','IN_PROGRESS','COMPLETED') COLLATE utf8mb4_unicode_ci DEFAULT 'NOT_STARTED',
  `seconds_watched` int DEFAULT '0',
  `is_completed` tinyint(1) DEFAULT '0',
  `completed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_lesson` (`student_id`,`lesson_id`),
  KEY `lesson_id` (`lesson_id`),
  KEY `idx_lesson_progress_enrollment` (`enrollment_id`),
  KEY `idx_lesson_progress_student` (`student_id`),
  CONSTRAINT `lesson_progress_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lesson_progress_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lesson_progress_ibfk_3` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson_progress`
--

LOCK TABLES `lesson_progress` WRITE;
/*!40000 ALTER TABLE `lesson_progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `lesson_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessons` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `module_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `video_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lesson_order` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `technology_module_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_module_order` (`module_id`,`lesson_order`),
  KEY `idx_lessons_technology_module` (`technology_module_id`),
  CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
/*!40000 ALTER TABLE `lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `live_quiz_sessions`
--

DROP TABLE IF EXISTS `live_quiz_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `live_quiz_sessions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `quiz_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tutor_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `started_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `ended_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `total_participants` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `quiz_id` (`quiz_id`),
  KEY `tutor_id` (`tutor_id`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `live_quiz_sessions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `live_quiz_sessions_ibfk_2` FOREIGN KEY (`tutor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `live_quiz_sessions`
--

LOCK TABLES `live_quiz_sessions` WRITE;
/*!40000 ALTER TABLE `live_quiz_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `live_quiz_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `manager_scopes`
--

DROP TABLE IF EXISTS `manager_scopes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manager_scopes` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `manager_user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_manager_scope` (`manager_user_id`,`branch_id`,`department_id`),
  KEY `idx_scope_branch_department` (`branch_id`,`department_id`),
  KEY `fk_scope_department` (`department_id`),
  CONSTRAINT `fk_scope_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_scope_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_scope_manager` FOREIGN KEY (`manager_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manager_scopes`
--

LOCK TABLES `manager_scopes` WRITE;
/*!40000 ALTER TABLE `manager_scopes` DISABLE KEYS */;
INSERT INTO `manager_scopes` VALUES ('c1971d3b-d358-11f1-83f3-559b0b62ccd9','f55ab612-cec0-492e-9f6d-2518ce43c976','4a0d717e-d2f7-11f1-8dda-52177c28573a',2,'2026-10-29 05:22:38'),('d821ad2d-d35f-11f1-83f3-559b0b62ccd9','922767e5-1d3b-4695-a444-db92f82057b3','4a0d717e-d2f7-11f1-8dda-52177c28573a',NULL,'2026-10-29 06:13:22');
/*!40000 ALTER TABLE `manager_scopes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `sender_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `channel_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message_content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `attachment_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `read_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `recipient_id` (`recipient_id`),
  KEY `idx_chat_convo` (`sender_id`,`recipient_id`,`created_at`),
  KEY `idx_channel` (`channel_name`,`created_at`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mfa_secrets`
--

DROP TABLE IF EXISTS `mfa_secrets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mfa_secrets` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `secret` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `backup_codes` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `verified_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_mfa` (`user_id`),
  CONSTRAINT `mfa_secrets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mfa_secrets`
--

LOCK TABLES `mfa_secrets` WRITE;
/*!40000 ALTER TABLE `mfa_secrets` DISABLE KEYS */;
/*!40000 ALTER TABLE `mfa_secrets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mindmap_nodes`
--

DROP TABLE IF EXISTS `mindmap_nodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mindmap_nodes` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `node_type` enum('ROOT','BRANCH','LEAF') COLLATE utf8mb4_unicode_ci DEFAULT 'BRANCH',
  `position_x` decimal(10,2) DEFAULT '0.00',
  `position_y` decimal(10,2) DEFAULT '0.00',
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '#4F46E5',
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_project` (`project_id`),
  KEY `idx_parent` (`parent_id`),
  CONSTRAINT `mindmap_nodes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mindmap_nodes_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `student_projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mindmap_nodes_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `mindmap_nodes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mindmap_nodes`
--

LOCK TABLES `mindmap_nodes` WRITE;
/*!40000 ALTER TABLE `mindmap_nodes` DISABLE KEYS */;
INSERT INTO `mindmap_nodes` VALUES ('11978134-43a0-483d-872e-d48892e0fa30','368f5c88-12cd-11ed-861d-0242ac120002',NULL,'b6d38bf2-c5a1-42a0-95eb-8ced6e29670e','React Fundamentals',NULL,'BRANCH',250.00,120.00,'#4F46E5',NULL,'2026-10-29 07:10:37','2026-10-29 07:10:37'),('b6d38bf2-c5a1-42a0-95eb-8ced6e29670e','368f5c88-12cd-11ed-861d-0242ac120002',NULL,NULL,'Full Stack Learning Path',NULL,'ROOT',100.00,100.00,'#4F46E5',NULL,'2026-10-29 07:10:37','2026-10-29 07:10:37');
/*!40000 ALTER TABLE `mindmap_nodes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `module_topics`
--

DROP TABLE IF EXISTS `module_topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `module_topics` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `module_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `topic_order` int NOT NULL,
  `estimated_hours` decimal(5,2) DEFAULT '1.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_module_order` (`module_id`,`topic_order`),
  CONSTRAINT `module_topics_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `technology_modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `module_topics`
--

LOCK TABLES `module_topics` WRITE;
/*!40000 ALTER TABLE `module_topics` DISABLE KEYS */;
/*!40000 ALTER TABLE `module_topics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modules`
--

DROP TABLE IF EXISTS `modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modules` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `course_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `duration_minutes` int DEFAULT NULL,
  `module_order` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_course_order` (`course_id`,`module_order`),
  CONSTRAINT `modules_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modules`
--

LOCK TABLES `modules` WRITE;
/*!40000 ALTER TABLE `modules` DISABLE KEYS */;
/*!40000 ALTER TABLE `modules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_states`
--

DROP TABLE IF EXISTS `oauth_states`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oauth_states` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `state` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `portal_slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `redirect_uri` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `state` (`state`),
  KEY `idx_state` (`state`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_states`
--

LOCK TABLES `oauth_states` WRITE;
/*!40000 ALTER TABLE `oauth_states` DISABLE KEYS */;
/*!40000 ALTER TABLE `oauth_states` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offboarding_checklists`
--

DROP TABLE IF EXISTS `offboarding_checklists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offboarding_checklists` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `exit_request_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` enum('IT','HR','FINANCE','OPERATIONS','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `task_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_cleared` tinyint(1) DEFAULT '0',
  `cleared_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cleared_at` datetime DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cleared_by` (`cleared_by`),
  KEY `idx_exit_request` (`exit_request_id`),
  KEY `idx_cleared` (`is_cleared`),
  CONSTRAINT `offboarding_checklists_ibfk_1` FOREIGN KEY (`exit_request_id`) REFERENCES `exit_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `offboarding_checklists_ibfk_2` FOREIGN KEY (`cleared_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offboarding_checklists`
--

LOCK TABLES `offboarding_checklists` WRITE;
/*!40000 ALTER TABLE `offboarding_checklists` DISABLE KEYS */;
/*!40000 ALTER TABLE `offboarding_checklists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `order_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price_at_purchase` decimal(10,2) NOT NULL,
  `quantity` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `course_id` (`course_id`),
  KEY `idx_order` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `coupon_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `payment_status` enum('PENDING','PAID','FAILED','REFUNDED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `payment_method` enum('RAZORPAY','STRIPE','BANK_TRANSFER') COLLATE utf8mb4_unicode_ci DEFAULT 'RAZORPAY',
  `payment_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billing_address` json DEFAULT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `placed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `paid_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_tenant` (`tenant_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_payment_status` (`payment_status`),
  KEY `idx_placed_at` (`placed_at`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizational_sub_roles`
--

DROP TABLE IF EXISTS `organizational_sub_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizational_sub_roles` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `department_id` int NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_subrole_department_name` (`department_id`,`name`),
  CONSTRAINT `fk_subrole_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizational_sub_roles`
--

LOCK TABLES `organizational_sub_roles` WRITE;
/*!40000 ALTER TABLE `organizational_sub_roles` DISABLE KEYS */;
INSERT INTO `organizational_sub_roles` VALUES ('4a150c78-d2f7-11f1-8dda-52177c28573a',3,'Content Writer',1,'2026-10-28 17:44:56','2026-10-28 17:44:56'),('4a151491-d2f7-11f1-8dda-52177c28573a',3,'Video Content Creator',1,'2026-10-28 17:44:56','2026-10-28 17:44:56'),('4a151825-d2f7-11f1-8dda-52177c28573a',3,'Video Editor',1,'2026-10-28 17:44:56','2026-10-28 17:44:56'),('4a151b0a-d2f7-11f1-8dda-52177c28573a',3,'Graphic / Visual Content Creator',1,'2026-10-28 17:44:56','2026-10-28 17:44:56'),('4a151d81-d2f7-11f1-8dda-52177c28573a',4,'Digital Marketing Executive',1,'2026-10-28 17:44:56','2026-10-28 17:44:56'),('4a15207c-d2f7-11f1-8dda-52177c28573a',4,'SEO / Content Marketing',1,'2026-10-28 17:44:56','2026-10-28 17:44:56'),('4a152239-d2f7-11f1-8dda-52177c28573a',4,'Campaign and Performance Marketing',1,'2026-10-28 17:44:56','2026-10-28 17:44:56'),('4a1523ea-d2f7-11f1-8dda-52177c28573a',4,'Business Development / Lead Generation',1,'2026-10-28 17:44:56','2026-10-28 17:44:56'),('4a1525cb-d2f7-11f1-8dda-52177c28573a',1,'Social Media Manager / Coordinator',1,'2026-10-28 17:44:56','2026-10-28 17:44:56'),('4a15277e-d2f7-11f1-8dda-52177c28573a',1,'Social Media Executive',1,'2026-10-28 17:44:56','2026-10-28 17:44:56'),('4a152924-d2f7-11f1-8dda-52177c28573a',1,'Social Media Designer / Video Editor',1,'2026-10-28 17:44:56','2026-10-28 17:44:56'),('4a152b02-d2f7-11f1-8dda-52177c28573a',2,'Frontend Developer',1,'2026-10-28 17:44:56','2026-10-28 17:44:56'),('4a152c9f-d2f7-11f1-8dda-52177c28573a',2,'Backend Developer',1,'2026-10-28 17:44:56','2026-10-28 17:44:56'),('4a152e3a-d2f7-11f1-8dda-52177c28573a',2,'AI & Automation',1,'2026-10-28 17:44:56','2026-10-28 17:44:56'),('4a152fed-d2f7-11f1-8dda-52177c28573a',2,'Full-Stack Developer',1,'2026-10-28 17:44:56','2026-10-28 17:44:56'),('4a15319f-d2f7-11f1-8dda-52177c28573a',2,'QA / Software Tester',1,'2026-10-28 17:44:56','2026-10-28 17:44:56'),('4a153354-d2f7-11f1-8dda-52177c28573a',2,'Technical Support',1,'2026-10-28 17:44:56','2026-10-28 17:44:56');
/*!40000 ALTER TABLE `organizational_sub_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_change_requests`
--

DROP TABLE IF EXISTS `password_change_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_change_requests` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','COMPLETED','EXPIRED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `requested_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `reviewed_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewed_at` datetime(6) DEFAULT NULL,
  `review_note` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grant_expires_at` datetime(6) DEFAULT NULL,
  `grant_used_at` datetime(6) DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `created_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_pcr_user` (`user_id`),
  KEY `idx_pcr_status` (`status`),
  CONSTRAINT `fk_pcr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_change_requests`
--

LOCK TABLES `password_change_requests` WRITE;
/*!40000 ALTER TABLE `password_change_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_change_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_recovery_requests`
--

DROP TABLE IF EXISTS `password_recovery_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_recovery_requests` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `email_hash` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','COMPLETED','EXPIRED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `requested_ip` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requested_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `resolved_at` datetime(6) DEFAULT NULL,
  `created_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_prr_status` (`status`),
  KEY `idx_prr_email_hash` (`email_hash`),
  KEY `idx_prr_user` (`user_id`),
  CONSTRAINT `fk_prr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_recovery_requests`
--

LOCK TABLES `password_recovery_requests` WRITE;
/*!40000 ALTER TABLE `password_recovery_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_recovery_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `invoice_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` date NOT NULL,
  `method` enum('RAZORPAY','STRIPE','BANK_TRANSFER','CASH','CHEQUE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','SUCCESS','FAILED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `gateway_response` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_invoice` (`invoice_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll`
--

DROP TABLE IF EXISTS `payroll`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `employee_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `month_year` date NOT NULL,
  `basic` decimal(10,2) NOT NULL,
  `hra` decimal(10,2) NOT NULL,
  `da` decimal(10,2) DEFAULT '0.00',
  `pf_employee` decimal(10,2) DEFAULT '0.00',
  `pf_employer` decimal(10,2) DEFAULT '0.00',
  `esi_employee` decimal(10,2) DEFAULT '0.00',
  `esi_employer` decimal(10,2) DEFAULT '0.00',
  `tds` decimal(10,2) DEFAULT '0.00',
  `gross_salary` decimal(10,2) NOT NULL,
  `net_salary` decimal(10,2) NOT NULL,
  `total_deductions` decimal(10,2) DEFAULT '0.00',
  `bank_transfer_ref` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payslip_pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `processed_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `dispute_reason` text COLLATE utf8mb4_unicode_ci,
  `adjustment_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `disputed_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `disputed_at` datetime DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_payroll` (`employee_id`,`month_year`),
  KEY `processed_by` (`processed_by`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_month` (`month_year`),
  KEY `idx_status` (`status`),
  CONSTRAINT `payroll_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payroll_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll`
--

LOCK TABLES `payroll` WRITE;
/*!40000 ALTER TABLE `payroll` DISABLE KEYS */;
/*!40000 ALTER TABLE `payroll` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `performance_reviews`
--

DROP TABLE IF EXISTS `performance_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `performance_reviews` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `employee_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reviewer_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `review_date` date NOT NULL,
  `rating` int DEFAULT '0',
  `feedback` json DEFAULT NULL,
  `overall_comment` text COLLATE utf8mb4_unicode_ci,
  `status` enum('DRAFT','SUBMITTED','ACKNOWLEDGED','ARCHIVED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_reviewer` (`reviewer_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `performance_reviews_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `performance_reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `performance_reviews`
--

LOCK TABLES `performance_reviews` WRITE;
/*!40000 ALTER TABLE `performance_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `performance_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_perm_module` (`module`),
  KEY `idx_perm_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES ('p-api-keys','api_keys:manage','SYSTEM','EXECUTE','Generate, inspect, and revoke API keys','2026-10-29 08:49:44'),('p-audit-domain','audit:view_domain','COMPLIANCE','READ','View operational activity stream for domain','2026-10-29 08:49:44'),('p-audit-export','audit:export','COMPLIANCE','EXECUTE','Export audit logs and compliance reports','2026-10-29 08:49:44'),('p-audit-ret','audit:retention_modify','COMPLIANCE','UPDATE','Configure audit retention policies','2026-10-29 08:49:44'),('p-audit-sec','audit:view_security','COMPLIANCE','READ','View unfiltered security audit logs','2026-10-29 08:49:44'),('p-bill-inv-view','billing:invoice_view','BILLING','READ','View and export invoices and receipts','2026-10-29 08:49:44'),('p-bill-pay-mod','billing:payment_modify','BILLING','UPDATE','Register or modify billing payment methods','2026-10-29 08:49:44'),('p-bill-pay-view','billing:payment_view','BILLING','READ','View masked payment instruments','2026-10-29 08:49:44'),('p-bill-plan-mod','billing:plan_modify','BILLING','UPDATE','Upgrade, downgrade, or cancel subscription plans','2026-10-29 08:49:44'),('p-bill-plan-view','billing:plan_view','BILLING','READ','View subscription tier, quotas, and usage','2026-10-29 08:49:44'),('p-ff-kill','feature_flags:kill_switch','SYSTEM','EXECUTE','Engage emergency platform-wide kill-switch','2026-10-29 08:49:44'),('p-ff-manage','feature_flags:manage','SYSTEM','EXECUTE','Create, update, and toggle feature flags','2026-10-29 08:49:44'),('p-mfa','mfa:policy_enforce','SYSTEM','UPDATE','Enforce mandatory MFA and authentication rules','2026-10-29 08:49:44'),('p-pay-disp-flag','payroll:dispute_flag','FINANCE','CREATE','Flag payroll records as disputed','2026-10-29 08:49:44'),('p-pay-disp-res','payroll:dispute_resolve','FINANCE','UPDATE','Reconcile payroll disputes within threshold','2026-10-29 08:49:44'),('p-pay-disp-unlim','payroll:dispute_resolve_unlimited','FINANCE','UPDATE','Reconcile payroll disputes exceeding â‚¹25,000 threshold','2026-10-29 08:49:44'),('p-sec-break-glass','security:break_glass','SECURITY','EXECUTE','Initiate emergency break-glass procedure','2026-10-29 08:49:44'),('p-sec-cluster-rel','security:cluster_reload','SECURITY','EXECUTE','Trigger zero-downtime rolling worker reload','2026-10-29 08:49:44'),('p-sec-cluster-tel','security:cluster_telemetry','SECURITY','READ','Inspect live multi-worker cluster telemetry','2026-10-29 08:49:44'),('p-sec-ip-block','security:ip_block','SECURITY','EXECUTE','Block malicious IP addresses and CIDR ranges','2026-10-29 08:49:44'),('p-sec-sess-all','security:session_revoke_all','SECURITY','EXECUTE','Emergency cluster-wide session revocation','2026-10-29 08:49:44'),('p-sec-sess-term','security:session_terminate','SECURITY','EXECUTE','Terminate subordinate user sessions','2026-10-29 08:49:44'),('p-sso','sso:manage','SYSTEM','EXECUTE','Configure SAML 2.0 / OIDC identity providers','2026-10-29 08:49:44'),('p-sys-cfg-mod','system:config_modify','SYSTEM','UPDATE','Modify tenant and global platform configs','2026-10-29 08:49:44'),('p-sys-cfg-read','system:config_read','SYSTEM','READ','View system configurations and settings','2026-10-29 08:49:44'),('p-user-create','user:create','USER','CREATE','Provision new users within allowed rank','2026-10-29 08:49:44'),('p-user-delete','user:delete','USER','DELETE','Soft-deactivate subordinate users','2026-10-29 08:49:44'),('p-user-lock','user:lock','USER','UPDATE','Lock compromised subordinate accounts','2026-10-29 08:49:44'),('p-user-purge','user:purge','USER','DELETE','Permanently purge user accounts from database','2026-10-29 08:49:44'),('p-user-pwd-reset','user:password_reset','USER','EXECUTE','Trigger credential resets for subordinate users','2026-10-29 08:49:44'),('p-user-read','user:read','USER','READ','Inspect user profiles and directories','2026-10-29 08:49:44'),('p-user-role-assign','user:role_assign','USER','EXECUTE','Assign subordinate security roles to users','2026-10-29 08:49:44'),('p-user-update','user:update','USER','UPDATE','Modify subordinate user accounts','2026-10-29 08:49:44'),('p-webhooks','webhooks:manage','SYSTEM','EXECUTE','Register and manage webhook endpoints','2026-10-29 08:49:44');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `policy_rules`
--

DROP TABLE IF EXISTS `policy_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `policy_rules` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `predicate_expression` json NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pr_role_perm` (`role_id`,`permission_code`),
  CONSTRAINT `fk_pr_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `policy_rules`
--

LOCK TABLES `policy_rules` WRITE;
/*!40000 ALTER TABLE `policy_rules` DISABLE KEYS */;
/*!40000 ALTER TABLE `policy_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prediction_logs`
--

DROP TABLE IF EXISTS `prediction_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prediction_logs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` enum('LEAD','STUDENT','EMPLOYEE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prediction_type` enum('LEAD_SCORE','CHURN_PROBABILITY','PERFORMANCE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `confidence` decimal(5,2) NOT NULL,
  `features` json NOT NULL,
  `explanation` text COLLATE utf8mb4_unicode_ci,
  `model_version` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `predicted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant` (`tenant_id`),
  KEY `idx_entity` (`entity_type`,`entity_id`),
  KEY `idx_type` (`prediction_type`),
  CONSTRAINT `prediction_logs_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prediction_logs`
--

LOCK TABLES `prediction_logs` WRITE;
/*!40000 ALTER TABLE `prediction_logs` DISABLE KEYS */;
INSERT INTO `prediction_logs` VALUES ('0831d1c2-f3bd-4d0a-bc46-42d2e38c8a5f','368f5c88-12cd-11ed-861d-0242ac120002','LEAD','3aa4fb02-a358-4796-abb0-1976ee560d76','LEAD_SCORE',0.92,0.88,'{\"visits\": 5, \"time_spent\": 480}',NULL,NULL,'2026-10-29 07:10:38');
/*!40000 ALTER TABLE `prediction_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `discounted_price` decimal(10,2) DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT '0',
  `featured` tinyint(1) DEFAULT '0',
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tenant_course` (`tenant_id`,`course_id`),
  KEY `course_id` (`course_id`),
  KEY `idx_published` (`is_published`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES ('59f2b001-0eac-4750-a1b1-6067ca262936','46f13687-ec4b-468e-b8cf-c6803c0f8792','368f5c88-12cd-11ed-861d-0242ac120003',9999.00,7999.00,1,0,NULL,NULL,'2026-10-29 07:10:37','2026-10-29 07:10:37');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `program_modules`
--

DROP TABLE IF EXISTS `program_modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `program_modules` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `program_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module_order` int NOT NULL,
  `allocated_days` int NOT NULL,
  `start_day` int DEFAULT NULL,
  `end_day` int DEFAULT NULL,
  `is_core` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `module_id` (`module_id`),
  KEY `idx_program_order` (`program_id`,`module_order`),
  CONSTRAINT `program_modules_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `program_modules_ibfk_2` FOREIGN KEY (`module_id`) REFERENCES `technology_modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `program_modules`
--

LOCK TABLES `program_modules` WRITE;
/*!40000 ALTER TABLE `program_modules` DISABLE KEYS */;
/*!40000 ALTER TABLE `program_modules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programs`
--

DROP TABLE IF EXISTS `programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `duration_days` int NOT NULL,
  `tracks` json DEFAULT NULL,
  `final_project` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programs`
--

LOCK TABLES `programs` WRITE;
/*!40000 ALTER TABLE `programs` DISABLE KEYS */;
/*!40000 ALTER TABLE `programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_expenses`
--

DROP TABLE IF EXISTS `project_expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_expenses` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `project_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logged_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('CLOUD_INFRA','SOFTWARE_LICENSE','HARDWARE','CONTRACTOR_FEE','TRAVEL','MISC') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'INR',
  `expense_date` date NOT NULL,
  `receipt_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_billable` tinyint(1) DEFAULT '1',
  `status` enum('PENDING','APPROVED','REJECTED','BILLED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `approved_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `invoice_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `logged_by` (`logged_by`),
  KEY `approved_by` (`approved_by`),
  KEY `invoice_id` (`invoice_id`),
  KEY `idx_proj_expense` (`project_id`,`status`),
  KEY `idx_expense_date` (`expense_date`),
  CONSTRAINT `project_expenses_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `student_projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_expenses_ibfk_2` FOREIGN KEY (`logged_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_expenses_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `project_expenses_ibfk_4` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_expenses`
--

LOCK TABLES `project_expenses` WRITE;
/*!40000 ALTER TABLE `project_expenses` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_files`
--

DROP TABLE IF EXISTS `project_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_files` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `project_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size_bytes` bigint NOT NULL DEFAULT '0',
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'application/octet-stream',
  `version` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '1.0',
  `category` enum('SPECIFICATION','DESIGN_ASSET','DELIVERABLE','CONTRACT','MEETING_RECORDING','OTHER') COLLATE utf8mb4_unicode_ci DEFAULT 'SPECIFICATION',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `idx_project_cat` (`project_id`,`category`),
  CONSTRAINT `project_files_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `student_projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_files_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_files`
--

LOCK TABLES `project_files` WRITE;
/*!40000 ALTER TABLE `project_files` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_members`
--

DROP TABLE IF EXISTS `project_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_members` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `project_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_role` enum('LEAD','MEMBER','CONTRIBUTOR','REVIEWER') COLLATE utf8mb4_unicode_ci DEFAULT 'MEMBER',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_project_user` (`project_id`,`user_id`),
  KEY `idx_user_projects` (`user_id`),
  CONSTRAINT `project_members_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_members`
--

LOCK TABLES `project_members` WRITE;
/*!40000 ALTER TABLE `project_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_milestones`
--

DROP TABLE IF EXISTS `project_milestones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_milestones` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `project_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `target_date` date NOT NULL,
  `completed_date` date DEFAULT NULL,
  `status` enum('PENDING','IN_PROGRESS','REVIEW','COMPLETED','DELAYED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `deliverable_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `budget_allocated` decimal(12,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project_status` (`project_id`,`status`),
  KEY `idx_target_date` (`target_date`),
  CONSTRAINT `project_milestones_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `student_projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_milestones`
--

LOCK TABLES `project_milestones` WRITE;
/*!40000 ALTER TABLE `project_milestones` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_milestones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_sprints`
--

DROP TABLE IF EXISTS `project_sprints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_sprints` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `project_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sprint_number` int NOT NULL,
  `sprint_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `goal` text COLLATE utf8mb4_unicode_ci,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('PLANNING','ACTIVE','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'PLANNING',
  `target_velocity` int DEFAULT '0',
  `actual_velocity` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_proj_sprint` (`project_id`,`sprint_number`),
  KEY `idx_proj_sprint_status` (`project_id`,`status`),
  CONSTRAINT `project_sprints_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `student_projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_sprints`
--

LOCK TABLES `project_sprints` WRITE;
/*!40000 ALTER TABLE `project_sprints` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_sprints` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `provider_configs`
--

DROP TABLE IF EXISTS `provider_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `provider_configs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `provider` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_value` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_encrypted` tinyint(1) DEFAULT '1',
  `is_enabled` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_provider_key` (`provider`,`config_key`),
  KEY `idx_provider` (`provider`),
  KEY `idx_enabled` (`is_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provider_configs`
--

LOCK TABLES `provider_configs` WRITE;
/*!40000 ALTER TABLE `provider_configs` DISABLE KEYS */;
/*!40000 ALTER TABLE `provider_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `push_notifications`
--

DROP TABLE IF EXISTS `push_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `push_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci,
  `data` json DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `read_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pn_user` (`user_id`),
  KEY `idx_pn_user_unread` (`user_id`,`is_read`),
  KEY `idx_pn_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `push_notifications`
--

LOCK TABLES `push_notifications` WRITE;
/*!40000 ALTER TABLE `push_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `push_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_bank`
--

DROP TABLE IF EXISTS `question_bank`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_bank` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `course_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `module_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `topic` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `difficulty` enum('EASY','MEDIUM','HARD') COLLATE utf8mb4_unicode_ci DEFAULT 'MEDIUM',
  `question_type` enum('MCQ','MULTI_SELECT','TRUE_FALSE','CODE_OUTPUT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MCQ',
  `question_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `code_snippet` text COLLATE utf8mb4_unicode_ci,
  `explanation` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_topic_diff` (`topic`,`difficulty`),
  KEY `idx_course` (`course_id`),
  CONSTRAINT `question_bank_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `question_bank_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_bank`
--

LOCK TABLES `question_bank` WRITE;
/*!40000 ALTER TABLE `question_bank` DISABLE KEYS */;
/*!40000 ALTER TABLE `question_bank` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_options`
--

DROP TABLE IF EXISTS `question_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_options` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `question_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `option_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT '0',
  `display_order` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_question` (`question_id`),
  CONSTRAINT `question_options_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `question_bank` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_options`
--

LOCK TABLES `question_options` WRITE;
/*!40000 ALTER TABLE `question_options` DISABLE KEYS */;
/*!40000 ALTER TABLE `question_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_attempts`
--

DROP TABLE IF EXISTS `quiz_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_attempts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `quiz_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `score` int DEFAULT '0',
  `total_questions` int NOT NULL,
  `time_taken_seconds` int DEFAULT '0',
  `answers` json DEFAULT NULL,
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_live` tinyint(1) DEFAULT '0',
  `live_session_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `idx_quiz_student` (`quiz_id`,`student_id`),
  KEY `idx_live_session` (`live_session_id`),
  CONSTRAINT `quiz_attempts_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quiz_attempts_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_attempts`
--

LOCK TABLES `quiz_attempts` WRITE;
/*!40000 ALTER TABLE `quiz_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_questions`
--

DROP TABLE IF EXISTS `quiz_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_questions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `quiz_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `points` int DEFAULT '1',
  `question_order` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_quiz_question` (`quiz_id`,`question_id`),
  KEY `question_id` (`question_id`),
  KEY `idx_quiz_order` (`quiz_id`,`question_order`),
  CONSTRAINT `quiz_questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quiz_questions_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `question_bank` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_questions`
--

LOCK TABLES `quiz_questions` WRITE;
/*!40000 ALTER TABLE `quiz_questions` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quizzes` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `course_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `time_limit_minutes` int DEFAULT '10',
  `passing_score` int DEFAULT '70',
  `is_published` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_course` (`course_id`),
  CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizzes`
--

LOCK TABLES `quizzes` WRITE;
/*!40000 ALTER TABLE `quizzes` DISABLE KEYS */;
/*!40000 ALTER TABLE `quizzes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reception_appointments`
--

DROP TABLE IF EXISTS `reception_appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reception_appointments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `visitor_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purpose` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `person_to_meet` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `person_to_meet_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `status` enum('SCHEDULED','CHECKED_IN','COMPLETED','CANCELLED','NO_SHOW') COLLATE utf8mb4_unicode_ci DEFAULT 'SCHEDULED',
  `badge_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_appt_date` (`appointment_date`),
  KEY `idx_appt_status` (`status`),
  KEY `idx_appt_host` (`person_to_meet`),
  CONSTRAINT `reception_appointments_ibfk_1` FOREIGN KEY (`person_to_meet`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reception_appointments`
--

LOCK TABLES `reception_appointments` WRITE;
/*!40000 ALTER TABLE `reception_appointments` DISABLE KEYS */;
/*!40000 ALTER TABLE `reception_appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reception_receipts`
--

DROP TABLE IF EXISTS `reception_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reception_receipts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `receipt_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_mode` enum('CASH','UPI','CARD','NET_BANKING') COLLATE utf8mb4_unicode_ci DEFAULT 'UPI',
  `purpose` enum('TUITION_FEE','ADMISSION_FEE','EXAM_FEE','CERTIFICATE_FEE','OTHER') COLLATE utf8mb4_unicode_ci DEFAULT 'ADMISSION_FEE',
  `issued_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issued_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `transaction_reference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `receipt_number` (`receipt_number`),
  KEY `student_id` (`student_id`),
  KEY `course_id` (`course_id`),
  KEY `issued_by` (`issued_by`),
  KEY `idx_receipt_num` (`receipt_number`),
  KEY `idx_receipt_issued` (`issued_at`),
  CONSTRAINT `reception_receipts_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reception_receipts_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reception_receipts_ibfk_3` FOREIGN KEY (`issued_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reception_receipts`
--

LOCK TABLES `reception_receipts` WRITE;
/*!40000 ALTER TABLE `reception_receipts` DISABLE KEYS */;
/*!40000 ALTER TABLE `reception_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recurring_rules`
--

DROP TABLE IF EXISTS `recurring_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recurring_rules` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `frequency` enum('DAILY','WEEKLY','MONTHLY','YEARLY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `interval` int DEFAULT '1',
  `days_of_week` json DEFAULT NULL,
  `day_of_month` int DEFAULT NULL,
  `month_of_year` int DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `max_occurrences` int DEFAULT NULL,
  `instance_count` int DEFAULT '0',
  `next_occurrence` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_recurring_rules_event` (`event_id`),
  KEY `idx_recurring_rules_freq` (`frequency`),
  KEY `idx_recurring_rules_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recurring_rules`
--

LOCK TABLES `recurring_rules` WRITE;
/*!40000 ALTER TABLE `recurring_rules` DISABLE KEYS */;
/*!40000 ALTER TABLE `recurring_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recurring_schedules`
--

DROP TABLE IF EXISTS `recurring_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recurring_schedules` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `client_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `frequency` enum('MONTHLY','QUARTERLY','YEARLY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `next_generation_date` date NOT NULL,
  `last_generated_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `student_id` (`student_id`),
  KEY `idx_next_date` (`next_generation_date`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `recurring_schedules_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
  CONSTRAINT `recurring_schedules_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recurring_schedules`
--

LOCK TABLES `recurring_schedules` WRITE;
/*!40000 ALTER TABLE `recurring_schedules` DISABLE KEYS */;
/*!40000 ALTER TABLE `recurring_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_definitions`
--

DROP TABLE IF EXISTS `report_definitions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_definitions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `dimensions` json NOT NULL,
  `metrics` json NOT NULL,
  `filters` json DEFAULT NULL,
  `chart_type` enum('TABLE','BAR','LINE','PIE','AREA') COLLATE utf8mb4_unicode_ci DEFAULT 'TABLE',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_tenant` (`tenant_id`),
  CONSTRAINT `report_definitions_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `report_definitions_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_definitions`
--

LOCK TABLES `report_definitions` WRITE;
/*!40000 ALTER TABLE `report_definitions` DISABLE KEYS */;
INSERT INTO `report_definitions` VALUES ('4281e3a7-978b-4e9a-a32f-e47e013f047d','46f13687-ec4b-468e-b8cf-c6803c0f8792','Monthly Enrollment Metrics','BI report showing enrollments count per course monthly','[\"course_name\", \"month\"]','[\"enrollment_count\", \"revenue\"]',NULL,'TABLE','368f5c88-12cd-11ed-861d-0242ac120002','2026-10-29 07:10:37','2026-10-29 07:10:37');
/*!40000 ALTER TABLE `report_definitions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `role_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `granted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `fk_rp_perm` (`permission_id`),
  CONSTRAINT `fk_rp_perm` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES ('role-admin','p-api-keys','2026-10-29 08:49:44'),('role-admin','p-audit-domain','2026-10-29 08:49:44'),('role-admin','p-audit-export','2026-10-29 08:49:44'),('role-admin','p-bill-inv-view','2026-10-29 08:49:44'),('role-admin','p-bill-pay-view','2026-10-29 08:49:44'),('role-admin','p-bill-plan-view','2026-10-29 08:49:44'),('role-admin','p-ff-manage','2026-10-29 08:49:44'),('role-admin','p-pay-disp-flag','2026-10-29 08:49:44'),('role-admin','p-pay-disp-res','2026-10-29 08:49:44'),('role-admin','p-sec-cluster-rel','2026-10-29 08:49:44'),('role-admin','p-sec-cluster-tel','2026-10-29 08:49:44'),('role-admin','p-sec-ip-block','2026-10-29 08:49:44'),('role-admin','p-sec-sess-term','2026-10-29 08:49:44'),('role-admin','p-sys-cfg-mod','2026-10-29 08:49:44'),('role-admin','p-sys-cfg-read','2026-10-29 08:49:44'),('role-admin','p-user-create','2026-10-29 08:49:44'),('role-admin','p-user-delete','2026-10-29 08:49:44'),('role-admin','p-user-lock','2026-10-29 08:49:44'),('role-admin','p-user-pwd-reset','2026-10-29 08:49:44'),('role-admin','p-user-read','2026-10-29 08:49:44'),('role-admin','p-user-role-assign','2026-10-29 08:49:44'),('role-admin','p-user-update','2026-10-29 08:49:44'),('role-admin','p-webhooks','2026-10-29 08:49:44'),('role-super-admin','p-api-keys','2026-10-29 08:49:44'),('role-super-admin','p-audit-domain','2026-10-29 08:49:44'),('role-super-admin','p-audit-export','2026-10-29 08:49:44'),('role-super-admin','p-audit-ret','2026-10-29 08:49:44'),('role-super-admin','p-audit-sec','2026-10-29 08:49:44'),('role-super-admin','p-bill-inv-view','2026-10-29 08:49:44'),('role-super-admin','p-bill-pay-mod','2026-10-29 08:49:44'),('role-super-admin','p-bill-pay-view','2026-10-29 08:49:44'),('role-super-admin','p-bill-plan-mod','2026-10-29 08:49:44'),('role-super-admin','p-bill-plan-view','2026-10-29 08:49:44'),('role-super-admin','p-ff-kill','2026-10-29 08:49:44'),('role-super-admin','p-ff-manage','2026-10-29 08:49:44'),('role-super-admin','p-mfa','2026-10-29 08:49:44'),('role-super-admin','p-pay-disp-flag','2026-10-29 08:49:44'),('role-super-admin','p-pay-disp-res','2026-10-29 08:49:44'),('role-super-admin','p-pay-disp-unlim','2026-10-29 08:49:44'),('role-super-admin','p-sec-break-glass','2026-10-29 08:49:44'),('role-super-admin','p-sec-cluster-rel','2026-10-29 08:49:44'),('role-super-admin','p-sec-cluster-tel','2026-10-29 08:49:44'),('role-super-admin','p-sec-ip-block','2026-10-29 08:49:44'),('role-super-admin','p-sec-sess-all','2026-10-29 08:49:44'),('role-super-admin','p-sec-sess-term','2026-10-29 08:49:44'),('role-super-admin','p-sso','2026-10-29 08:49:44'),('role-super-admin','p-sys-cfg-mod','2026-10-29 08:49:44'),('role-super-admin','p-sys-cfg-read','2026-10-29 08:49:44'),('role-super-admin','p-user-create','2026-10-29 08:49:44'),('role-super-admin','p-user-delete','2026-10-29 08:49:44'),('role-super-admin','p-user-lock','2026-10-29 08:49:44'),('role-super-admin','p-user-purge','2026-10-29 08:49:44'),('role-super-admin','p-user-pwd-reset','2026-10-29 08:49:44'),('role-super-admin','p-user-read','2026-10-29 08:49:44'),('role-super-admin','p-user-role-assign','2026-10-29 08:49:44'),('role-super-admin','p-user-update','2026-10-29 08:49:44'),('role-super-admin','p-webhooks','2026-10-29 08:49:44');
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `security_rank` int NOT NULL DEFAULT '10',
  `is_system_role` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_roles_rank` (`security_rank`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES ('role-admin','ADMIN','Standard Administrator','Operational domain administrator with hierarchy boundaries',80,1,'2026-10-29 08:49:44','2026-10-29 08:49:44'),('role-employee','EMPLOYEE','Staff Employee','Internal staff member with departmental responsibilities',20,1,'2026-10-29 08:49:44','2026-10-29 08:49:44'),('role-finance','FINANCE','Financial Controller','Payroll processing, invoices, and ledger audits',60,1,'2026-10-29 08:49:44','2026-10-29 08:49:44'),('role-hr','HR','Human Resources Manager','Talent acquisition, attendance, and leave management',60,1,'2026-10-29 08:49:44','2026-10-29 08:49:44'),('role-hr-superadmin','HR_SUPERADMIN','HR Super Administrator','Executive HR officer with platform-wide staff clearance',90,1,'2026-10-29 08:49:44','2026-10-29 08:49:44'),('role-intern','INTERN','Apprentice Intern','Vocational trainee undergoing skills development',20,1,'2026-10-29 08:49:44','2026-10-29 08:49:44'),('role-pm','PM','Project Manager','Project roadmaps, milestone tracking, and task oversight',40,1,'2026-10-29 08:49:44','2026-10-29 08:49:44'),('role-senior-tutor','SENIOR_TUTOR','Senior Lead Instructor','Senior academic staff leading tutor team and curriculum',45,1,'2026-10-29 08:49:44','2026-10-29 08:49:44'),('role-student','STUDENT','Enrolled Learner','Active course enrollee accessing dynamic learning player',10,1,'2026-10-29 08:49:44','2026-10-29 08:49:44'),('role-super-admin','SUPER_ADMIN','Super Administrator','Root system and governance authority with platform-wide scope',100,1,'2026-10-29 08:49:44','2026-10-29 08:49:44'),('role-tutor','TUTOR','Academic Instructor','Course delivery, question banking, and student assessment',40,1,'2026-10-29 08:49:44','2026-10-29 08:49:44');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salary_structures`
--

DROP TABLE IF EXISTS `salary_structures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salary_structures` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `employee_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `basic` decimal(10,2) NOT NULL,
  `hra` decimal(10,2) NOT NULL,
  `da` decimal(10,2) DEFAULT '0.00',
  `pf_percentage` decimal(5,2) DEFAULT '12.00',
  `esi_percentage` decimal(5,2) DEFAULT '0.75',
  `tds_percentage` decimal(5,2) DEFAULT '0.00',
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_employee` (`employee_id`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `salary_structures_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salary_structures`
--

LOCK TABLES `salary_structures` WRITE;
/*!40000 ALTER TABLE `salary_structures` DISABLE KEYS */;
/*!40000 ALTER TABLE `salary_structures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_activities`
--

DROP TABLE IF EXISTS `sales_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_activities` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `activity_type` enum('CALL','MEETING','DEMO','EMAIL','FOLLOW_UP','NOTE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `lead_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deal_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `outcome` enum('CONNECTED','BUSY','NO_ANSWER','MEETING_BOOKED','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'COMPLETED',
  `duration_minutes` int DEFAULT '15',
  `scheduled_at` datetime NOT NULL,
  `completed_at` datetime DEFAULT NULL,
  `meeting_link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `performed_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lead_id` (`lead_id`),
  KEY `idx_act_user` (`performed_by`,`scheduled_at`),
  KEY `idx_act_deal` (`deal_id`),
  CONSTRAINT `sales_activities_ibfk_1` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sales_activities_ibfk_2` FOREIGN KEY (`deal_id`) REFERENCES `sales_deals` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sales_activities_ibfk_3` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_activities`
--

LOCK TABLES `sales_activities` WRITE;
/*!40000 ALTER TABLE `sales_activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `sales_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_commissions`
--

DROP TABLE IF EXISTS `sales_commissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_commissions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `deal_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bda_user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `eligible_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `commission_rate` decimal(5,2) NOT NULL DEFAULT '10.00',
  `commission_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` enum('Pending Approval','Approved','Payable','Paid','Rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending Approval',
  `approved_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `payment_reference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_deal_commission` (`deal_id`),
  KEY `idx_deal_id` (`deal_id`),
  KEY `idx_bda_user_id` (`bda_user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_commissions`
--

LOCK TABLES `sales_commissions` WRITE;
/*!40000 ALTER TABLE `sales_commissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sales_commissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_deals`
--

DROP TABLE IF EXISTS `sales_deals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_deals` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lead_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deal_value` decimal(12,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'INR',
  `stage` enum('QUALIFICATION','DISCOVERY','PROPOSAL_SENT','NEGOTIATION','CLOSED_WON','CLOSED_LOST') COLLATE utf8mb4_unicode_ci DEFAULT 'QUALIFICATION',
  `probability` int DEFAULT '20',
  `expected_close_date` date NOT NULL,
  `actual_close_date` date DEFAULT NULL,
  `loss_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `owner_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `lead_id` (`lead_id`),
  KEY `idx_deal_stage` (`stage`),
  KEY `idx_deal_owner` (`owner_id`),
  KEY `idx_close_date` (`expected_close_date`),
  CONSTRAINT `sales_deals_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sales_deals_ibfk_2` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sales_deals_ibfk_3` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_deals`
--

LOCK TABLES `sales_deals` WRITE;
/*!40000 ALTER TABLE `sales_deals` DISABLE KEYS */;
/*!40000 ALTER TABLE `sales_deals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_proposals`
--

DROP TABLE IF EXISTS `sales_proposals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_proposals` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `proposal_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deal_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `client_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `discount_percentage` decimal(5,2) DEFAULT '0.00',
  `valid_until` date NOT NULL,
  `status` enum('DRAFT','SENT','ACCEPTED','DECLINED','EXPIRED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `deliverables` json DEFAULT NULL,
  `pdf_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `proposal_number` (`proposal_number`),
  KEY `client_id` (`client_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_prop_status` (`status`),
  KEY `idx_prop_deal` (`deal_id`),
  CONSTRAINT `sales_proposals_ibfk_1` FOREIGN KEY (`deal_id`) REFERENCES `sales_deals` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sales_proposals_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sales_proposals_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_proposals`
--

LOCK TABLES `sales_proposals` WRITE;
/*!40000 ALTER TABLE `sales_proposals` DISABLE KEYS */;
/*!40000 ALTER TABLE `sales_proposals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_targets`
--

DROP TABLE IF EXISTS `sales_targets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_targets` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fiscal_year` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `period_type` enum('MONTHLY','QUARTERLY','ANNUAL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `period_label` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_revenue` decimal(12,2) NOT NULL,
  `achieved_revenue` decimal(12,2) DEFAULT '0.00',
  `deals_target` int DEFAULT '5',
  `deals_won` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_rep_target` (`user_id`,`fiscal_year`,`period_label`),
  KEY `idx_target_user` (`user_id`),
  CONSTRAINT `sales_targets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_targets`
--

LOCK TABLES `sales_targets` WRITE;
/*!40000 ALTER TABLE `sales_targets` DISABLE KEYS */;
/*!40000 ALTER TABLE `sales_targets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scheduled_reports`
--

DROP TABLE IF EXISTS `scheduled_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scheduled_reports` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `report_definition_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `frequency` enum('DAILY','WEEKLY','MONTHLY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `format` enum('PDF','CSV','EXCEL') COLLATE utf8mb4_unicode_ci DEFAULT 'PDF',
  `recipient_emails` json NOT NULL,
  `last_sent_at` datetime DEFAULT NULL,
  `next_send_at` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `report_definition_id` (`report_definition_id`),
  KEY `idx_tenant` (`tenant_id`),
  KEY `idx_next_send` (`next_send_at`),
  CONSTRAINT `scheduled_reports_ibfk_1` FOREIGN KEY (`report_definition_id`) REFERENCES `report_definitions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `scheduled_reports_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scheduled_reports`
--

LOCK TABLES `scheduled_reports` WRITE;
/*!40000 ALTER TABLE `scheduled_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `scheduled_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `security_threat_logs`
--

DROP TABLE IF EXISTS `security_threat_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `security_threat_logs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `threat_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_ip` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_endpoint` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'HIGH',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IP_BLOCKED',
  `details` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_threat_created` (`created_at`),
  KEY `idx_threat_ip` (`source_ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_threat_logs`
--

LOCK TABLES `security_threat_logs` WRITE;
/*!40000 ALTER TABLE `security_threat_logs` DISABLE KEYS */;
INSERT INTO `security_threat_logs` VALUES ('908f4d7d-d375-11f1-83f3-559b0b62ccd9','BRUTE_FORCE_PREVENTION','185.220.101.5','/v1/auth/login','CRITICAL','IP_BLOCKED','{\"country\": \"DE\", \"attempts\": 15}','2026-10-29 08:48:51'),('908f514f-d375-11f1-83f3-559b0b62ccd9','UNAUTHORIZED_SCOPED_TOKEN','194.26.29.112','/v1/tenants/export','HIGH','TOKEN_REVOKED','{\"reason\": \"scope_mismatch\", \"token_prefix\": \"ey...\"}','2026-10-29 08:48:51'),('908f52a9-d375-11f1-83f3-559b0b62ccd9','RATE_LIMIT_EXCEEDED','103.14.26.89','/v1/users','MEDIUM','THROTTLED','{\"rate\": \"45 req/s\", \"limit\": \"30 req/s\"}','2026-10-29 08:48:51'),('afd26f94-d375-11f1-83f3-559b0b62ccd9','BRUTE_FORCE_PREVENTION','185.220.101.5','/v1/auth/login','CRITICAL','IP_BLOCKED','{\"country\": \"DE\", \"attempts\": 15}','2026-10-29 08:49:43'),('afd27404-d375-11f1-83f3-559b0b62ccd9','UNAUTHORIZED_SCOPED_TOKEN','194.26.29.112','/v1/tenants/export','HIGH','TOKEN_REVOKED','{\"reason\": \"scope_mismatch\", \"token_prefix\": \"ey...\"}','2026-10-29 08:49:43'),('afd27558-d375-11f1-83f3-559b0b62ccd9','RATE_LIMIT_EXCEEDED','103.14.26.89','/v1/users','MEDIUM','THROTTLED','{\"rate\": \"45 req/s\", \"limit\": \"30 req/s\"}','2026-10-29 08:49:43'),('b896ff5d-d375-11f1-83f3-559b0b62ccd9','BRUTE_FORCE_PREVENTION','185.220.101.5','/v1/auth/login','CRITICAL','IP_BLOCKED','{\"country\": \"DE\", \"attempts\": 15}','2026-10-29 08:49:58'),('b897044e-d375-11f1-83f3-559b0b62ccd9','UNAUTHORIZED_SCOPED_TOKEN','194.26.29.112','/v1/tenants/export','HIGH','TOKEN_REVOKED','{\"reason\": \"scope_mismatch\", \"token_prefix\": \"ey...\"}','2026-10-29 08:49:58'),('b89706db-d375-11f1-83f3-559b0b62ccd9','RATE_LIMIT_EXCEEDED','103.14.26.89','/v1/users','MEDIUM','THROTTLED','{\"rate\": \"45 req/s\", \"limit\": \"30 req/s\"}','2026-10-29 08:49:58');
/*!40000 ALTER TABLE `security_threat_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `portal_slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `impersonated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `impersonation_origin_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_token_portal` (`token`,`portal_slug`),
  KEY `idx_user_portal` (`user_id`,`portal_slug`),
  KEY `idx_sessions_impersonated_by` (`impersonated_by`),
  CONSTRAINT `fk_sessions_impersonated_by` FOREIGN KEY (`impersonated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sessions_ibfk_2` FOREIGN KEY (`impersonated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('2b281ea1-d377-11f1-83f3-559b0b62ccd9','922767e5-1d3b-4695-a444-db92f82057b3','1073188889a2be19f3dd82fef379e8f5857aea9f1c50ef731144b8f83c85381e','manager','2026-10-29 17:00:20','node','::1',NULL,NULL,'2026-10-29 09:00:20'),('33d69a99-d377-11f1-83f3-559b0b62ccd9','a80f8109-e4bd-4f7c-a712-5f76f276deec','0eacc360ffc9b1a8dda8e5c20563e26af26e4e95979915e9af6208b8aa8c04c6','employee','2026-10-29 17:00:35','node','::1',NULL,NULL,'2026-10-29 09:00:34'),('44b48d09-d377-11f1-83f3-559b0b62ccd9','c661ef02-aeb6-42e6-a31e-0f07ccf69989','c20378937006136d4dc1875b950165d5cd60292d7006bfd5dbd3ceae0b6f48c4','hr','2026-10-29 17:01:03','node','::1',NULL,NULL,'2026-10-29 09:01:03'),('69bda3b1-d35d-11f1-83f3-559b0b62ccd9','d0ad4394-a479-4c93-9b30-179d9d09d05d','f8870465d596087a2641d9554be33edcc83019a98c45e868edbe062ea52f4114','employee','2026-10-29 13:55:58','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','::ffff:127.0.0.1',NULL,NULL,'2026-10-29 05:55:58'),('878f2a4c-d362-11f1-83f3-559b0b62ccd9','5b594108-98b0-4cde-b908-80928e642998','e92aad15774d01afeaedbc79f2c951de6604480fb3b38b7af3577cfb414e19f9','hr','2026-10-29 14:32:36','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','::1',NULL,NULL,'2026-10-29 06:32:35'),('89e84543-d2fa-11f1-8dda-52177c28573a','44f55fc2-753e-4d9b-b9d5-2ff1e0f994dc','747b0aeb694829db4f04a1c0d3b596102a2788dd638d3966073afdd3b29a9c2a','hr','2026-10-29 02:08:12','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','::ffff:127.0.0.1',NULL,NULL,'2026-10-28 18:08:12'),('8f8f1cde-d2fa-11f1-8dda-52177c28573a','f89fa77e-a263-46df-b40c-32ba3f14738e','d06eb7292fb19b4b4ac33294ce56d7ef4c16a412b307d0ca70ddca068f0b48d5','employee','2026-10-29 02:08:22','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','::ffff:127.0.0.1',NULL,NULL,'2026-10-28 18:08:21'),('cf7d566d-d377-11f1-83f3-559b0b62ccd9','5e402aed-f6c0-4bdb-926a-f3310d27240f','093ed191ee0deabcbad4acb930f2b5764a4ab2994d6e88b1a5f8e323cdf25ae5','super-admin','2026-10-29 13:04:56','node','::1',NULL,NULL,'2026-10-29 09:04:56'),('d2d84fa8-d358-11f1-83f3-559b0b62ccd9','68557fb9-209d-4efa-a558-7dcff689444e','225e0c176f20fe649499be82352e5a75d73d02f5deab603fe1947dce858c626e','super-admin','2026-10-29 09:23:07','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','::ffff:127.0.0.1',NULL,NULL,'2026-10-29 05:23:07'),('d30a9ac7-d358-11f1-83f3-559b0b62ccd9','f55ab612-cec0-492e-9f6d-2518ce43c976','f65d408b41a42503cf703c721e130bd4c04c2cdd1ff38f46a9e268559326a9c6','manager','2026-10-29 13:23:08','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','::ffff:127.0.0.1',NULL,NULL,'2026-10-29 05:23:07'),('d37c8d5b-d358-11f1-83f3-559b0b62ccd9','429d254c-ece3-4e52-b445-0e87b541b5f4','2226e651d5a9030d88cf1774f39d87b4d1756e7065a99bf8a22295c052a1a8b8','employee','2026-10-29 13:23:08','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','::ffff:127.0.0.1',NULL,NULL,'2026-10-29 05:23:08'),('d68743fe-d35e-11f1-83f3-559b0b62ccd9','684b5dce-8c09-4128-b8eb-1e25bb2207ac','009cbe766e7e1ad0879b0e318e6cf2863b043fe7e2dc2b76d34e699050e1c256','employee','2026-10-29 14:06:10','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0','::ffff:127.0.0.1',NULL,NULL,'2026-10-29 06:06:10'),('e429a4c3-d35c-11f1-83f3-559b0b62ccd9','6987ebe0-6585-4ad4-b030-521fca873756','dabf839641e73de60231fcfa710bd2522d089d6e41f8faf29a698ac356c7717d','employee','2026-10-29 13:52:14','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','::ffff:127.0.0.1',NULL,NULL,'2026-10-29 05:52:14'),('e451371d-d35c-11f1-83f3-559b0b62ccd9','76be4023-e449-409e-a129-a1cfd95ec590','78eaf4a5bd9c56ecfaa23a4662399e23965d699e0e8c9fb21e3232288e0ed240','employee','2026-10-29 13:52:15','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','::ffff:127.0.0.1',NULL,NULL,'2026-10-29 05:52:14'),('e478b4fc-d35c-11f1-83f3-559b0b62ccd9','e9941b4c-c368-4337-98e5-361a9845de01','931fe9481b2367ddae5325e64a8fe29df197b5f1e58985e052acca026a7ba5f9','employee','2026-10-29 13:52:15','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','::ffff:127.0.0.1',NULL,NULL,'2026-10-29 05:52:14'),('e4a0337d-d35c-11f1-83f3-559b0b62ccd9','6e96d5e7-db7f-4b38-ad35-8d44477279fa','7bb60d7df0902e2a394686de0f9b6c804d44074bfe729a3689966b11e2f67456','employee','2026-10-29 13:52:15','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','::ffff:127.0.0.1',NULL,NULL,'2026-10-29 05:52:15'),('e4c93abd-d35c-11f1-83f3-559b0b62ccd9','2c8fcffb-5516-4eea-99e1-dc970454b8c2','d0618b799f2872d50fe50f48641446ce2e36783fec65ab0ba8a244b1d036f400','employee','2026-10-29 13:52:15','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','::ffff:127.0.0.1',NULL,NULL,'2026-10-29 05:52:15'),('e796e001-d358-11f1-83f3-559b0b62ccd9','fae21754-aae1-437e-9256-45ff69f09700','93420443f55fd3dd6b7114543cc8dc0a18d121405fd52e846d9801121dfd9382','hr','2026-10-29 13:23:42','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.9711','::ffff:127.0.0.1',NULL,NULL,'2026-10-29 05:23:42');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_projects`
--

DROP TABLE IF EXISTS `student_projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_projects` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `github_repo_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `repo_owner` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `repo_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `branch` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'main',
  `last_commit_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `repo_structure` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `manager_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_user_ids` json DEFAULT NULL,
  `priority` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'MEDIUM',
  `due_date` date DEFAULT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_repo` (`student_id`,`github_repo_url`(255)),
  KEY `idx_student` (`student_id`),
  KEY `idx_repo` (`github_repo_url`(255)),
  KEY `idx_projects_manager` (`manager_id`),
  CONSTRAINT `student_projects_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_projects`
--

LOCK TABLES `student_projects` WRITE;
/*!40000 ALTER TABLE `student_projects` DISABLE KEYS */;
INSERT INTO `student_projects` VALUES ('b6ea6b83-998a-4e10-bee1-457662b34ed8','368f5c88-12cd-11ed-861d-0242ac120002','Ethiroli Core Platform','LMS and HRMS portal repo','https://github.com/ethiroli/core-1793257837151','ethiroli','core','main',NULL,NULL,1,'2026-10-29 07:10:37','2026-10-29 07:10:37',NULL,NULL,'MEDIUM',NULL,'ACTIVE');
/*!40000 ALTER TABLE `student_projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `client_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `monthly_fee` decimal(10,2) NOT NULL,
  `start_date` date NOT NULL,
  `renewal_date` date NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_client` (`client_id`),
  KEY `idx_renewal` (`renewal_date`),
  CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_tickets`
--

DROP TABLE IF EXISTS `support_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `support_tickets` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `ticket_number` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('IT_SUPPORT','HR_QUERY','PAYROLL_ISSUE','FACILITIES','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('LOW','MEDIUM','HIGH','URGENT') COLLATE utf8mb4_unicode_ci DEFAULT 'MEDIUM',
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `attachment_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('OPEN','IN_PROGRESS','RESOLVED','CLOSED') COLLATE utf8mb4_unicode_ci DEFAULT 'OPEN',
  `assigned_to` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_number` (`ticket_number`),
  KEY `assigned_to` (`assigned_to`),
  KEY `idx_user_status` (`user_id`,`status`),
  KEY `idx_category` (`category`),
  CONSTRAINT `support_tickets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `support_tickets_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_tickets`
--

LOCK TABLES `support_tickets` WRITE;
/*!40000 ALTER TABLE `support_tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `support_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_configs`
--

DROP TABLE IF EXISTS `system_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_configs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_value` json NOT NULL,
  `is_encrypted` tinyint(1) NOT NULL DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_configs`
--

LOCK TABLES `system_configs` WRITE;
/*!40000 ALTER TABLE `system_configs` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_error_logs`
--

DROP TABLE IF EXISTS `system_error_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_error_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `service_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `error_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `stack_trace` longtext COLLATE utf8mb4_unicode_ci,
  `endpoint` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `method` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status_code` int DEFAULT NULL,
  `request_payload` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_resolved` tinyint(1) DEFAULT '0',
  `resolved_at` datetime DEFAULT NULL,
  `resolution_notes` text COLLATE utf8mb4_unicode_ci,
  `resolved_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `resolved_by` (`resolved_by`),
  KEY `idx_service` (`service_name`),
  KEY `idx_error_type` (`error_type`),
  KEY `idx_resolved` (`is_resolved`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `system_error_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `system_error_logs_ibfk_2` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_error_logs`
--

LOCK TABLES `system_error_logs` WRITE;
/*!40000 ALTER TABLE `system_error_logs` DISABLE KEYS */;
INSERT INTO `system_error_logs` VALUES (1,'API','5XX','Failed to establish connection payload to LinkedIn OAuth sandbox endpoint.',NULL,'/api/v1/jobs-board/post','POST',502,NULL,NULL,NULL,1,'2026-10-29 12:40:37','LinkedIn sandbox API endpoints modified by platform. Retried.','368f5c88-12cd-11ed-861d-0242ac120002','2026-10-29 07:10:37','2026-10-29 07:10:37');
/*!40000 ALTER TABLE `system_error_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_history`
--

DROP TABLE IF EXISTS `task_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `task_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actor_user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_type` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `from_status` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_status` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_task_history` (`task_id`,`created_at`),
  KEY `fk_task_history_actor` (`actor_user_id`),
  CONSTRAINT `fk_task_history_actor` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_task_history_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_history`
--

LOCK TABLES `task_history` WRITE;
/*!40000 ALTER TABLE `task_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `task_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `subscription_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `due_date` date NOT NULL,
  `status` enum('PENDING','IN_PROGRESS','UNDER_REVIEW','COMPLETED','BLOCKED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `assigned_to` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `project_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sprint_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `milestone_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `priority` enum('LOW','MEDIUM','HIGH','CRITICAL') COLLATE utf8mb4_unicode_ci DEFAULT 'MEDIUM',
  `estimated_hours` decimal(4,1) DEFAULT '0.0',
  `actual_hours` decimal(4,1) DEFAULT '0.0',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `submission_note` text COLLATE utf8mb4_unicode_ci,
  `review_note` text COLLATE utf8mb4_unicode_ci,
  `reviewed_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `assigned_to` (`assigned_to`),
  KEY `idx_subscription` (`subscription_id`),
  KEY `idx_due_date` (`due_date`),
  KEY `idx_task_creator` (`created_by`),
  KEY `idx_task_review` (`status`,`assigned_to`,`due_date`),
  KEY `fk_task_reviewer` (`reviewed_by`),
  CONSTRAINT `fk_task_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_task_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tax_filings`
--

DROP TABLE IF EXISTS `tax_filings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tax_filings` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `return_type` enum('GSTR1','GSTR3B','GSTR2B','TDS_26Q','TDS_24Q','ADVANCE_TAX') COLLATE utf8mb4_unicode_ci NOT NULL,
  `filing_period` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `due_date` date NOT NULL,
  `filed_date` date DEFAULT NULL,
  `arn_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_payable` decimal(12,2) DEFAULT '0.00',
  `tax_paid` decimal(12,2) DEFAULT '0.00',
  `status` enum('DRAFT','FILED','VERIFIED','OVERDUE') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `acknowledgment_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_return_period` (`return_type`,`filing_period`),
  KEY `idx_tax_status` (`status`),
  CONSTRAINT `tax_filings_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tax_filings`
--

LOCK TABLES `tax_filings` WRITE;
/*!40000 ALTER TABLE `tax_filings` DISABLE KEYS */;
/*!40000 ALTER TABLE `tax_filings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `technology_modules`
--

DROP TABLE IF EXISTS `technology_modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `technology_modules` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration_hours` int NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `topics` json DEFAULT NULL,
  `technologies` json DEFAULT NULL,
  `practicals` json DEFAULT NULL,
  `projects` json DEFAULT NULL,
  `prerequisites` json DEFAULT NULL,
  `learning_outcomes` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`),
  KEY `idx_category_level` (`category`,`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `technology_modules`
--

LOCK TABLES `technology_modules` WRITE;
/*!40000 ALTER TABLE `technology_modules` DISABLE KEYS */;
/*!40000 ALTER TABLE `technology_modules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_users`
--

DROP TABLE IF EXISTS `tenant_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tenant_user` (`user_id`,`tenant_id`),
  KEY `idx_tenant` (`tenant_id`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `tenant_users_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tenant_users_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_users`
--

LOCK TABLES `tenant_users` WRITE;
/*!40000 ALTER TABLE `tenant_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenant_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subdomain` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `custom_domain` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primary_color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '#4F46E5',
  `secondary_color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '#0EA5E9',
  `favicon_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_from` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timezone` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Asia/Kolkata',
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'INR',
  `is_active` tinyint(1) DEFAULT '1',
  `settings` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subdomain` (`subdomain`),
  KEY `idx_subdomain` (`subdomain`),
  KEY `idx_custom_domain` (`custom_domain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES ('46f13687-ec4b-468e-b8cf-c6803c0f8792','Coimbatore Learning Institute','cbe-learning-1793257837688',NULL,NULL,'#4F46E5','#0EA5E9',NULL,NULL,'Asia/Kolkata','INR',1,NULL,'2026-10-29 07:10:37','2026-10-29 07:10:37');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timesheets`
--

DROP TABLE IF EXISTS `timesheets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timesheets` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `task_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_date` date NOT NULL,
  `hours_spent` decimal(4,2) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('DRAFT','SUBMITTED','APPROVED','REJECTED') COLLATE utf8mb4_unicode_ci DEFAULT 'SUBMITTED',
  `approved_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `task_id` (`task_id`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_user_date` (`user_id`,`work_date`),
  KEY `idx_project` (`project_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `timesheets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `timesheets_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `student_projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `timesheets_ibfk_3` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL,
  CONSTRAINT `timesheets_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timesheets`
--

LOCK TABLES `timesheets` WRITE;
/*!40000 ALTER TABLE `timesheets` DISABLE KEYS */;
/*!40000 ALTER TABLE `timesheets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `type` enum('INCOME','EXPENSE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `invoice_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gst_applicable` tinyint(1) DEFAULT '0',
  `gst_amount` decimal(10,2) DEFAULT '0.00',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `payment_method` enum('BANK_TRANSFER','UPI','CARD','CASH','CHEQUE','RAZORPAY','STRIPE') COLLATE utf8mb4_unicode_ci DEFAULT 'BANK_TRANSFER',
  `reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_reconciled` tinyint(1) DEFAULT '0',
  `reconciled_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `invoice_id` (`invoice_id`),
  KEY `idx_type` (`type`),
  KEY `idx_date` (`date`),
  KEY `idx_category` (`category`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_badges`
--

DROP TABLE IF EXISTS `user_badges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_badges` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `badge_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `earned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_badge` (`user_id`,`badge_id`),
  KEY `badge_id` (`badge_id`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `user_badges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_badges_ibfk_2` FOREIGN KEY (`badge_id`) REFERENCES `badges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_badges`
--

LOCK TABLES `user_badges` WRITE;
/*!40000 ALTER TABLE `user_badges` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_badges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_credentials`
--

DROP TABLE IF EXISTS `user_credentials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_credentials` (
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_algo` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BCRYPT',
  `password_updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `failed_login_attempts` int NOT NULL DEFAULT '0',
  `lockout_until` timestamp NULL DEFAULT NULL,
  `requires_password_change` tinyint(1) NOT NULL DEFAULT '0',
  `password_history` json DEFAULT NULL,
  `two_factor_secret` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `two_factor_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_uc_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_credentials`
--

LOCK TABLES `user_credentials` WRITE;
/*!40000 ALTER TABLE `user_credentials` DISABLE KEYS */;
INSERT INTO `user_credentials` VALUES ('2c8fcffb-5516-4eea-99e1-dc970454b8c2','$2b$10$EH4DkVBM7AJ5czpaq8rehe/gSI3Tivxvt6aqVeaqxYXe8ZzH4v/1.','BCRYPT','2026-10-29 05:49:32',0,NULL,0,'[\"$2b$12$CTMCCJ1W7DWOLppsfhTV.OX/M/D7u6iRZ5jV.7X9TiBeFJgitPLIi\"]',NULL,0,'2026-10-29 05:49:32','2026-10-29 08:49:44'),('429d254c-ece3-4e52-b445-0e87b541b5f4','$2b$12$buebHHWl03zTbIWIkbIeteMGbHhnVKpEzkPSVhfgSnvn61MSinhFa','BCRYPT','2026-10-29 05:23:08',0,NULL,0,'[\"$2b$12$buebHHWl03zTbIWIkbIeteMGbHhnVKpEzkPSVhfgSnvn61MSinhFa\"]',NULL,0,'2026-10-29 05:23:08','2026-10-29 05:23:08'),('44f55fc2-753e-4d9b-b9d5-2ff1e0f994dc','$2b$04$5I1.0nGpkPcQTkAxFgKkUeRsgFxiqPlmU/17/oUYyVcnbiZInS0dK','BCRYPT','2026-10-28 18:06:24',0,NULL,0,'[\"$2b$04$5I1.0nGpkPcQTkAxFgKkUeRsgFxiqPlmU/17/oUYyVcnbiZInS0dK\"]',NULL,0,'2026-10-28 18:06:24','2026-10-28 18:06:24'),('5b594108-98b0-4cde-b908-80928e642998','$2b$10$TsYTmZF/pmSY0ql7LCKhGOMStt1Zp2/9sGsB2SCI2kOPa31x3408m','BCRYPT','2026-10-29 05:49:33',0,NULL,0,'[\"$2b$12$ANgL8d7I7W6VwfTdpvcXxukqMUHk5O4V1W2GLQkUsWlq5aW1P7waO\"]',NULL,0,'2026-10-29 05:49:33','2026-10-29 08:49:44'),('5e402aed-f6c0-4bdb-926a-f3310d27240f','$2b$10$8gy0A8MaoWTCRKYV55mfBOYG89vVeHYa4o/LHW6jsk1jM4ly/eCZK','BCRYPT','2026-10-29 05:26:41',0,NULL,0,'[\"$2b$12$d3vcvhssMuB0C1POEObD5eijGWS6IKyM641Iftu0ZiJBBRCLNeEPm\"]',NULL,0,'2026-10-29 05:26:41','2026-10-29 08:42:13'),('684b5dce-8c09-4128-b8eb-1e25bb2207ac','$2b$12$G7bIQU97YSzpc5oCQVuW3elRje5c.SNkwa1jg/a6QNNNC6Gk4dxhK','BCRYPT','2026-10-29 05:26:42',0,NULL,0,'[\"$2b$12$G7bIQU97YSzpc5oCQVuW3elRje5c.SNkwa1jg/a6QNNNC6Gk4dxhK\"]',NULL,0,'2026-10-29 05:26:42','2026-10-29 05:26:42'),('68557fb9-209d-4efa-a558-7dcff689444e','$2b$12$0OhXrpZx7zxj/VW1K73r4efggxdMSywEUKewI1Fq7sZhMakW8Xxue','BCRYPT','2026-10-29 05:23:07',0,NULL,0,'[\"$2b$12$0OhXrpZx7zxj/VW1K73r4efggxdMSywEUKewI1Fq7sZhMakW8Xxue\"]',NULL,0,'2026-10-29 05:23:07','2026-10-29 05:23:07'),('6987ebe0-6585-4ad4-b030-521fca873756','$2b$10$55j01r1kCe0xIXJu.IXgt.InyR7w/inO4k83yz3dG/h5VYZZq6jDO','BCRYPT','2026-10-29 05:49:31',0,NULL,0,'[\"$2b$12$JCw5HX5alJsrJU8HRdx1IeLc7s0bd0mQxx6AFaiEvy2XiGDylnqb6\"]',NULL,0,'2026-10-29 05:49:31','2026-10-29 08:49:44'),('6e96d5e7-db7f-4b38-ad35-8d44477279fa','$2b$10$5MUKWclKtem.BU/fWta5wuofVYnjjr4c8mjyNOppqeZlfjShfSXkK','BCRYPT','2026-10-29 05:49:32',0,NULL,0,'[\"$2b$12$9sbWUm5DVVXhsttdyPSr0e4Ux.f5JThnEPQ0yi4P9KeO6o9k3F9fS\"]',NULL,0,'2026-10-29 05:49:32','2026-10-29 08:49:44'),('76be4023-e449-409e-a129-a1cfd95ec590','$2b$10$S2VslBG9xFoFuwd4dSNEkO9WMJFwSAjPn/iB/giKBRxjeCF9tC/Bi','BCRYPT','2026-10-29 05:49:31',0,NULL,0,'[\"$2b$12$9e9/g8q8C2kjCKnPvH16D./diodx4EX7daEaMpA5FQyxZNvUEn0w6\"]',NULL,0,'2026-10-29 05:49:31','2026-10-29 08:49:44'),('922767e5-1d3b-4695-a444-db92f82057b3','$2b$10$8gy0A8MaoWTCRKYV55mfBOYG89vVeHYa4o/LHW6jsk1jM4ly/eCZK','BCRYPT','2026-10-29 05:26:41',0,NULL,0,'[\"$2b$12$Ds.1QTREJV.2YBAfDzvTSeQhj2EX7eLuMXoLLyV/4SV7UazOC39gG\"]',NULL,0,'2026-10-29 05:26:41','2026-10-29 08:42:13'),('a80f8109-e4bd-4f7c-a712-5f76f276deec','$2b$10$8gy0A8MaoWTCRKYV55mfBOYG89vVeHYa4o/LHW6jsk1jM4ly/eCZK','BCRYPT','2026-10-29 05:23:07',0,NULL,0,'[\"$2b$12$g9DXV8/aFwGhHpBtaTUk/eWOdfLecu/pR8jLPUm2d6n0iDHhVfiVu\"]',NULL,0,'2026-10-29 05:23:07','2026-10-29 08:42:13'),('c661ef02-aeb6-42e6-a31e-0f07ccf69989','$2b$10$8gy0A8MaoWTCRKYV55mfBOYG89vVeHYa4o/LHW6jsk1jM4ly/eCZK','BCRYPT','2026-10-29 05:26:41',0,NULL,0,'[\"$2b$12$P1rR2m6QkrVQiZs/0mzbh.i3GezRl1pI31Ko0JpXIpEXuIiBWyPSS\"]',NULL,0,'2026-10-29 05:26:41','2026-10-29 08:42:13'),('d0ad4394-a479-4c93-9b30-179d9d09d05d','$2b$10$aLDEL4VPbs4CGd7BfRCIGeJLPa4pxhX3YQZSnf7L/R.sQwJ9FCUta','BCRYPT','2026-10-29 05:49:31',0,NULL,0,'[\"$2b$12$nJp6PboEi3vgB1JlG/4aV.PNX3u9Tj7PNplDEkRyWwK0JdNcm3liG\"]',NULL,0,'2026-10-29 05:49:31','2026-10-29 08:49:44'),('e9941b4c-c368-4337-98e5-361a9845de01','$2b$10$fVmGpZx0OyjW3vxShhc8pe4txQV4UL73jZlkkf8UpMKEJ..AK3PCe','BCRYPT','2026-10-29 05:49:32',0,NULL,0,'[\"$2b$12$/bSLqkAdvfgFyCGjsTebjOjUX49pTC84WXfsNielsIMuSFW4U1fBG\"]',NULL,0,'2026-10-29 05:49:32','2026-10-29 08:49:44'),('f55ab612-cec0-492e-9f6d-2518ce43c976','$2b$12$oP4l9wMM68T4yLQT7GHyGO5MTczBwkfDVthURF1JIdwZqD3.NVntu','BCRYPT','2026-10-29 05:23:07',0,NULL,0,'[\"$2b$12$oP4l9wMM68T4yLQT7GHyGO5MTczBwkfDVthURF1JIdwZqD3.NVntu\"]',NULL,0,'2026-10-29 05:23:07','2026-10-29 05:23:07'),('f89fa77e-a263-46df-b40c-32ba3f14738e','$2b$04$5I1.0nGpkPcQTkAxFgKkUeRsgFxiqPlmU/17/oUYyVcnbiZInS0dK','BCRYPT','2026-10-28 18:05:45',0,NULL,0,'[\"$2b$04$5I1.0nGpkPcQTkAxFgKkUeRsgFxiqPlmU/17/oUYyVcnbiZInS0dK\"]',NULL,0,'2026-10-28 18:05:45','2026-10-28 18:05:45'),('fae21754-aae1-437e-9256-45ff69f09700','$2b$12$E0LNIKP9FbhwTRg.Tm603e6hyvOsZ.nN1YLUr7evqAH/QhOfoiIaG','BCRYPT','2026-10-29 05:23:07',0,NULL,0,'[\"$2b$12$E0LNIKP9FbhwTRg.Tm603e6hyvOsZ.nN1YLUr7evqAH/QhOfoiIaG\"]',NULL,0,'2026-10-29 05:23:07','2026-10-29 05:23:07');
/*!40000 ALTER TABLE `user_credentials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_by` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYSTEM',
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_role_tenant` (`user_id`,`role_id`,`tenant_id`),
  KEY `fk_ur_role` (`role_id`),
  KEY `idx_ur_user` (`user_id`),
  KEY `idx_ur_tenant` (`tenant_id`),
  CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES ('afe9648d-d375-11f1-83f3-559b0b62ccd9','2c8fcffb-5516-4eea-99e1-dc970454b8c2','role-employee',NULL,'SYSTEM','2026-10-29 08:49:44',NULL),('afe96968-d375-11f1-83f3-559b0b62ccd9','429d254c-ece3-4e52-b445-0e87b541b5f4','role-intern',NULL,'SYSTEM','2026-10-29 08:49:44',NULL),('afe96ad3-d375-11f1-83f3-559b0b62ccd9','44f55fc2-753e-4d9b-b9d5-2ff1e0f994dc','role-hr',NULL,'SYSTEM','2026-10-29 08:49:44',NULL),('afe96bb0-d375-11f1-83f3-559b0b62ccd9','5b594108-98b0-4cde-b908-80928e642998','role-hr',NULL,'SYSTEM','2026-10-29 08:49:44',NULL),('afe96c96-d375-11f1-83f3-559b0b62ccd9','5e402aed-f6c0-4bdb-926a-f3310d27240f','role-super-admin',NULL,'SYSTEM','2026-10-29 08:49:44',NULL),('afe96d7a-d375-11f1-83f3-559b0b62ccd9','684b5dce-8c09-4128-b8eb-1e25bb2207ac','role-employee',NULL,'SYSTEM','2026-10-29 08:49:44',NULL),('afe96e83-d375-11f1-83f3-559b0b62ccd9','68557fb9-209d-4efa-a558-7dcff689444e','role-super-admin',NULL,'SYSTEM','2026-10-29 08:49:44',NULL),('afe96fac-d375-11f1-83f3-559b0b62ccd9','6987ebe0-6585-4ad4-b030-521fca873756','role-employee',NULL,'SYSTEM','2026-10-29 08:49:44',NULL),('afe970d9-d375-11f1-83f3-559b0b62ccd9','6e96d5e7-db7f-4b38-ad35-8d44477279fa','role-employee',NULL,'SYSTEM','2026-10-29 08:49:44',NULL),('afe971f6-d375-11f1-83f3-559b0b62ccd9','76be4023-e449-409e-a129-a1cfd95ec590','role-employee',NULL,'SYSTEM','2026-10-29 08:49:44',NULL),('afe9734f-d375-11f1-83f3-559b0b62ccd9','a80f8109-e4bd-4f7c-a712-5f76f276deec','role-employee',NULL,'SYSTEM','2026-10-29 08:49:44',NULL),('afe97492-d375-11f1-83f3-559b0b62ccd9','c661ef02-aeb6-42e6-a31e-0f07ccf69989','role-hr',NULL,'SYSTEM','2026-10-29 08:49:44',NULL),('afe975be-d375-11f1-83f3-559b0b62ccd9','d0ad4394-a479-4c93-9b30-179d9d09d05d','role-employee',NULL,'SYSTEM','2026-10-29 08:49:44',NULL),('afe976db-d375-11f1-83f3-559b0b62ccd9','e9941b4c-c368-4337-98e5-361a9845de01','role-employee',NULL,'SYSTEM','2026-10-29 08:49:44',NULL),('afe97828-d375-11f1-83f3-559b0b62ccd9','f89fa77e-a263-46df-b40c-32ba3f14738e','role-employee',NULL,'SYSTEM','2026-10-29 08:49:44',NULL),('afe97965-d375-11f1-83f3-559b0b62ccd9','fae21754-aae1-437e-9256-45ff69f09700','role-hr',NULL,'SYSTEM','2026-10-29 08:49:44',NULL),('b89a6a46-d375-11f1-83f3-559b0b62ccd9','2c8fcffb-5516-4eea-99e1-dc970454b8c2','role-employee',NULL,'SYSTEM','2026-10-29 08:49:58',NULL),('b89a6e70-d375-11f1-83f3-559b0b62ccd9','429d254c-ece3-4e52-b445-0e87b541b5f4','role-intern',NULL,'SYSTEM','2026-10-29 08:49:58',NULL),('b89a6fd6-d375-11f1-83f3-559b0b62ccd9','44f55fc2-753e-4d9b-b9d5-2ff1e0f994dc','role-hr',NULL,'SYSTEM','2026-10-29 08:49:58',NULL),('b89a717c-d375-11f1-83f3-559b0b62ccd9','5b594108-98b0-4cde-b908-80928e642998','role-hr',NULL,'SYSTEM','2026-10-29 08:49:58',NULL),('b89a7361-d375-11f1-83f3-559b0b62ccd9','5e402aed-f6c0-4bdb-926a-f3310d27240f','role-super-admin',NULL,'SYSTEM','2026-10-29 08:49:58',NULL),('b89a749a-d375-11f1-83f3-559b0b62ccd9','684b5dce-8c09-4128-b8eb-1e25bb2207ac','role-employee',NULL,'SYSTEM','2026-10-29 08:49:58',NULL),('b89a75bc-d375-11f1-83f3-559b0b62ccd9','68557fb9-209d-4efa-a558-7dcff689444e','role-super-admin',NULL,'SYSTEM','2026-10-29 08:49:58',NULL),('b89a76e7-d375-11f1-83f3-559b0b62ccd9','6987ebe0-6585-4ad4-b030-521fca873756','role-employee',NULL,'SYSTEM','2026-10-29 08:49:58',NULL),('b89a77ee-d375-11f1-83f3-559b0b62ccd9','6e96d5e7-db7f-4b38-ad35-8d44477279fa','role-employee',NULL,'SYSTEM','2026-10-29 08:49:58',NULL),('b89a78f0-d375-11f1-83f3-559b0b62ccd9','76be4023-e449-409e-a129-a1cfd95ec590','role-employee',NULL,'SYSTEM','2026-10-29 08:49:58',NULL),('b89a7a1f-d375-11f1-83f3-559b0b62ccd9','a80f8109-e4bd-4f7c-a712-5f76f276deec','role-employee',NULL,'SYSTEM','2026-10-29 08:49:58',NULL),('b89a7b4b-d375-11f1-83f3-559b0b62ccd9','c661ef02-aeb6-42e6-a31e-0f07ccf69989','role-hr',NULL,'SYSTEM','2026-10-29 08:49:58',NULL),('b89a7c5a-d375-11f1-83f3-559b0b62ccd9','d0ad4394-a479-4c93-9b30-179d9d09d05d','role-employee',NULL,'SYSTEM','2026-10-29 08:49:58',NULL),('b89a7d5f-d375-11f1-83f3-559b0b62ccd9','e9941b4c-c368-4337-98e5-361a9845de01','role-employee',NULL,'SYSTEM','2026-10-29 08:49:58',NULL),('b89a7e86-d375-11f1-83f3-559b0b62ccd9','f89fa77e-a263-46df-b40c-32ba3f14738e','role-employee',NULL,'SYSTEM','2026-10-29 08:49:58',NULL),('b89a7f9a-d375-11f1-83f3-559b0b62ccd9','fae21754-aae1-437e-9256-45ff69f09700','role-hr',NULL,'SYSTEM','2026-10-29 08:49:58',NULL);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('SUPER_ADMIN','ADMIN','HR','TUTOR','PROJECT_MANAGER','FINANCE','SALES','RECEPTION','EMPLOYEE','STUDENT','INTERN','CLIENT','VENDOR') COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar_url` mediumtext COLLATE utf8mb4_unicode_ci,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `preferences` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_intern_head` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('2c8fcffb-5516-4eea-99e1-dc970454b8c2','d3ca4f4dfe0c1ad1f13a1b58:317b7cd6c1ef147347ef080b2281bd17:81d3b47e661975db99d95728dcf69a94db56e40c0aacf3','$2b$10$EH4DkVBM7AJ5czpaq8rehe/gSI3Tivxvt6aqVeaqxYXe8ZzH4v/1.','1de41a88c94d06e80c610989:e82b1e8550abbfdb97f50ef97de0332e:25d4833697fe3bd6addc28b949',NULL,'EMPLOYEE',NULL,'2026-10-29 05:52:15',1,NULL,'2026-10-29 05:49:32','2026-10-29 06:12:18',0),('429d254c-ece3-4e52-b445-0e87b541b5f4','589fa4553eecb5d2370344f7:1ea77e85420b95d30445ce392b0bb0fc:2a54d11d4a3ba6a82ab0ad59233d557608266acbb3495f8e0cbc83','$2b$12$buebHHWl03zTbIWIkbIeteMGbHhnVKpEzkPSVhfgSnvn61MSinhFa','0a2f5512a659a0e03ed5ede4:9999e8a00e017a7bb5b113a951b807aa:820f5d466e4a4d7260f224b4c55c19ffec96',NULL,'INTERN',NULL,'2026-10-29 05:23:08',1,NULL,'2026-10-29 05:22:38','2026-10-29 05:23:08',0),('44f55fc2-753e-4d9b-b9d5-2ff1e0f994dc','0b6b65dd4a3c99e922b1f12a:3660b47a58d399a8efd62e75a1b84bef:2fc3f2abbffa59475041610c765291fec00ed08c1f07859740084e9dc681','$2b$04$5I1.0nGpkPcQTkAxFgKkUeRsgFxiqPlmU/17/oUYyVcnbiZInS0dK','e9c218645088e51c64fc29af:d6423e2b7b4ef1054cfbd341be4bd923:dc7b1fcd624586bc775bcb32eaf84df9761efc6be92c',NULL,'HR',NULL,'2026-10-28 18:08:12',1,NULL,'2026-10-28 18:04:16','2026-10-28 18:08:12',0),('5b594108-98b0-4cde-b908-80928e642998','f7972af8ac8555bf6a245a88:0e03d2b1c95ce3c02f36b698de61c461:c67bdc98f3d61945deea5395c568e1783de89ef27e8716','$2b$10$TsYTmZF/pmSY0ql7LCKhGOMStt1Zp2/9sGsB2SCI2kOPa31x3408m','220e7bc7c0f34db9dcc44a30:edb5f63ff3f82675890538c6f62d5af0:fe32f84dde51cf988a',NULL,'HR',NULL,'2026-10-29 06:32:36',1,NULL,'2026-10-29 05:49:33','2026-10-29 06:32:35',0),('5e402aed-f6c0-4bdb-926a-f3310d27240f','53486c11cd2ccfd39a589c8f:4d417baac6661aefff9c9abf0d90a97d:1f4ceebfd36abcd1393a242262a887523008baa2','$2b$10$8gy0A8MaoWTCRKYV55mfBOYG89vVeHYa4o/LHW6jsk1jM4ly/eCZK','4eacb2077428319a68041903:5b09f8e47b5255f2b7c6fdfdda7c208b:814471d001577e3c06e7db00280405',NULL,'SUPER_ADMIN',NULL,'2026-10-29 09:04:56',1,NULL,'2026-10-29 05:26:41','2026-10-29 09:04:56',0),('684b5dce-8c09-4128-b8eb-1e25bb2207ac','e652bb5e76db5d1e5b93180c:4640dd9268a28244848f06179467e8f8:1cf1813e3d4d55e454428c97a8c8083646b8','$2b$12$G7bIQU97YSzpc5oCQVuW3elRje5c.SNkwa1jg/a6QNNNC6Gk4dxhK','74150558f9dda7275494f9a5:0be5f56d98a52f6edf2457a452a136f2:2dc1b5e90fff36d903e9990c69dd0527025d9d67',NULL,'EMPLOYEE',NULL,'2026-10-29 06:06:10',1,NULL,'2026-10-29 05:26:42','2026-10-29 06:06:10',0),('68557fb9-209d-4efa-a558-7dcff689444e','dce584eed2feb9d57e6d5b81:b7508b7e99174ddda689e0e111986778:8688c15e57595082175ce032fc890c74167dfe70b2f2516f','$2b$12$0OhXrpZx7zxj/VW1K73r4efggxdMSywEUKewI1Fq7sZhMakW8Xxue','1cc54e7499fe75df36a429c0:1510c22ae92c69ca1db6a54e7f168b7e:c9eca4fee2fa2d563d4e4f5fb72b4c',NULL,'SUPER_ADMIN',NULL,'2026-10-29 05:23:07',1,NULL,'2026-10-29 05:22:37','2026-10-29 05:23:07',0),('6987ebe0-6585-4ad4-b030-521fca873756','f24dcded34523c67e52cccd7:d04aab2cace4bcf6c19075767a2c24ba:e234a505fc3ab79e9bcd99979378df585781ae4573ac437fe8','$2b$10$55j01r1kCe0xIXJu.IXgt.InyR7w/inO4k83yz3dG/h5VYZZq6jDO','53c66fd04a23f14f06670815:59e4d2478d7410f67922d7bf2f66b330:afa44007b3a25ff4a906804e6d',NULL,'EMPLOYEE',NULL,'2026-10-29 05:52:14',1,NULL,'2026-10-29 05:49:31','2026-10-29 06:12:18',0),('6e96d5e7-db7f-4b38-ad35-8d44477279fa','3cb00bec9c3f1a7868692dc2:c9f65ce8106b238aafae5b7b96d6fbbb:65ee5dd5f6efa5f85cd7fd8fc8ecd826fab650a0e9ae','$2b$10$5MUKWclKtem.BU/fWta5wuofVYnjjr4c8mjyNOppqeZlfjShfSXkK','cb85cc07cfd8d1b68c6e9af2:ea2e7f72e35cba4bb1613bfa78630236:fcfcb4e8adbf46a76e21cd',NULL,'EMPLOYEE',NULL,'2026-10-29 05:52:15',1,NULL,'2026-10-29 05:49:32','2026-10-29 06:12:18',0),('76be4023-e449-409e-a129-a1cfd95ec590','75a91c45b6b5d1682a950693:9ad56c79e76403507f62583dc32accd8:3f9b1cbb278defc1ddffec7fa9c57b8192d74f5543c1','$2b$10$S2VslBG9xFoFuwd4dSNEkO9WMJFwSAjPn/iB/giKBRxjeCF9tC/Bi','803694aa04076d3e3f37294d:31f7e2ac739affd39d519c201be34071:91dc7746243098e8fb48',NULL,'EMPLOYEE',NULL,'2026-10-29 05:52:15',1,NULL,'2026-10-29 05:49:31','2026-10-29 06:12:18',0),('922767e5-1d3b-4695-a444-db92f82057b3','b9f1d61bcb54a03aff930efc:59874ac73b82bae92655f0997318bb4d:fbe5bfa245779bb9cf3889b8d33169d7e1','$2b$10$8gy0A8MaoWTCRKYV55mfBOYG89vVeHYa4o/LHW6jsk1jM4ly/eCZK','8aefa78baff0fc515d37fe96:1cb896c2d02f2d0aba651cb647097586:e46acaa1cd9a072daea58821f18f63b88814dd',NULL,'PROJECT_MANAGER',NULL,'2026-10-29 09:00:20',1,NULL,'2026-10-29 05:26:41','2026-10-29 09:00:20',0),('a80f8109-e4bd-4f7c-a712-5f76f276deec','e652bb5e76db5d1e5b93180c:1d64ac87570845a345c4141be6367fbc:25390a50379106894edd86a95fe0b093a75c','$2b$10$8gy0A8MaoWTCRKYV55mfBOYG89vVeHYa4o/LHW6jsk1jM4ly/eCZK','32461c58819c06e9510bd75d:94e1702ff5034f6c776125d2fb7fccd2:2c0b0eff1ae742bdbf2e8405e3a98319c3217ecb',NULL,'EMPLOYEE',NULL,'2026-10-29 09:00:35',1,NULL,'2026-10-29 05:22:38','2026-10-29 09:00:34',0),('c661ef02-aeb6-42e6-a31e-0f07ccf69989','ffb43849a9185495806989a3:ccc6761698c9a22d533713997d407dc6:ee3bfb7141ab62f9e7137c9a','$2b$10$8gy0A8MaoWTCRKYV55mfBOYG89vVeHYa4o/LHW6jsk1jM4ly/eCZK','52f97fe258434f59cbccb038:1cffc14dfbbe7013f0b7c22edfecd69b:6438a75a2d82d034755de2ba1ce2',NULL,'HR',NULL,'2026-10-29 09:01:03',1,NULL,'2026-10-29 05:26:41','2026-10-29 09:01:03',0),('d0ad4394-a479-4c93-9b30-179d9d09d05d','197c5d15592a43790ea15cb9:585adf6769f3e41545d9bb2d2c006b8e:0f1de48f6e0c2061984db7caecd39bf8470f3a5d429b257a07cad9','$2b$10$aLDEL4VPbs4CGd7BfRCIGeJLPa4pxhX3YQZSnf7L/R.sQwJ9FCUta','42b3ac242ef61f0a51192d22:51c0ce025ff463b7f7d8739f4cb20b11:0f0ba3004ceb8c64dea3ec',NULL,'EMPLOYEE',NULL,'2026-10-29 05:55:58',1,NULL,'2026-10-29 05:49:31','2026-10-29 06:12:18',0),('e9941b4c-c368-4337-98e5-361a9845de01','dce14f3cf7898a7c500f1773:88a410aaee9d68c90ac4e43c17f8dd9e:90c8c44c3cd833152508bd73f0854cb526ee9723e202fdb758','$2b$10$fVmGpZx0OyjW3vxShhc8pe4txQV4UL73jZlkkf8UpMKEJ..AK3PCe','80a0e9039f000c9d05792f3f:3d1d0cf79d245e09d2cab733b82de9ca:25afd9e6da6eb99bf51172',NULL,'EMPLOYEE',NULL,'2026-10-29 05:52:15',1,NULL,'2026-10-29 05:49:32','2026-10-29 06:12:18',0),('f55ab612-cec0-492e-9f6d-2518ce43c976','4bf22f73fe60566901fd03e7:f5346c26c1f956ee446f4c0946319799:e342abee3398ae5fb3f6d51fcb36a96dede7ce702fe0fe1933284ba3','$2b$12$oP4l9wMM68T4yLQT7GHyGO5MTczBwkfDVthURF1JIdwZqD3.NVntu','9554fc7b0fe8ef35147f2dd2:797edcbb90a2256fac57c2b5799ede6e:04fec777e5258b3cee90d1adf2aa3b5d9e98dc',NULL,'PROJECT_MANAGER',NULL,'2026-10-29 05:23:08',1,NULL,'2026-10-29 05:22:37','2026-10-29 05:23:07',0),('f89fa77e-a263-46df-b40c-32ba3f14738e','a5ee3ec256d1df9c622c95d1:1a80ac780b75cb7daea06afcf305330c:16e777f809760c6972bc99adc339dafc0e99f977c27b7a075580e5a5012e9d059501d327','$2b$04$5I1.0nGpkPcQTkAxFgKkUeRsgFxiqPlmU/17/oUYyVcnbiZInS0dK','9574002fc9b347ada96830de:4ecbd6bbc121b4a429d7eaca212c21af:acab422d36ea3c680195f0454c3e106f52d15af688c933a82c5968e5',NULL,'EMPLOYEE',NULL,'2026-10-28 18:08:22',1,NULL,'2026-10-28 18:04:16','2026-10-28 18:08:21',0),('fae21754-aae1-437e-9256-45ff69f09700','e884d478095192b84c76b81e:ce2e8c1cec418a4424443dc6454ab729:e09394b5d7ecbc24e16b491e9396efa4858f805f731f3e','$2b$12$E0LNIKP9FbhwTRg.Tm603e6hyvOsZ.nN1YLUr7evqAH/QhOfoiIaG','b3733dfe682ffa7c20ac9f72:13daa4985e1ce0f5f3a8b08ae2697cb6:a5e5c76dd95fbdb9315465a96cde',NULL,'HR',NULL,'2026-10-29 05:23:42',1,NULL,'2026-10-29 05:22:37','2026-10-29 05:23:42',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `video_deliveries`
--

DROP TABLE IF EXISTS `video_deliveries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video_deliveries` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `task_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `delivered_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `client_approved` tinyint(1) DEFAULT '0',
  `client_comments` text COLLATE utf8mb4_unicode_ci,
  `payment_amount` decimal(10,2) DEFAULT NULL,
  `payment_status` enum('Unpaid','Paid','Pending Invoice') COLLATE utf8mb4_unicode_ci DEFAULT 'Unpaid',
  `delivery_notes` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_task_id` (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `video_deliveries`
--

LOCK TABLES `video_deliveries` WRITE;
/*!40000 ALTER TABLE `video_deliveries` DISABLE KEYS */;
/*!40000 ALTER TABLE `video_deliveries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `video_projects`
--

DROP TABLE IF EXISTS `video_projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video_projects` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `project_type` enum('Marketing','Training','Onboarding','Social Media','Corporate','Event') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Marketing',
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','On Hold','Completed','Cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `assigned_editor` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_assigned_editor` (`assigned_editor`),
  KEY `idx_status` (`status`),
  KEY `idx_project_type` (`project_type`),
  CONSTRAINT `fk_video_editor` FOREIGN KEY (`assigned_editor`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `video_projects`
--

LOCK TABLES `video_projects` WRITE;
/*!40000 ALTER TABLE `video_projects` DISABLE KEYS */;
/*!40000 ALTER TABLE `video_projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `video_reviews`
--

DROP TABLE IF EXISTS `video_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video_reviews` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `task_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reviewer` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `review_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `overall_rating` decimal(3,2) DEFAULT '0.00',
  `comments` text COLLATE utf8mb4_unicode_ci,
  `approve` tinyint(1) DEFAULT '0',
  `reject` tinyint(1) DEFAULT '0',
  `required_revisions` int DEFAULT '0',
  `status` enum('Pending','Approved','Rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  PRIMARY KEY (`id`),
  KEY `idx_task_id` (`task_id`),
  KEY `idx_reviewer` (`reviewer`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `video_reviews`
--

LOCK TABLES `video_reviews` WRITE;
/*!40000 ALTER TABLE `video_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `video_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `video_revisions`
--

DROP TABLE IF EXISTS `video_revisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video_revisions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `task_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `version_number` int DEFAULT '1',
  `previous_version` int DEFAULT '0',
  `video_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `revision_notes` text COLLATE utf8mb4_unicode_ci,
  `revised_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `revised_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `status` enum('Pending Approval','Approved','Rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending Approval',
  PRIMARY KEY (`id`),
  KEY `idx_task_id` (`task_id`),
  KEY `idx_version` (`version_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `video_revisions`
--

LOCK TABLES `video_revisions` WRITE;
/*!40000 ALTER TABLE `video_revisions` DISABLE KEYS */;
/*!40000 ALTER TABLE `video_revisions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `video_tasks`
--

DROP TABLE IF EXISTS `video_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video_tasks` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `project_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `video_type` enum('Instagram Reel','YouTube Video','Corporate Video','Webinar','Product Demo','Presentation') COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_editor` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Assigned','Editing','Internal Review','Client Review','Revision','Approved','Delivered') COLLATE utf8mb4_unicode_ci DEFAULT 'Assigned',
  `priority` enum('Low','Medium','High','Urgent') COLLATE utf8mb4_unicode_ci DEFAULT 'Medium',
  `estimated_hours` decimal(5,2) DEFAULT '2.00',
  `actual_hours` decimal(5,2) DEFAULT '0.00',
  `start_date` date DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `submitted_date` timestamp NULL DEFAULT NULL,
  `source_files` json DEFAULT NULL,
  `preview_video_url` text COLLATE utf8mb4_unicode_ci,
  `final_video_url` text COLLATE utf8mb4_unicode_ci,
  `revision_count` int DEFAULT '0',
  `approval_status` enum('Pending','Approved','Rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_assigned_editor` (`assigned_editor`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_deadline` (`deadline`),
  CONSTRAINT `fk_task_editor` FOREIGN KEY (`assigned_editor`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_task_project` FOREIGN KEY (`project_id`) REFERENCES `video_projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `video_tasks`
--

LOCK TABLES `video_tasks` WRITE;
/*!40000 ALTER TABLE `video_tasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `video_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `video_work_logs`
--

DROP TABLE IF EXISTS `video_work_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video_work_logs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `task_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `editor` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `log_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `actual_hours` decimal(5,2) DEFAULT '0.00',
  `task_completed` tinyint(1) DEFAULT '0',
  `blockers` json DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_task_id` (`task_id`),
  KEY `idx_editor` (`editor`),
  KEY `idx_log_date` (`log_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `video_work_logs`
--

LOCK TABLES `video_work_logs` WRITE;
/*!40000 ALTER TABLE `video_work_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `video_work_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visitor_logs`
--

DROP TABLE IF EXISTS `visitor_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visitor_logs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `visitor_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purpose` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `person_to_meet` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `person_to_meet_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `badge_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `check_in_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `check_out_time` datetime DEFAULT NULL,
  `status` enum('CHECKED_IN','CHECKED_OUT','EXPECTED') COLLATE utf8mb4_unicode_ci DEFAULT 'CHECKED_IN',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `person_to_meet` (`person_to_meet`),
  KEY `idx_status` (`status`),
  KEY `idx_check_in` (`check_in_time`),
  CONSTRAINT `visitor_logs_ibfk_1` FOREIGN KEY (`person_to_meet`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visitor_logs`
--

LOCK TABLES `visitor_logs` WRITE;
/*!40000 ALTER TABLE `visitor_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `visitor_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `webhook_subscriptions`
--

DROP TABLE IF EXISTS `webhook_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `webhook_subscriptions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `events` json NOT NULL,
  `secret` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_delivery_at` datetime DEFAULT NULL,
  `last_delivery_status` enum('SUCCESS','FAILED') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `failure_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_tenant` (`tenant_id`),
  CONSTRAINT `webhook_subscriptions_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `webhook_subscriptions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `webhook_subscriptions`
--

LOCK TABLES `webhook_subscriptions` WRITE;
/*!40000 ALTER TABLE `webhook_subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `webhook_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workflow_executions`
--

DROP TABLE IF EXISTS `workflow_executions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workflow_executions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `workflow_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_node_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','RUNNING','COMPLETED','FAILED','PAUSED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `execution_context` json DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `triggered_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `started_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `completed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  KEY `current_node_id` (`current_node_id`),
  KEY `triggered_by` (`triggered_by`),
  KEY `idx_workflow` (`workflow_id`),
  KEY `idx_entity` (`entity_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `workflow_executions_ibfk_1` FOREIGN KEY (`workflow_id`) REFERENCES `automation_workflows` (`id`) ON DELETE CASCADE,
  CONSTRAINT `workflow_executions_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `workflow_executions_ibfk_3` FOREIGN KEY (`current_node_id`) REFERENCES `workflow_nodes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `workflow_executions_ibfk_4` FOREIGN KEY (`triggered_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workflow_executions`
--

LOCK TABLES `workflow_executions` WRITE;
/*!40000 ALTER TABLE `workflow_executions` DISABLE KEYS */;
/*!40000 ALTER TABLE `workflow_executions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workflow_nodes`
--

DROP TABLE IF EXISTS `workflow_nodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workflow_nodes` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `workflow_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `node_type` enum('TRIGGER','ACTION','CONDITION','DELAY','EMAIL','SMS','CREATE_INVOICE','ENROLL_COURSE','UPDATE_CRM') COLLATE utf8mb4_unicode_ci NOT NULL,
  `node_config` json NOT NULL,
  `position_x` decimal(10,2) NOT NULL,
  `position_y` decimal(10,2) NOT NULL,
  `next_node_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `next_node_id` (`next_node_id`),
  KEY `idx_workflow` (`workflow_id`),
  CONSTRAINT `workflow_nodes_ibfk_1` FOREIGN KEY (`workflow_id`) REFERENCES `automation_workflows` (`id`) ON DELETE CASCADE,
  CONSTRAINT `workflow_nodes_ibfk_2` FOREIGN KEY (`next_node_id`) REFERENCES `workflow_nodes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workflow_nodes`
--

LOCK TABLES `workflow_nodes` WRITE;
/*!40000 ALTER TABLE `workflow_nodes` DISABLE KEYS */;
/*!40000 ALTER TABLE `workflow_nodes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workflows`
--

DROP TABLE IF EXISTS `workflows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workflows` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` enum('LEAVE','INVOICE','HIRING','EXPENSE','PURCHASE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_entity_type` (`entity_type`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workflows`
--

LOCK TABLES `workflows` WRITE;
/*!40000 ALTER TABLE `workflows` DISABLE KEYS */;
/*!40000 ALTER TABLE `workflows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'ethiroli_local_test'
--

--
-- Dumping routines for database 'ethiroli_local_test'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-29 14:35:16
