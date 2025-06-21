use elearningdb;
-- Trigger: Notification when a new exam is added
DELIMITER $$
CREATE TRIGGER trg_exam_added AFTER INSERT ON Exams
FOR EACH ROW
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE student_id INT;
    DECLARE cur CURSOR FOR SELECT idUser FROM Users WHERE class = NEW.class AND roles = 'student';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO student_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        INSERT INTO Notifications (userId, classification, message, is_read, created_at, related_id)
        VALUES (student_id, 'exam_added', CONCAT('Vous avez un nouveau devoir à faire en ', NEW.speciality, ' ! Merci de le faire avant la deadline.'), FALSE, NOW(), NEW.idExam);
    END LOOP;
    CLOSE cur;
END$$
DELIMITER ;

-- Trigger: Notification when a new session is added
DELIMITER $$
CREATE TRIGGER trg_session_added AFTER INSERT ON onlineSessions
FOR EACH ROW
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE student_id INT;
    DECLARE cur CURSOR FOR SELECT idUser FROM Users WHERE class = NEW.class AND roles = 'student';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO student_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        INSERT INTO Notifications (userId, classification, message, is_read, created_at, related_id)
        VALUES (student_id, 'session_reminder', CONCAT('Vous avez une nouvelle séance de ', NEW.speciality, ' le ', DATE_FORMAT(NEW.timedate, '%d/%m/%Y à %H:%i'), ' ! Merci d''assister à cette séance.'), FALSE, NOW(), NEW.idSession);
    END LOOP;
    CLOSE cur;
END$$
DELIMITER ;

-- Trigger: Notification when a grade is posted
DELIMITER $$
CREATE TRIGGER trg_grade_posted AFTER UPDATE ON Submissions
FOR EACH ROW
BEGIN
    DECLARE exam_subject VARCHAR(100);
    DECLARE exam_descrp TEXT;
    DECLARE feedback_text TEXT;
    IF NEW.grade IS NOT NULL AND (OLD.grade IS NULL OR OLD.grade != NEW.grade) THEN
        SELECT speciality, descrp INTO exam_subject, exam_descrp FROM Exams WHERE idExam = NEW.idExam;
        IF NEW.feedback IS NOT NULL AND LENGTH(TRIM(NEW.feedback)) > 0 THEN
            SET feedback_text = CONCAT(' ', NEW.feedback);
        ELSE
            SET feedback_text = '';
        END IF;
        INSERT INTO Notifications (userId, classification, message, is_read, created_at, related_id)
        VALUES (
            NEW.idStudent,
            'grade_posted',
            CONCAT('Ton examen en ', exam_subject, ' (', exam_descrp, ') est corrigé ! Vous avez obtenu ', NEW.grade, ' !', feedback_text),
            FALSE,
            NOW(),
            NEW.idExam
        );
    END IF;
END$$
DELIMITER ;

-- Trigger: Notify students when a new lesson is added for their class/subject
drop trigger trg_new_lesson_notify;
DELIMITER $$
CREATE TRIGGER trg_new_lesson_notify
AFTER INSERT ON Courses
FOR EACH ROW
BEGIN
    DECLARE teacher_speciality VARCHAR(100);
    -- Get the teacher's speciality
    SELECT speciality INTO teacher_speciality FROM Users WHERE idUser = NEW.idTeacher;

    -- Notify all students in the same class as the new lesson, show the teacher's speciality in the message
    INSERT INTO Notifications (userId, classification, message, is_read, created_at, related_id)
    SELECT U.idUser, 'new_lesson',
        CONCAT('Une nouvelle leçon de ', NEW.title, ' (', teacher_speciality, ' - ', NEW.descrp, ') a été ajoutée.'),
        FALSE, NOW(), NEW.idCourse
    FROM Users U
    WHERE U.roles = 'student' AND U.class = NEW.class;
END$$
DELIMITER ;
