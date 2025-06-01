from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from flask_mysqldb import MySQL
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from flask import send_from_directory
import MySQLdb.cursors
import os

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev_secret_key')

# Config MySQL
app.config['MYSQL_HOST'] = '127.0.0.1'
app.config['MYSQL_PORT'] = 3306
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '123456'  
app.config['MYSQL_DB'] = 'elearningdb'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

mysql = MySQL(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'database')
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'zip', 'rar', 'jpg', 'png', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def home():
    return render_template('home/index.html')

@app.route('/template/auth/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('auth/login/login.html')
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT * FROM Users WHERE email = %s', (email,))
    user = cursor.fetchone()
    if user and check_password_hash(user['mdp'], password):
        session['user_id'] = user['idUser']
        session['role'] = user['roles']
        return jsonify({'success': True, 'role': user['roles']})
    return jsonify({'success': False, 'message': 'Email ou mot de passe incorrect.'})

@app.route('/template/auth/admin/dashboard')
def admin_dashboard():
    if session.get('role') != 'admin':
        return redirect(url_for('login'))
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT COUNT(*) as users FROM Users')
    users = cursor.fetchone()['users']
    cursor.execute('SELECT COUNT(*) as courses FROM Courses')
    courses = cursor.fetchone()['courses']
    cursor.execute('SELECT COUNT(*) as questions FROM Questions')
    questions = cursor.fetchone()['questions']
    cursor.execute('SELECT COUNT(*) as exams FROM Exams')
    exams = cursor.fetchone()['exams']
    cursor.execute('SELECT COUNT(*) as sessions FROM onlineSessions')
    sessions = cursor.fetchone()['sessions']
    cursor.execute('SELECT COUNT(*) as pending FROM loginRequest')
    pending = cursor.fetchone()['pending']
    stats = {
        'users': users,
        'courses': courses,
        'questions': questions,
        'exams': exams,
        'sessions': sessions,
        'pending': pending
    }
    return render_template('admin/adminDashboard/dashboard.html', stats=stats)

@app.route('/admin/manage-accounts')
def manage_accounts():
    if session.get('role') != 'admin':
        return redirect(url_for('login'))
    cursor = mysql.connection.cursor()
    # loginRequest
    cursor.execute('SELECT * FROM loginRequest')
    login_requests = cursor.fetchall()
    login_request_columns = [
        ('nom', 'Nom'),
        ('email', 'Email'),
        ('phone', 'Téléphone'),
        ('roles', 'Rôle'),
        ('class', 'Classe'),
        ('speciality', 'Spécialité'),
        ('mdp', 'Mot de passe (non haché)')
    ]
    # Users
    cursor.execute('SELECT * FROM Users')
    users = cursor.fetchall()
    users_columns = [
        ('idUser', 'ID'),
        ('nom', 'Nom'),
        ('email', 'Email'),
        ('phone', 'Téléphone'),
        ('roles', 'Rôle'),
        ('class', 'Classe'),
        ('speciality', 'Spécialité')
    ]
    admin_id = session.get('user_id')
    return render_template('admin/manageAccounts/index.html',
        login_requests=login_requests,
        login_request_columns=login_request_columns,
        users=users,
        users_columns=users_columns,
        admin_id=admin_id)

from flask import abort

@app.route('/admin/validate-request/<int:req_id>', methods=['POST'])
def validate_request(req_id):
    if session.get('role') != 'admin':
        abort(403)
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT * FROM loginRequest WHERE idRequest = %s', (req_id,))
    req = cursor.fetchone()
    if not req:
        return jsonify({'success': False, 'message': 'Demande introuvable.'})
    # Vérifier unicité email/phone
    cursor.execute('SELECT * FROM Users WHERE email = %s OR phone = %s', (req['email'], req['phone']))
    if cursor.fetchone():
        return jsonify({'success': False, 'message': 'Email ou téléphone déjà utilisé.'})
    # Insérer dans Users (hachage du mdp)
    mdp_hash = generate_password_hash(req['mdp'])
    cursor.execute('INSERT INTO Users (nom, email, mdp, phone, roles, class, speciality) VALUES (%s, %s, %s, %s, %s, %s, %s)',
        (req['nom'], req['email'], mdp_hash, req['phone'], req['roles'], req['class'], req['speciality']))
    cursor.execute('DELETE FROM loginRequest WHERE idRequest = %s', (req_id,))
    mysql.connection.commit()
    return jsonify({'success': True, 'message': 'Utilisateur validé et ajouté.'})

@app.route('/admin/delete-request/<int:req_id>', methods=['POST'])
def delete_request(req_id):
    if session.get('role') != 'admin':
        abort(403)
    cursor = mysql.connection.cursor()
    cursor.execute('DELETE FROM loginRequest WHERE idRequest = %s', (req_id,))
    mysql.connection.commit()
    return jsonify({'success': True, 'message': 'Demande supprimée.'})

@app.route('/admin/delete-user/<int:user_id>', methods=['POST'])
def delete_user(user_id):
    if session.get('role') != 'admin':
        abort(403)
    if user_id == session.get('user_id'):
        return jsonify({'success': False, 'message': 'Impossible de supprimer votre propre compte !'})
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT roles FROM Users WHERE idUser = %s', (user_id,))
    user = cursor.fetchone()
    if not user:
        return jsonify({'success': False, 'message': 'Utilisateur introuvable.'})
    role = user['roles']
    if role == 'teacher':
        cursor.execute('DELETE FROM Courses WHERE idTeacher = %s', (user_id,))
        cursor.execute('DELETE FROM Exams WHERE idTeacher = %s', (user_id,))
        cursor.execute('DELETE FROM Questions WHERE idResponder = %s', (user_id,))
        cursor.execute('DELETE FROM onlineSessions WHERE idTeacher = %s', (user_id,))
    elif role == 'student':
        cursor.execute('DELETE FROM Submissions WHERE idStudent = %s', (user_id,))
        cursor.execute('DELETE FROM Questions WHERE idStudent = %s', (user_id,))
    cursor.execute('DELETE FROM Users WHERE idUser = %s', (user_id,))
    mysql.connection.commit()
    return jsonify({'success': True, 'message': 'Utilisateur supprimé.'})

@app.route('/admin/manage-content')
def manage_content():
    if session.get('role') != 'admin':
        return redirect(url_for('login'))
    cursor = mysql.connection.cursor()
    # Questions
    cursor.execute('''
        SELECT Q.idQuestion, U.nom as student_name, Q.speciality, U.class as student_class, Q.descrp, Q.created_at, Q.response
        FROM Questions Q
        JOIN Users U ON U.idUser = Q.idStudent
        ORDER BY Q.created_at DESC
    ''')
    questions = cursor.fetchall()
    # Lessons
    cursor.execute('''
        SELECT C.idCourse, U.nom as teacher_name, U.speciality as speciality, C.title, C.class, C.descrp, C.file_path, C.created_at
        FROM Courses C
        JOIN Users U ON U.idUser = C.idTeacher
        ORDER BY C.created_at DESC
    ''')
    lessons = cursor.fetchall()
    # Exams
    cursor.execute('''
        SELECT E.idExam, U.nom as teacher_name, E.speciality, E.class, E.descrp, E.created_at, E.deadline, E.file_path, E.file_path_corr
        FROM Exams E
        JOIN Users U ON U.idUser = E.idTeacher
        ORDER BY E.created_at DESC
    ''')
    exams = cursor.fetchall()
    return render_template('admin/manageContent/index.html', questions=questions, lessons=lessons, exams=exams)

@app.route('/admin/delete-question/<int:question_id>', methods=['POST'])
def admin_delete_question(question_id):
    if session.get('role') != 'admin':
        return jsonify({'success': False, 'message': 'Non autorisé.'})
    cursor = mysql.connection.cursor()
    cursor.execute('DELETE FROM Questions WHERE idQuestion = %s', (question_id,))
    mysql.connection.commit()
    return jsonify({'success': True, 'message': 'Question supprimée.'})

@app.route('/admin/delete-lesson/<int:lesson_id>', methods=['POST'])
def admin_delete_lesson(lesson_id):
    if session.get('role') != 'admin':
        return jsonify({'success': False, 'message': 'Non autorisé.'})
    cursor = mysql.connection.cursor()
    # Récupérer le chemin du fichier avant suppression
    cursor.execute('SELECT file_path FROM Courses WHERE idCourse = %s', (lesson_id,))
    row = cursor.fetchone()
    if row and row['file_path']:
        file_path = os.path.join(app.root_path, row['file_path'])
        if os.path.exists(file_path):
            os.remove(file_path)
    # Supprimer la leçon de la base
    cursor.execute('DELETE FROM Courses WHERE idCourse = %s', (lesson_id,))
    mysql.connection.commit()
    return jsonify({'success': True, 'message': 'Cours supprimé.'})

@app.route('/admin/delete-exam/<int:exam_id>', methods=['POST'])
def admin_delete_exam(exam_id):
    if session.get('role') != 'admin':
        return jsonify({'success': False, 'message': 'Non autorisé.'})
    cursor = mysql.connection.cursor()
    # Récupérer les chemins des fichiers avant suppression
    cursor.execute('SELECT file_path, file_path_corr FROM Exams WHERE idExam = %s', (exam_id,))
    row = cursor.fetchone()
    for key in ['file_path', 'file_path_corr']:
        if row and row[key]:
            file_path = os.path.join(app.root_path, row[key])
            if os.path.exists(file_path):
                os.remove(file_path)
    # Supprimer l'examen de la base
    cursor.execute('DELETE FROM Exams WHERE idExam = %s', (exam_id,))
    mysql.connection.commit()
    return jsonify({'success': True, 'message': 'Examen supprimé.'})

@app.route('/admin/manage-sessions')
def manage_sessions():
    return 'Gestion des séances (à implémenter)'

@app.route('/admin/edit-account')
def admin_edit_account():
    return redirect(url_for('edit_account'))

@app.route('/template/auth/teacher/dashboard')
def teacher_dashboard():
    if session.get('role') != 'teacher':
        return redirect(url_for('login'))
    cursor = mysql.connection.cursor()
    teacher_id = session.get('user_id')
    cursor.execute('SELECT COUNT(*) as courses FROM Courses WHERE idTeacher = %s', (teacher_id,))
    courses = cursor.fetchone()['courses']
    cursor.execute('SELECT COUNT(*) as exams FROM Exams WHERE idTeacher = %s', (teacher_id,))
    exams = cursor.fetchone()['exams']
    cursor.execute('SELECT COUNT(*) as pending_questions FROM Questions WHERE speciality = (SELECT speciality FROM Users WHERE idUser = %s) AND response IS NULL', (teacher_id,))
    pending_questions = cursor.fetchone()['pending_questions']
    cursor.execute('SELECT COUNT(*) as sessions FROM onlineSessions WHERE idTeacher = %s', (teacher_id,))
    sessions = cursor.fetchone()['sessions']
    stats = {
        'courses': courses,
        'exams': exams,
        'pending_questions': pending_questions,
        'sessions': sessions
    }
    return render_template('teacher/teacherDashboard/dashboard.html', stats=stats)

@app.route('/teacher/manage-exams')
def teacher_manage_exams():
    if session.get('role') != 'teacher':
        return redirect(url_for('login'))
    teacher_id = session.get('user_id')
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT speciality FROM Users WHERE idUser = %s', (teacher_id,))
    teacher_speciality = cursor.fetchone()['speciality']
    cursor.execute('''
        SELECT idExam, speciality, class, descrp, created_at, deadline, file_path, file_path_corr
        FROM Exams WHERE idTeacher = %s ORDER BY created_at DESC
    ''', (teacher_id,))
    exams = cursor.fetchall()
    return render_template('teacher/manageExams/index.html', exams=exams, teacher_speciality=teacher_speciality)

@app.route('/teacher/add-exam', methods=['POST'])
def teacher_add_exam():
    if session.get('role') != 'teacher':
        return jsonify({'success': False, 'message': 'Non autorisé.'})
    teacher_id = session.get('user_id')
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'Aucun fichier reçu.'})
    file = request.files['file']
    file_corr = request.files.get('file_corr')
    speciality = request.form.get('speciality', '').strip()
    class_value = request.form.get('class', '').strip()
    descrp = request.form.get('descrp', '').strip()
    deadline = request.form.get('deadline', '').strip()
    if not speciality or not class_value or not file or file.filename == '' or not deadline:
        return jsonify({'success': False, 'message': 'Tous les champs requis sauf description et correction.'})
    if not allowed_file(file.filename):
        return jsonify({'success': False, 'message': 'Type de fichier non autorisé.'})
    filename = secure_filename(file.filename)
    save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(save_path)
    file_path = f'database/{filename}'
    file_path_corr = None
    if file_corr and file_corr.filename:
        if not allowed_file(file_corr.filename):
            return jsonify({'success': False, 'message': 'Type de fichier correction non autorisé.'})
        filename_corr = secure_filename(file_corr.filename)
        save_path_corr = os.path.join(app.config['UPLOAD_FOLDER'], filename_corr)
        file_corr.save(save_path_corr)
        file_path_corr = f'database/{filename_corr}'
    cursor = mysql.connection.cursor()
    cursor.execute('''
        INSERT INTO Exams (idTeacher, speciality, descrp, class, created_at, deadline, file_path, file_path_corr)
        VALUES (%s, %s, %s, %s, NOW(), %s, %s, %s)
    ''', (teacher_id, speciality, descrp, class_value, deadline, file_path, file_path_corr))
    mysql.connection.commit()
    return jsonify({'success': True, 'message': 'Devoir ajouté.'})

