-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: cyber_dashboard
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `assessments`
--

DROP TABLE IF EXISTS `assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `overall_score` decimal(5,2) NOT NULL,
  `risk_level` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `assessments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessments`
--

LOCK TABLES `assessments` WRITE;
/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
INSERT INTO `assessments` VALUES (3,1,77.69,'Low Risk','2026-03-29 21:41:51'),(4,1,80.06,'Low Risk','2026-03-31 15:57:30'),(5,1,57.12,'Medium Risk','2026-03-31 17:27:09'),(6,1,56.31,'Medium Risk','2026-04-03 15:12:48'),(7,1,46.50,'Medium Risk','2026-04-03 15:15:45'),(8,1,18.75,'High Risk','2026-04-08 19:27:21'),(9,1,81.25,'Low Risk','2026-04-08 19:28:38'),(10,1,50.00,'Medium Risk','2026-04-08 21:43:10'),(11,1,50.12,'Medium Risk','2026-04-16 22:13:32'),(12,1,51.88,'Medium Risk','2026-04-16 22:14:53'),(13,1,58.94,'Medium Risk','2026-04-17 10:04:39'),(14,2,67.75,'Medium Risk','2026-04-17 15:40:45'),(15,2,18.75,'High Risk','2026-04-17 15:41:43'),(16,2,81.25,'Low Risk','2026-04-17 21:04:14'),(17,2,82.50,'Low Risk','2026-04-21 18:24:01'),(18,3,38.25,'High Risk','2026-04-22 15:52:57'),(19,3,73.50,'Medium Risk','2026-04-22 15:53:21');
/*!40000 ALTER TABLE `assessments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dimension_scores`
--

DROP TABLE IF EXISTS `dimension_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dimension_scores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `assessment_id` int NOT NULL,
  `dimension` varchar(100) NOT NULL,
  `score` decimal(5,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `assessment_id` (`assessment_id`),
  CONSTRAINT `dimension_scores_ibfk_1` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dimension_scores`
--

LOCK TABLES `dimension_scores` WRITE;
/*!40000 ALTER TABLE `dimension_scores` DISABLE KEYS */;
INSERT INTO `dimension_scores` VALUES (1,3,'Authentication & Account Security',87.50),(2,3,'Phishing & Social Engineering',75.00),(3,3,'Patch & Update Hygiene',81.25),(4,3,'Device Protection & Secure Configuration',81.25),(5,3,'Network Hygiene',75.00),(6,3,'Data Protection & Privacy',50.00),(7,4,'Authentication & Account Security',75.00),(8,4,'Phishing & Social Engineering',81.25),(9,4,'Patch & Update Hygiene',81.25),(10,4,'Device Protection & Secure Configuration',93.75),(11,4,'Network Hygiene',68.75),(12,4,'Data Protection & Privacy',81.25),(13,5,'Authentication & Account Security',37.50),(14,5,'Phishing & Social Engineering',50.00),(15,5,'Patch & Update Hygiene',75.00),(16,5,'Device Protection & Secure Configuration',75.00),(17,5,'Network Hygiene',56.25),(18,5,'Data Protection & Privacy',62.50),(19,6,'Authentication & Account Security',62.50),(20,6,'Phishing & Social Engineering',56.25),(21,6,'Patch & Update Hygiene',56.25),(22,6,'Device Protection & Secure Configuration',56.25),(23,6,'Network Hygiene',43.75),(24,6,'Data Protection & Privacy',56.25),(25,7,'Authentication & Account Security',50.00),(26,7,'Phishing & Social Engineering',50.00),(27,7,'Patch & Update Hygiene',31.25),(28,7,'Device Protection & Secure Configuration',50.00),(29,7,'Network Hygiene',43.75),(30,7,'Data Protection & Privacy',56.25),(31,8,'Authentication & Account Security',25.00),(32,8,'Phishing & Social Engineering',25.00),(33,8,'Patch & Update Hygiene',25.00),(34,8,'Device Protection & Secure Configuration',0.00),(35,8,'Network Hygiene',25.00),(36,8,'Data Protection & Privacy',0.00),(37,9,'Authentication & Account Security',75.00),(38,9,'Phishing & Social Engineering',75.00),(39,9,'Patch & Update Hygiene',75.00),(40,9,'Device Protection & Secure Configuration',100.00),(41,9,'Network Hygiene',75.00),(42,9,'Data Protection & Privacy',100.00),(43,10,'Authentication & Account Security',50.00),(44,10,'Phishing & Social Engineering',50.00),(45,10,'Patch & Update Hygiene',50.00),(46,10,'Device Protection & Secure Configuration',50.00),(47,10,'Network Hygiene',50.00),(48,10,'Data Protection & Privacy',50.00),(49,11,'Authentication & Account Security',50.00),(50,11,'Phishing & Social Engineering',37.50),(51,11,'Patch & Update Hygiene',56.25),(52,11,'Device Protection & Secure Configuration',62.50),(53,11,'Network Hygiene',31.25),(54,11,'Data Protection & Privacy',68.75),(55,12,'Authentication & Account Security',31.25),(56,12,'Phishing & Social Engineering',56.25),(57,12,'Patch & Update Hygiene',62.50),(58,12,'Device Protection & Secure Configuration',43.75),(59,12,'Network Hygiene',62.50),(60,12,'Data Protection & Privacy',75.00),(61,13,'Authentication & Account Security',50.00),(62,13,'Phishing & Social Engineering',62.50),(63,13,'Patch & Update Hygiene',62.50),(64,13,'Device Protection & Secure Configuration',56.25),(65,13,'Network Hygiene',56.25),(66,13,'Data Protection & Privacy',75.00),(67,14,'Authentication & Account Security',62.50),(68,14,'Phishing & Social Engineering',68.75),(69,14,'Patch & Update Hygiene',75.00),(70,14,'Device Protection & Secure Configuration',87.50),(71,14,'Network Hygiene',56.25),(72,14,'Data Protection & Privacy',50.00),(73,15,'Authentication & Account Security',25.00),(74,15,'Phishing & Social Engineering',25.00),(75,15,'Patch & Update Hygiene',25.00),(76,15,'Device Protection & Secure Configuration',0.00),(77,15,'Network Hygiene',25.00),(78,15,'Data Protection & Privacy',0.00),(79,16,'Authentication & Account Security',75.00),(80,16,'Phishing & Social Engineering',75.00),(81,16,'Patch & Update Hygiene',75.00),(82,16,'Device Protection & Secure Configuration',100.00),(83,16,'Network Hygiene',75.00),(84,16,'Data Protection & Privacy',100.00),(85,17,'Authentication & Account Security',80.00),(86,17,'Phishing & Social Engineering',80.00),(87,17,'Patch & Update Hygiene',75.00),(88,17,'Device Protection & Secure Configuration',100.00),(89,17,'Network Hygiene',66.67),(90,17,'Data Protection & Privacy',100.00),(91,18,'Authentication & Account Security',45.00),(92,18,'Phishing & Social Engineering',45.00),(93,18,'Patch & Update Hygiene',37.50),(94,18,'Device Protection & Secure Configuration',25.00),(95,18,'Network Hygiene',41.67),(96,18,'Data Protection & Privacy',25.00),(97,19,'Authentication & Account Security',60.00),(98,19,'Phishing & Social Engineering',60.00),(99,19,'Patch & Update Hygiene',75.00),(100,19,'Device Protection & Secure Configuration',100.00),(101,19,'Network Hygiene',66.67),(102,19,'Data Protection & Privacy',100.00);
/*!40000 ALTER TABLE `dimension_scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `text` text NOT NULL,
  `dimension` varchar(100) NOT NULL,
  `reverse_scored` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,'How often do you reuse the same password across different websites?','Authentication & Account Security',1,'2026-03-29 17:32:46'),(2,'Do you use a password manager to generate or store passwords?','Authentication & Account Security',0,'2026-03-29 17:32:46'),(3,'Do you use a unique password for important accounts (e.g., email, banking)?','Authentication & Account Security',0,'2026-03-29 17:32:46'),(4,'Do you enable two-factor authentication (2FA) on important accounts?','Authentication & Account Security',0,'2026-03-29 17:32:46'),(5,'Do you check the sender address before opening email attachments?','Phishing & Social Engineering',0,'2026-03-29 17:32:46'),(6,'Do you verify links before clicking them in emails or messages?','Phishing & Social Engineering',0,'2026-03-29 17:32:46'),(7,'Have you ever entered login credentials after clicking an email link?','Phishing & Social Engineering',1,'2026-03-29 17:32:46'),(8,'Do you report suspicious emails or messages?','Phishing & Social Engineering',0,'2026-03-29 17:32:46'),(9,'How often do you install operating system updates?','Patch & Update Hygiene',0,'2026-03-29 17:32:46'),(10,'Do you enable automatic updates on your devices?','Patch & Update Hygiene',0,'2026-03-29 17:32:46'),(11,'Do you delay installing security updates?','Patch & Update Hygiene',1,'2026-03-29 17:32:46'),(12,'Do you regularly update installed applications?','Patch & Update Hygiene',0,'2026-03-29 17:32:46'),(13,'Do you lock your device with password, PIN, or biometrics?','Device Protection & Secure Configuration',0,'2026-03-29 17:32:46'),(14,'Do you install applications only from trusted sources?','Device Protection & Secure Configuration',0,'2026-03-29 17:32:46'),(16,'Do you review application permissions regularly?','Device Protection & Secure Configuration',0,'2026-03-29 17:32:46'),(17,'Do you use public Wi-Fi for sensitive activities (banking, login)?','Network Hygiene',1,'2026-03-29 17:32:46'),(19,'Do you avoid connecting to unknown Wi-Fi networks?','Network Hygiene',0,'2026-03-29 17:32:46'),(20,'Do you postpone sensitive activities until you are on a trusted network?','Network Hygiene',0,'2026-03-29 17:32:46'),(21,'Do you regularly back up important files?','Data Protection & Privacy',0,'2026-03-29 17:32:46'),(22,'Do you review privacy settings on social media platforms?','Data Protection & Privacy',0,'2026-03-29 17:32:46'),(23,'Do you use built-in device/cloud protections for sensitive files and accounts?','Data Protection & Privacy',0,'2026-03-29 17:32:46'),(24,'Do you review what personal information is publicly visible on your online accounts?','Data Protection & Privacy',0,'2026-03-29 17:32:46'),(25,'Have you ever shared your account password with others or stored it in an insecure way (e.g., plain text, notes)?','Authentication & Account Security',1,'2026-04-21 17:53:17'),(26,'Do you ignore browser or system security warnings when accessing websites?','Phishing & Social Engineering',1,'2026-04-21 17:53:42');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions_backup`
--

DROP TABLE IF EXISTS `questions_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions_backup` (
  `id` int NOT NULL DEFAULT '0',
  `text` text NOT NULL,
  `dimension` varchar(100) NOT NULL,
  `reverse_scored` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions_backup`
