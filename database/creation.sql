-- Création de la base de données
CREATE DATABASE IF NOT EXISTS eLearningDB;
USE eLearningDB;

-- Table Users
CREATE TABLE Users (
    idUser INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mdp VARCHAR(512) NOT NULL, -- Pour stocker le mot de passe haché
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
    mdp VARCHAR(512) NOT NULL, -- Pour stocker le mot de passe haché
    phone VARCHAR(20), 
    roles ENUM('teacher', 'student') NOT NULL,
    class VARCHAR(50), -- Nullable, pour les étudiants
    speciality VARCHAR(50) -- Nullable, pour les enseignants
) ENGINE=InnoDB;

-- Table onlineSessions
CREATE TABLE onlineSessions (
    idSession INT AUTO_INCREMENT PRIMARY KEY,
    idTeacher INT NOT NULL,
    timedate DATETIME NOT NULL,
    speciality VARCHAR(100) NOT NULL,
    class VARCHAR(50), 
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
    class VARCHAR(50), 
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
    class VARCHAR(50), 
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(255),
    FOREIGN KEY (idTeacher) REFERENCES Users(idUser) ON DELETE CASCADE
) ENGINE=InnoDB;

use elearningdb;
insert into Users values (1,"admin","admin@gmail.com","scrypt:32768:8:1$3Nu6gudqj3FqXT2Z$9ae6bb6559c76965df52efb669c813ab99de6e3448f5f840567dc7f2f34abfed85cd2d36767f558aaf914ea932bc6bf39c4affea95a50abc29d9236a9e5b491b",null,"admin",null,null,'2025-05-24 19:55:08',null,null);
insert into Users values (2,"teacher","teacher@gmail.com","scrypt:32768:8:1$DjOnHe0QcZi3yowO$4a3d557db8baa9e999ea895125429d2e5b677249a508a3ea7d70107cf8680f18c33e57d5013bd80b2343fb27aa5bdfa66543319713c9d4d886d1e299ecff579b",null,"teacher",null,"Mathématiques",'2025-05-24 19:55:08',null,null);
insert into Users values (3,"student","student@gmail.com","scrypt:32768:8:1$x5zYJq8P1BW5YOzU$a1e0746ef7d45456963cc63d104961d6f54701635bbfdad3e260519c787073774b3ab3a5586242c86991bb4ccc5b2833f417ce7b54074c960c8fde1ca5ff0f28",null,"student","2eme Sciences",null,'2025-05-24 19:55:08',null,null);

use elearningdb;
select * from users;
select * from loginRequest;
select * from Submissions;
select * from Courses;
select * from Exams;
select * from Questions;
select * from onlineSessions;