@app.route('/teacher/delete-exam/<int:exam_id>', methods=['POST'])
def teacher_delete_exam(exam_id):
    if session.get('role') != 'teacher':
        return jsonify({'success': False, 'message': 'Non autorisé.'})
    teacher_id = session.get('user_id')
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT file_path, file_path_corr FROM Exams WHERE idExam = %s AND idTeacher = %s', (exam_id, teacher_id))
    row = cursor.fetchone()
    for key in ['file_path', 'file_path_corr']:
        if row and row[key]:
            file_path = os.path.join(app.root_path, row[key])
            if os.path.exists(file_path):
                os.remove(file_path)
    cursor.execute('DELETE FROM Exams WHERE idExam = %s AND idTeacher = %s', (exam_id, teacher_id))
    mysql.connection.commit()
    return jsonify({'success': True, 'message': 'Devoir supprimé.'})

@app.route('/teacher/manage-questions')
def teacher_manage_questions():
    if session.get('role') != 'teacher':
        return redirect(url_for('login'))
    teacher_id = session.get('user_id')
    cursor = mysql.connection.cursor()
    # Récupérer la spécialité de l'enseignant
    cursor.execute('SELECT speciality FROM Users WHERE idUser = %s', (teacher_id,))
    speciality = cursor.fetchone()['speciality']
    # Récupérer toutes les questions pour cette spécialité
    cursor.execute('''
        SELECT Q.idQuestion, U.nom as student_name, Q.speciality, U.class as student_class, Q.descrp, Q.created_at, Q.response
        FROM Questions Q
        JOIN Users U ON U.idUser = Q.idStudent
        WHERE Q.speciality = %s
        ORDER BY Q.created_at DESC
    ''', (speciality,))
    questions = cursor.fetchall()
    return render_template('teacher/manageQuestions/index.html', questions=questions)