--

LOCK TABLES `questions_backup` WRITE;
/*!40000 ALTER TABLE `questions_backup` DISABLE KEYS */;
INSERT INTO `questions_backup` VALUES (1,'How often do you reuse the same password across different websites?','Authentication & Account Security',1,'2026-03-29 17:32:46'),(2,'Do you use a password manager to generate or store passwords?','Authentication & Account Security',0,'2026-03-29 17:32:46'),(3,'How long are your typical passwords?','Authentication & Account Security',0,'2026-03-29 17:32:46'),(4,'Do you enable two-factor authentication (2FA) on important accounts?','Authentication & Account Security',0,'2026-03-29 17:32:46'),(5,'Do you check the sender address before opening email attachments?','Phishing & Social Engineering',0,'2026-03-29 17:32:46'),(6,'Do you verify links before clicking them in emails or messages?','Phishing & Social Engineering',0,'2026-03-29 17:32:46'),(7,'Have you ever entered login credentials after clicking an email link?','Phishing & Social Engineering',1,'2026-03-29 17:32:46'),(8,'Do you report suspicious emails or messages?','Phishing & Social Engineering',0,'2026-03-29 17:32:46'),(9,'How often do you install operating system updates?','Patch & Update Hygiene',0,'2026-03-29 17:32:46'),(10,'Do you enable automatic updates on your devices?','Patch & Update Hygiene',0,'2026-03-29 17:32:46'),(11,'Do you delay installing security updates?','Patch & Update Hygiene',1,'2026-03-29 17:32:46'),(12,'Do you regularly update installed applications?','Patch & Update Hygiene',0,'2026-03-29 17:32:46'),(13,'Do you lock your device with password, PIN, or biometrics?','Device Protection & Secure Configuration',0,'2026-03-29 17:32:46'),(14,'Do you install applications only from trusted sources?','Device Protection & Secure Configuration',0,'2026-03-29 17:32:46'),(15,'Do you use antivirus or built-in security protection?','Device Protection & Secure Configuration',0,'2026-03-29 17:32:46'),(16,'Do you review application permissions regularly?','Device Protection & Secure Configuration',0,'2026-03-29 17:32:46'),(17,'Do you use public Wi-Fi for sensitive activities (banking, login)?','Network Hygiene',1,'2026-03-29 17:32:46'),(18,'Do you verify that a website uses HTTPS before entering credentials?','Network Hygiene',0,'2026-03-29 17:32:46'),(19,'Do you avoid connecting to unknown Wi-Fi networks?','Network Hygiene',0,'2026-03-29 17:32:46'),(20,'Do you use VPN when using public networks?','Network Hygiene',0,'2026-03-29 17:32:46'),(21,'Do you regularly back up important files?','Data Protection & Privacy',0,'2026-03-29 17:32:46'),(22,'Do you review privacy settings on social media platforms?','Data Protection & Privacy',0,'2026-03-29 17:32:46'),(23,'Do you store sensitive files in encrypted form?','Data Protection & Privacy',0,'2026-03-29 17:32:46'),(24,'Do you delete unnecessary personal data online?','Data Protection & Privacy',0,'2026-03-29 17:32:46');
/*!40000 ALTER TABLE `questions_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `responses`
--

DROP TABLE IF EXISTS `responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `responses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `assessment_id` int NOT NULL,
  `question_id` int NOT NULL,
  `score` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `assessment_id` (`assessment_id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `responses_ibfk_1` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `responses_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=409 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `responses`
--

LOCK TABLES `responses` WRITE;
/*!40000 ALTER TABLE `responses` DISABLE KEYS */;
INSERT INTO `responses` VALUES (1,3,1,3),(2,3,2,4),(3,3,3,3),(4,3,4,4),(5,3,5,3),(6,3,6,4),(7,3,7,3),(8,3,8,2),(9,3,9,3),(10,3,10,4),(11,3,11,3),(12,3,12,3),(13,3,13,4),(14,3,14,4),(16,3,16,2),(17,3,17,3),(19,3,19,3),(20,3,20,2),(21,3,21,3),(22,3,22,2),(23,3,23,1),(24,3,24,2),(25,4,1,1),(26,4,2,4),(27,4,3,3),(28,4,4,4),(29,4,5,4),(30,4,6,3),(31,4,7,2),(32,4,8,4),(33,4,9,3),(34,4,10,4),(35,4,11,2),(36,4,12,4),(37,4,13,4),(38,4,14,4),(40,4,16,4),(41,4,17,2),(43,4,19,4),(44,4,20,2),(45,4,21,4),(46,4,22,4),(47,4,23,3),(48,4,24,2),(49,5,1,3),(50,5,2,1),(51,5,3,1),(52,5,4,1),(53,5,5,2),(54,5,6,2),(55,5,7,2),(56,5,8,2),(57,5,9,2),(58,5,10,3),(59,5,11,3),(60,5,12,4),(61,5,13,3),(62,5,14,4),(64,5,16,3),(65,5,17,3),(67,5,19,3),(68,5,20,1),(69,5,21,4),(70,5,22,3),(71,5,23,2),(72,5,24,1),(73,6,1,3),(74,6,2,2),(75,6,3,3),(76,6,4,2),(77,6,5,2),(78,6,6,4),(79,6,7,1),(80,6,8,2),(81,6,9,3),(82,6,10,1),(83,6,11,2),(84,6,12,3),(85,6,13,1),(86,6,14,2),(88,6,16,4),(89,6,17,2),(91,6,19,3),(92,6,20,1),(93,6,21,3),(94,6,22,2),(95,6,23,1),(96,6,24,3),(97,7,1,2),(98,7,2,2),(99,7,3,1),(100,7,4,3),(101,7,5,2),(102,7,6,1),(103,7,7,2),(104,7,8,3),(105,7,9,1),(106,7,10,2),(107,7,11,1),(108,7,12,1),(109,7,13,0),(110,7,14,0),(112,7,16,4),(113,7,17,1),(115,7,19,1),(116,7,20,3),(117,7,21,3),(118,7,22,1),(119,7,23,2),(120,7,24,3),(121,8,1,4),(122,8,2,0),(123,8,3,0),(124,8,4,0),(125,8,5,0),(126,8,6,0),(127,8,7,4),(128,8,8,0),(129,8,9,0),(130,8,10,0),(131,8,11,4),(132,8,12,0),(133,8,13,0),(134,8,14,0),(136,8,16,0),(137,8,17,4),(139,8,19,0),(140,8,20,0),(141,8,21,0),(142,8,22,0),(143,8,23,0),(144,8,24,0),(145,9,1,0),(146,9,2,4),(147,9,3,4),(148,9,4,4),(149,9,5,4),(150,9,6,4),(151,9,7,0),(152,9,8,4),(153,9,9,4),(154,9,10,4),(155,9,11,0),(156,9,12,4),(157,9,13,4),(158,9,14,4),(160,9,16,4),(161,9,17,0),(163,9,19,4),(164,9,20,4),(165,9,21,4),(166,9,22,4),(167,9,23,4),(168,9,24,4),(169,10,1,2),(170,10,2,2),(171,10,3,2),(172,10,4,2),(173,10,5,2),(174,10,6,2),(175,10,7,2),(176,10,8,2),(177,10,9,2),(178,10,10,2),(179,10,11,2),(180,10,12,2),(181,10,13,2),(182,10,14,2),(184,10,16,2),(185,10,17,2),(187,10,19,2),(188,10,20,2),(189,10,21,2),(190,10,22,2),(191,10,23,2),(192,10,24,2),(193,11,1,3),(194,11,2,2),(195,11,3,1),(196,11,4,2),(197,11,5,1),(198,11,6,2),(199,11,7,2),(200,11,8,1),(201,11,9,2),(202,11,10,4),(203,11,11,2),(204,11,12,1),(205,11,13,2),(206,11,14,2),(208,11,16,3),(209,11,17,1),(211,11,19,1),(212,11,20,1),(213,11,21,3),(214,11,22,4),(215,11,23,3),(216,11,24,1),(217,12,1,0),(218,12,2,1),(219,12,3,2),(220,12,4,2),(221,12,5,3),(222,12,6,1),(223,12,7,2),(224,12,8,3),(225,12,9,3),(226,12,10,1),(227,12,11,3),(228,12,12,3),(229,12,13,3),(230,12,14,2),(232,12,16,1),(233,12,17,1),(235,12,19,3),(236,12,20,3),(237,12,21,3),(238,12,22,3),(239,12,23,3),(240,12,24,3),(241,13,1,1),(242,13,2,2),(243,13,3,3),(244,13,4,2),(245,13,5,2),(246,13,6,3),(247,13,7,3),(248,13,8,2),(249,13,9,2),(250,13,10,3),(251,13,11,2),(252,13,12,3),(253,13,13,3),(254,13,14,2),(256,13,16,2),(257,13,17,2),(259,13,19,3),(260,13,20,2),(261,13,21,3),(262,13,22,3),(263,13,23,3),(264,13,24,3),(265,14,1,1),(266,14,2,3),(267,14,3,3),(268,14,4,3),(269,14,5,3),(270,14,6,4),(271,14,7,0),(272,14,8,4),(273,14,9,4),(274,14,10,3),(275,14,11,2),(276,14,12,3),(277,14,13,4),(278,14,14,4),(280,14,16,3),(281,14,17,2),(283,14,19,3),(284,14,20,2),(285,14,21,2),(286,14,22,2),(287,14,23,2),(288,14,24,2),(289,15,1,4),(290,15,2,0),(291,15,3,0),(292,15,4,0),(293,15,5,0),(294,15,6,0),(295,15,7,4),(296,15,8,0),(297,15,9,0),(298,15,10,0),(299,15,11,4),(300,15,12,0),(301,15,13,0),(302,15,14,0),(304,15,16,0),(305,15,17,4),(307,15,19,0),(308,15,20,0),(309,15,21,0),(310,15,22,0),(311,15,23,0),(312,15,24,0),(313,16,1,0),(314,16,2,4),(315,16,3,4),(316,16,4,4),(317,16,5,4),(318,16,6,4),(319,16,7,0),(320,16,8,4),(321,16,9,4),(322,16,10,4),(323,16,11,0),(324,16,12,4),(325,16,13,4),(326,16,14,4),(328,16,16,4),(329,16,17,0),(331,16,19,4),(332,16,20,4),(333,16,21,4),(334,16,22,4),(335,16,23,4),(336,16,24,4),(337,17,1,0),(338,17,2,4),(339,17,3,4),(340,17,4,4),(341,17,25,4),(342,17,5,4),(343,17,6,4),(344,17,7,0),(345,17,8,4),(346,17,26,4),(347,17,9,4),(348,17,10,4),(349,17,11,0),(350,17,12,4),(351,17,13,4),(352,17,14,4),(353,17,16,4),(354,17,17,0),(355,17,19,4),(356,17,20,4),(357,17,21,4),(358,17,22,4),(359,17,23,4),(360,17,24,4),(361,18,1,3),(362,18,2,1),(363,18,3,1),(364,18,4,1),(365,18,25,3),(366,18,5,1),(367,18,6,1),(368,18,7,3),(369,18,8,1),(370,18,26,3),(371,18,9,1),(372,18,10,1),(373,18,11,3),(374,18,12,1),(375,18,13,1),(376,18,14,1),(377,18,16,1),(378,18,17,3),(379,18,19,1),(380,18,20,1),(381,18,21,1),(382,18,22,1),(383,18,23,1),(384,18,24,1),(385,19,1,0),(386,19,2,4),(387,19,3,4),(388,19,4,4),(389,19,25,0),(390,19,5,4),(391,19,6,4),(392,19,7,0),(393,19,8,4),(394,19,26,0),(395,19,9,4),(396,19,10,4),(397,19,11,0),(398,19,12,4),(399,19,13,4),(400,19,14,4),(401,19,16,4),(402,19,17,0),(403,19,19,4),(404,19,20,4),(405,19,21,4),(406,19,22,4),(407,19,23,4),(408,19,24,4);
/*!40000 ALTER TABLE `responses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'test@example.com','dummyhash','2026-03-29 21:41:42'),(2,'dengustyr@gmail.com','$bcrypt-sha256$v=2,t=2b,r=12$uNZuuvbh/XdkdhS3iGWX4e$14dYSvPeHt2tBfUxqsMLVlqIJ6vstn.','2026-04-17 14:02:55'),(3,'gustyr@gmail.com','$bcrypt-sha256$v=2,t=2b,r=12$0mcjcJjIIKRgHOwGjH0jdu$P2KjQ5kUzr06FdOoaxNsiKcJsb2h5OG','2026-04-22 15:52:14');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-22 23:18:55
