-- Création de la base de données
CREATE DATABASE IF NOT EXISTS eLearningDB;
USE eLearningDB;

-- Table Users
CREATE TABLE Users (
    idUser INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mdp VARCHAR(512) NOT NULL,
    phone VARCHAR(20),
    roles ENUM('admin', 'teacher', 'student') NOT NULL,
    class VARCHAR(50),
    speciality VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(255), 
    reset_token_expiry DATETIME
) ENGINE=InnoDB;

-- Table loginRequest
CREATE TABLE loginRequest (
    idRequest INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mdp VARCHAR(512) NOT NULL, 
    phone VARCHAR(20), 
    roles ENUM('teacher', 'student') NOT NULL,
    class VARCHAR(50), 
    speciality VARCHAR(50)
) ENGINE=InnoDB;

-- Table onlineSessions
CREATE TABLE onlineSessions (
    idSession INT AUTO_INCREMENT PRIMARY KEY,
    idTeacher INT NOT NULL,
    timedate DATETIME NOT NULL,
    speciality VARCHAR(100) NOT NULL,
    class VARCHAR(50), 
    descrp TEXT,
    link VARCHAR(255), 
    FOREIGN KEY (idTeacher) REFERENCES Users(idUser) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table Questions
CREATE TABLE Questions (
    idQuestion INT AUTO_INCREMENT PRIMARY KEY,
    idStudent INT NOT NULL,
    speciality VARCHAR(100) NOT NULL,
    class VARCHAR(50), 
    descrp TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    response TEXT,
    responded_at DATETIME,
    idResponder INT,
    FOREIGN KEY (idStudent) REFERENCES Users(idUser) ON DELETE CASCADE,
    FOREIGN KEY (idResponder) REFERENCES Users(idUser) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Table Exams
CREATE TABLE Exams (
    idExam INT AUTO_INCREMENT PRIMARY KEY,
    idTeacher INT NOT NULL,
    speciality VARCHAR(100) NOT NULL,
    descrp TEXT,
    class VARCHAR(50), 
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deadline DATETIME NOT NULL,
    file_path VARCHAR(255), 
	file_path_corr VARCHAR(255), 
    FOREIGN KEY (idTeacher) REFERENCES Users(idUser) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table Submissions
CREATE TABLE Submissions (
    idSubmission INT AUTO_INCREMENT PRIMARY KEY,
    idExam INT NOT NULL,
    idStudent INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    grade FLOAT,
    feedback TEXT, 
    FOREIGN KEY (idExam) REFERENCES Exams(idExam) ON DELETE CASCADE,
    FOREIGN KEY (idStudent) REFERENCES Users(idUser) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table Courses
CREATE TABLE Courses (
    idCourse INT AUTO_INCREMENT PRIMARY KEY,
    idTeacher INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    descrp TEXT,
    class VARCHAR(50), 
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(255),
    FOREIGN KEY (idTeacher) REFERENCES Users(idUser) ON DELETE CASCADE
) ENGINE=InnoDB;

use elearningdb;
insert into Users values (1,"admin","admin@gmail.com","scrypt:32768:8:1$3Nu6gudqj3FqXT2Z$9ae6bb6559c76965df52efb669c813ab99de6e3448f5f840567dc7f2f34abfed85cd2d36767f558aaf914ea932bc6bf39c4affea95a50abc29d9236a9e5b491b",null,"admin",null,null,'2025-05-24 19:55:08',null,null);

use elearningdb;
select * from Users;
select * from loginRequest;
select * from Submissions;
select * from Courses;
select * from Exams;
select * from Questions;
select * from onlineSessions;