@app.route('/teacher/respond-question/<int:question_id>', methods=['POST'])
def teacher_respond_question(question_id):
    if session.get('role') != 'teacher':
        return jsonify({'success': False, 'message': 'Non autorisé.'})
    teacher_id = session.get('user_id')
    data = request.get_json()
    response = data.get('response', '').strip()
    if not response:
        return jsonify({'success': False, 'message': 'Réponse vide.'})
    cursor = mysql.connection.cursor()
    # Mettre à jour la question avec la réponse
    cursor.execute('''
        UPDATE Questions SET response = %s, responded_at = NOW(), idResponder = %s WHERE idQuestion = %s AND response IS NULL
    ''', (response, teacher_id, question_id))
    mysql.connection.commit()
    if cursor.rowcount == 0:
        return jsonify({'success': False, 'message': 'Question déjà répondue ou introuvable.'})
    return jsonify({'success': True, 'message': 'Réponse envoyée.'})

@app.route('/teacher/delete-question/<int:question_id>', methods=['POST'])
def teacher_delete_question(question_id):
    if session.get('role') != 'teacher':
        return jsonify({'success': False, 'message': 'Non autorisé.'})
    teacher_id = session.get('user_id')
    cursor = mysql.connection.cursor()
    # Supprimer uniquement les questions de la spécialité de l'enseignant
    cursor.execute('''
        DELETE FROM Questions WHERE idQuestion = %s AND speciality = (SELECT speciality FROM Users WHERE idUser = %s)
    ''', (question_id, teacher_id))
    mysql.connection.commit()
    if cursor.rowcount == 0:
        return jsonify({'success': False, 'message': 'Suppression non autorisée ou question introuvable.'})
    return jsonify({'success': True, 'message': 'Question supprimée.'})

