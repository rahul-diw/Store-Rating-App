-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: store_rating_db
-- ------------------------------------------------------
-- Server version	8.0.36

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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(60) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `address` varchar(400) NOT NULL,
  `role` enum('admin','user','store_owner') NOT NULL DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Test User For Store Rating','testuser@example.com','$2b$10$BAm9o1EvM6f9aL3oIiFyf.UWrW9/RxgFNS6MZZC10mAug/Qp/9kGy','Delhi, India','user','2026-09-03 09:47:07','2026-09-03 09:47:07'),(2,'Another Test User Account','anotheruser@example.com','$2b$10$VHv8aEIfQ64JFMNvI7d8XOT.8j.dp0FfWEwdngaS.tZgqumxhC4xW','Delhi, India','user','2026-09-03 09:49:29','2026-09-03 09:49:29'),(3,'Test','invalid-email','$2b$10$r7.xx9oQQAojgBvjIilugOD1dq3FcN7kfWQyInImmGXt0nVINmp5C','Delhi','user','2026-09-03 11:10:56','2026-09-03 11:10:56'),(4,'Test','validationtest987@example.com','$2b$10$68zf2F6NqpkhxSDxZUJKnOB5pBrATh3g4N98iSdmLGu3f5VZRT..C','Delhi','user','2026-09-03 11:18:22','2026-09-03 11:18:22'),(5,'Updated Store Owner Account','updatedstoreowner@example.com','$2b$10$jPiMGr65ACcLG93c9TM8KunGYdTC4rczI7wVDRC7ND3SsnSyN4c.q','Delhi, India','store_owner','2026-09-03 11:44:29','2026-09-04 14:59:27'),(6,'System Administrator Account','admin@storerating.com','$2b$10$3uq8TPLkt8.FMZolPW7OSuYEZWGpYAuqKF1fZfMBHz./EupDoDKxC','Admin Office, Delhi, India','admin','2026-09-03 17:35:52','2026-09-05 17:25:01'),(7,'Updated Store Owner Account','updatedstoreowner987@example.com','$2b$10$awPzf458g6jtFueXcxepDOMGuJgeW9ZfeA.vjy86dNkafq/2PGDgW','Mumbai, India','store_owner','2026-09-03 18:38:26','2026-09-04 15:00:53'),(8,'Test Store Owner Account','newstoreowner@example.com','$2b$10$9.BGZvaZqGAm3KPbNruH6ebOSIxN2SBq1Q3o6k2jlv09FXx1N7JFK','Mumbai, Maharashtra, India','store_owner','2026-09-04 14:57:31','2026-09-04 14:57:31'),(9,'Rahul Diwakar Store User','diwakarr135@gmail.com','$2b$10$DTJSlsxM.PULXrkodyb6JurX/ffbTuSVp2By1AluHVfKL/H.EUMFi','Agra, Uttar Pradesh, India','user','2026-09-04 19:18:02','2026-09-05 12:29:34'),(10,'Test Customer Account One','testcustomer@example.com','$2b$10$1Vpz7YMgupvNvOZWtYEiA.yhDsigZgIQZA/gi2mYE122zMO6zm2Hm','Agra, Uttar Pradesh, India','user','2026-09-05 14:07:06','2026-09-05 14:07:06'),(11,'Updated Test Customer Account','testcustomer2026@example.com','$2b$10$ZbzlwelhrIqEsiBlLgNw2ej8BXSMN.iCcQxG6RFZEITExACXO9fAW','Test customer address, India ','user','2026-09-05 18:01:44','2026-09-05 18:03:08');
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

-- Dump completed on 2026-09-07 13:20:05
