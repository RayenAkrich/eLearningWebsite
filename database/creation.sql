-- Création de la base de données
CREATE DATABASE IF NOT EXISTS eLearningDB;
USE eLearningDB;

-- Table Users
CREATE TABLE Users (
    idUser INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mdp VARCHAR(255) NOT NULL, -- Pour stocker le mot de passe haché
    phone VARCHAR(20), -- Nullable, car optionnel
    roles ENUM('admin', 'teacher', 'student') NOT NULL,
    class VARCHAR(50), -- Nullable, pour les étudiants
    speciality VARCHAR(50), -- Nullable, pour les enseignants
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(255), -- Nullable, pour la réinitialisation du mot de passe
    reset_token_expiry DATETIME -- Nullable, pour l'expiration du jeton
) ENGINE=InnoDB;

-- Table loginRequest
CREATE TABLE loginRequest (
    idRequest INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mdp VARCHAR(255) NOT NULL, -- Pour stocker le mot de passe haché
    phone VARCHAR(20), -- Nullable, car optionnel
    roles ENUM('teacher', 'student') NOT NULL
) ENGINE=InnoDB;

-- Table onlineSessions
CREATE TABLE onlineSessions (
    idSession INT AUTO_INCREMENT PRIMARY KEY,
    idTeacher INT NOT NULL,
    timedate DATETIME NOT NULL,
    speciality VARCHAR(100) NOT NULL,
    descrp TEXT,
    link VARCHAR(255), -- Nullable, pour le lien de la réunion
    FOREIGN KEY (idTeacher) REFERENCES Users(idUser) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table Questions
CREATE TABLE Questions (
    idQuestion INT AUTO_INCREMENT PRIMARY KEY,
    idStudent INT NOT NULL,
    speciality VARCHAR(100) NOT NULL,
    descrp TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    response TEXT, -- Nullable, pour la réponse de l'enseignant
    responded_at DATETIME, -- Nullable, pour la date de réponse
    idResponder INT, -- Nullable, pour l'enseignant qui répond
    FOREIGN KEY (idStudent) REFERENCES Users(idUser) ON DELETE CASCADE,
    FOREIGN KEY (idResponder) REFERENCES Users(idUser) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Table Exams
CREATE TABLE Exams (
    idExam INT AUTO_INCREMENT PRIMARY KEY,
    idTeacher INT NOT NULL,
    speciality VARCHAR(100) NOT NULL,
    descrp TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deadline DATETIME NOT NULL,
    file_path VARCHAR(255), -- Nullable, pour les fichiers associés
    FOREIGN KEY (idTeacher) REFERENCES Users(idUser) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table Submissions
CREATE TABLE Submissions (
    idSubmission INT AUTO_INCREMENT PRIMARY KEY,
    idExam INT NOT NULL,
    idStudent INT NOT NULL,
    file_path VARCHAR(255) NOT NULL, -- Chemin du fichier soumis
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    grade FLOAT, -- Nullable, pour la note
    feedback TEXT, -- Nullable, pour les commentaires
    FOREIGN KEY (idExam) REFERENCES Exams(idExam) ON DELETE CASCADE,
    FOREIGN KEY (idStudent) REFERENCES Users(idUser) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table Courses
CREATE TABLE Courses (
    idCourse INT AUTO_INCREMENT PRIMARY KEY,
    idTeacher INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    descrp TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(255), -- Nullable, pour les fichiers associés
    FOREIGN KEY (idTeacher) REFERENCES Users(idUser) ON DELETE CASCADE
) ENGINE=InnoDB;