@app.route('/teacher/manage-lessons')
def teacher_manage_lessons():
    if session.get('role') != 'teacher':
        return redirect(url_for('login'))
    teacher_id = session.get('user_id')
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT speciality FROM Users WHERE idUser = %s', (teacher_id,))
    teacher_speciality = cursor.fetchone()['speciality']
    cursor.execute('SELECT idCourse, title, descrp, class, created_at, file_path FROM Courses WHERE idTeacher = %s', (teacher_id,))
    lessons = cursor.fetchall()
    columns = [
        ('idCourse', 'ID'),
        ('title', 'Titre'),
        ('descrp', 'Description'),
        ('class', 'Classe'),
        ('created_at', 'Date de création'),
        ('file_path', 'Fichier')
    ]
    return render_template('teacher/manageLessons/index.html', lessons=lessons, columns=columns, teacher_speciality=teacher_speciality)

@app.route('/teacher/delete-lesson/<int:lesson_id>', methods=['POST'])
def teacher_delete_lesson(lesson_id):
    if session.get('role') != 'teacher':
        return jsonify({'success': False, 'message': 'Non autorisé.'})
    teacher_id = session.get('user_id')
    cursor = mysql.connection.cursor()
    # Récupérer le chemin du fichier avant suppression
    cursor.execute('SELECT file_path FROM Courses WHERE idCourse = %s AND idTeacher = %s', (lesson_id, teacher_id))
    row = cursor.fetchone()
    if row and row['file_path']:
        file_path = os.path.join(app.root_path, row['file_path'])
        if os.path.exists(file_path):
            os.remove(file_path)
    # Supprimer la leçon de la base
    cursor.execute('DELETE FROM Courses WHERE idCourse = %s AND idTeacher = %s', (lesson_id, teacher_id))
    mysql.connection.commit()
    return jsonify({'success': True, 'message': 'Cours supprimé.'})

@app.route('/teacher/add-lesson', methods=['POST'])
def teacher_add_lesson():
    if session.get('role') != 'teacher':
        return jsonify({'success': False, 'message': 'Non autorisé.'})
    teacher_id = session.get('user_id')
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'Aucun fichier reçu.'})
    file = request.files['file']
    title = request.form.get('title', '').strip()
    descrp = request.form.get('descrp', '').strip()
    class_value = request.form.get('class', '').strip()
    if not title or not class_value or not file or file.filename == '':
        return jsonify({'success': False, 'message': 'Tous les champs requis sauf description.'})
    if not allowed_file(file.filename):
        return jsonify({'success': False, 'message': 'Type de fichier non autorisé.'})
    filename = secure_filename(file.filename)
    save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(save_path)
    file_path = f'database/{filename}'
    cursor = mysql.connection.cursor()
    cursor.execute('INSERT INTO Courses (idTeacher, title, descrp, class, file_path, created_at) VALUES (%s, %s, %s, %s, %s, NOW())',
                   (teacher_id, title, descrp, class_value, file_path))
    mysql.connection.commit()
    return jsonify({'success': True, 'message': 'Cours ajouté.'})

@app.route('/template/auth/student/dashboard')
def student_dashboard():
    if session.get('role') != 'student':
        return redirect(url_for('login'))
    cursor = mysql.connection.cursor()
    student_id = session.get('user_id')
    # Nombre de cours pour la classe de l'étudiant
    cursor.execute('SELECT COUNT(*) as courses FROM Courses WHERE class = (SELECT class FROM Users WHERE idUser = %s)', (student_id,))
    courses = cursor.fetchone()['courses']
    # Nombre de devoirs attendus pour la classe
    cursor.execute('SELECT COUNT(*) as total_exams FROM Exams WHERE class = (SELECT class FROM Users WHERE idUser = %s)', (student_id,))
    total_exams = cursor.fetchone()['total_exams']
    # Nombre de devoirs déjà rendus par l'étudiant
    cursor.execute('SELECT COUNT(*) as submitted_exams FROM Submissions WHERE idStudent = %s', (student_id,))
    submitted_exams = cursor.fetchone()['submitted_exams']
    # Devoirs non rendus = total - soumis
    not_submitted_exams = max(total_exams - submitted_exams, 0)
    # Nombre de questions posées par l'étudiant qui ont reçu une réponse
    cursor.execute('SELECT COUNT(*) as answered_questions FROM Questions WHERE idStudent = %s AND response IS NOT NULL', (student_id,))
    answered_questions = cursor.fetchone()['answered_questions']
    # Nombre de séances pour la classe de l'étudiant
    cursor.execute('SELECT COUNT(*) as sessions FROM onlineSessions WHERE class = (SELECT class FROM Users WHERE idUser = %s)', (student_id,))
    sessions = cursor.fetchone()['sessions']
    stats = {
        'courses': courses,
        'not_submitted_exams': not_submitted_exams,
        'answered_questions': answered_questions,
        'sessions': sessions
    }
    return render_template('student/studentDashboard/dashboard.html', stats=stats)

@app.route('/student/lessons')
def student_lessons():
    if session.get('role') != 'student':
        return redirect(url_for('login'))
    student_id = session.get('user_id')
    cursor = mysql.connection.cursor()
    # Récupérer la classe de l'étudiant
    cursor.execute('SELECT class FROM Users WHERE idUser = %s', (student_id,))
    student_class = cursor.fetchone()['class']
    # Récupérer les cours de cette classe
    cursor.execute('''
        SELECT C.idCourse, U.nom as teacher_name, C.title, C.class, U.speciality, C.descrp, C.file_path, C.created_at
        FROM Courses C
        JOIN Users U ON U.idUser = C.idTeacher
        WHERE C.class = %s
    ''', (student_class,))
    lessons = cursor.fetchall()
    columns = [
        ('teacher_name', 'Enseignant'),
        ('speciality', 'Matière'),
        ('title', 'Titre'),
        ('class', 'Classe'),
        ('descrp', 'Description'),
        ('file_path', 'Lien/Fichier')
    ]
    return render_template('student/lessons/index.html', lessons=lessons, columns=columns)

@app.route('/student/manage-exams')
def student_manage_exams():
    if session.get('role') != 'student':
        return redirect(url_for('login'))
    student_id = session.get('user_id')
    cursor = mysql.connection.cursor()
    # Récupérer la classe de l'étudiant
    cursor.execute('SELECT class FROM Users WHERE idUser = %s', (student_id,))
    student_class = cursor.fetchone()['class']
    # Récupérer les devoirs de cette classe
    cursor.execute('''
        SELECT U.nom as teacher_name, E.speciality, E.class, E.descrp, E.created_at, E.deadline, E.file_path, E.file_path_corr
        FROM Exams E
        JOIN Users U ON U.idUser = E.idTeacher
        WHERE E.class = %s
        ORDER BY E.created_at DESC
    ''', (student_class,))
    exams = cursor.fetchall()
    columns = [
        ('teacher_name', 'Enseignant'),
        ('speciality', 'Matière'),
        ('class', 'Classe'),
        ('descrp', 'Description'),
        ('created_at', 'Date'),
        ('deadline', 'Deadline'),
        ('file_path', 'Énoncé'),
        ('file_path_corr', 'Correction')
    ]
    return render_template('student/manageExams/index.html', exams=exams, columns=columns)

@app.route('/student/manage-questions')
def student_manage_questions():
    if session.get('role') != 'student':
        return redirect(url_for('login'))
    student_id = session.get('user_id')
    cursor = mysql.connection.cursor()
    # Récupérer la classe de l'étudiant
    cursor.execute('SELECT class FROM Users WHERE idUser = %s', (student_id,))
    student_class = cursor.fetchone()['class']
    # Récupérer les questions de l'étudiant
    cursor.execute('''
        SELECT idQuestion, speciality, descrp, created_at, response
        FROM Questions
        WHERE idStudent = %s
        ORDER BY created_at DESC
    ''', (student_id,))
    questions = cursor.fetchall()
    columns = [
        ('speciality', 'Matière'),
        ('descrp', 'Question'),
        ('created_at', 'Date'),
        ('response', 'Réponse du prof')
    ]
    # Logique matières compatibles selon la classe
    matieres_by_classe = {
        '1er Année': ['Mathématique', 'Physique', 'Francais', 'Arabe', 'Anglais', 'SVT', 'Informatique'],
        '2eme Science': ['Mathématique', 'Physique', 'Francais', 'Arabe', 'Anglais', 'SVT', 'Informatique'],
        '2eme Informatique': ['Mathématique', 'Physique', 'Francais', 'Arabe', 'Anglais', 'Informatique'],
        '3eme Science': ['Mathématique', 'Physique', 'Francais', 'Arabe', 'Anglais', 'SVT', 'Philosophie', 'Informatique'],
        '3eme Technique': ['Technique','Mathématique', 'Physique', 'Francais', 'Arabe', 'Anglais', 'Philosophie', 'Informatique'],
        '3eme Mathématiques': ['Mathématique', 'Physique', 'Francais', 'Arabe', 'Anglais', 'Philosophie', 'SVT', 'Informatique'],
        '3eme Informatique': ['Mathématique', 'Physique', 'Francais', 'Arabe', 'Anglais', 'Informatique', 'Philosophie'],
        'Bac Math': ['Mathématique', 'Physique', 'Francais', 'Arabe', 'Anglais', 'Philosophie', 'Informatique', 'SVT'],
        'Bac science': ['Mathématique', 'Physique', 'Francais', 'Arabe', 'Anglais', 'SVT', 'Philosophie', 'Informatique'],
        'Bac Info': ['Mathématique', 'Physique', 'Francais', 'Arabe', 'Anglais', 'Informatique', 'Philosophie'],
        'Bac Technique': ['Technique','Mathématique', 'Physique', 'Francais', 'Arabe', 'Anglais', 'Philosophie']
    }
    matieres = matieres_by_classe.get(student_class)
    return render_template('student/manageQuestions/index.html', questions=questions, columns=columns, matieres=matieres, student_class=student_class)

@app.route('/student/add-question', methods=['POST'])
def student_add_question():
    if session.get('role') != 'student':
        return jsonify({'success': False, 'message': 'Non autorisé.'})
    student_id = session.get('user_id')
    data = request.get_json()
    speciality = data.get('speciality', '').strip()
    descrp = data.get('descrp', '').strip()
    allowed = ['Mathématique', 'Physique', 'Francais', 'Arabe', 'Anglais', 'SVT', 'Philosophie', 'Informatique']
    if speciality not in allowed or not descrp:
        return jsonify({'success': False, 'message': 'Champs invalides.'})
    cursor = mysql.connection.cursor()
    cursor.execute('INSERT INTO Questions (idStudent, speciality, descrp, created_at) VALUES (%s, %s, %s, NOW())',
                   (student_id, speciality, descrp))
    mysql.connection.commit()
    return jsonify({'success': True, 'message': 'Question ajoutée.'})

@app.route('/student/delete-question/<int:question_id>', methods=['POST'])
def student_delete_question(question_id):
    if session.get('role') != 'student':
        return jsonify({'success': False, 'message': 'Non autorisé.'})
    student_id = session.get('user_id')
    cursor = mysql.connection.cursor()
    cursor.execute('DELETE FROM Questions WHERE idQuestion = %s AND idStudent = %s', (question_id, student_id))
    mysql.connection.commit()
    return jsonify({'success': True, 'message': 'Question supprimée.'})

@app.route('/template/auth/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'GET':
        return render_template('auth/signup/index.html')
    data = request.get_json()
    nom = data.get('nom')
    email = data.get('email')
    phone = data.get('phone')
    mdp = data.get('mdp')
    roles = data.get('roles')
    class_value = data.get('classValue')
    speciality = data.get('speciality')
    cursor = mysql.connection.cursor()
    # Vérifier email ou téléphone déjà utilisé dans Users
    cursor.execute('SELECT * FROM Users WHERE email = %s', (email,))
    if cursor.fetchone():
        return jsonify({'success': False, 'message': 'Cet email est déjà utilisé.'})
    cursor.execute('SELECT * FROM Users WHERE phone = %s', (phone,))
    if cursor.fetchone():
        return jsonify({'success': False, 'message': 'Ce numéro de téléphone est déjà utilisé.'})
    # Vérifier email ou téléphone déjà utilisé dans loginRequest
    cursor.execute('SELECT * FROM loginRequest WHERE email = %s', (email,))
    if cursor.fetchone():
        return jsonify({'success': False, 'message': 'Cet email est déjà en attente de validation.'})
    cursor.execute('SELECT * FROM loginRequest WHERE phone = %s', (phone,))
    if cursor.fetchone():
        return jsonify({'success': False, 'message': 'Ce numéro de téléphone est déjà en attente de validation.'})
    # Insérer dans loginRequest (mdp non haché)
    cursor.execute('INSERT INTO loginRequest (nom, email, mdp, phone, roles, class, speciality) VALUES (%s, %s, %s, %s, %s, %s, %s)',
                   (nom, email, mdp, phone, roles, class_value if roles == 'student' else None, speciality if roles == 'teacher' else None))
    mysql.connection.commit()
    return jsonify({'success': True})

@app.route('/edit_account', methods=['GET', 'POST'])
def edit_account():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    user_id = session['user_id']
    cursor = mysql.connection.cursor()
    if request.method == 'GET':
        cursor.execute('SELECT nom, email, phone, roles FROM Users WHERE idUser = %s', (user_id,))
        user = cursor.fetchone()
        return render_template('shared/editAccount/index.html', user=user, role=user['roles'])
    # POST: modification
    data = request.get_json()
    nom = data.get('nom', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    old_mdp = data.get('old_mdp', '')
    new_mdp = data.get('new_mdp', '')
    # Vérifier l'ancien mot de passe
    cursor.execute('SELECT mdp FROM Users WHERE idUser = %s', (user_id,))
    user = cursor.fetchone()
    if not check_password_hash(user['mdp'], old_mdp):
        return jsonify({'success': False, 'message': 'Ancien mot de passe incorrect.'})
    # Vérifier unicité email
    cursor.execute('SELECT idUser FROM Users WHERE email = %s AND idUser != %s', (email, user_id))
    if cursor.fetchone():
        return jsonify({'success': False, 'message': 'Cet email est déjà utilisé.'})
    # Vérifier unicité téléphone
    if phone:
        cursor.execute('SELECT idUser FROM Users WHERE phone = %s AND idUser != %s', (phone, user_id))
        if cursor.fetchone():
            return jsonify({'success': False, 'message': 'Ce téléphone est déjà utilisé.'})
    # Mise à jour
    update_fields = {'nom': nom, 'email': email, 'phone': phone}
    if new_mdp:
        update_fields['mdp'] = generate_password_hash(new_mdp)
    set_clause = ', '.join(f"{k} = %s" for k in update_fields)
    values = list(update_fields.values()) + [user_id]
    cursor.execute(f'UPDATE Users SET {set_clause} WHERE idUser = %s', values)
    mysql.connection.commit()
    return jsonify({'success': True})

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/database/<path:filename>')
def download_database_file(filename):
    return send_from_directory(os.path.join(app.root_path, 'database'), filename, as_attachment=True)

@app.route('/teacher/add-correction/<int:exam_id>', methods=['POST'])
def teacher_add_correction(exam_id):
    if session.get('role') != 'teacher':
        return jsonify({'success': False, 'error': 'Non autorisé.'})
    teacher_id = session.get('user_id')
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT file_path_corr FROM Exams WHERE idExam = %s AND idTeacher = %s', (exam_id, teacher_id))
    exam = cursor.fetchone()
    if not exam:
        return jsonify({'success': False, 'error': 'Devoir introuvable.'})
    if exam['file_path_corr']:
        return jsonify({'success': False, 'error': 'Correction déjà ajoutée.'})
    if 'file_path_corr' not in request.files:
        return jsonify({'success': False, 'error': 'Aucun fichier reçu.'})
    file = request.files['file_path_corr']
    if not file or file.filename == '':
        return jsonify({'success': False, 'error': 'Aucun fichier sélectionné.'})
    if not allowed_file(file.filename):
        return jsonify({'success': False, 'error': 'Type de fichier non autorisé.'})
    filename = secure_filename(file.filename)
    save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(save_path)
    file_path_corr = f'database/{filename}'
    cursor.execute('UPDATE Exams SET file_path_corr = %s WHERE idExam = %s AND idTeacher = %s', (file_path_corr, exam_id, teacher_id))
    mysql.connection.commit()
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)
