// JS pour la gestion du contenu admin (questions/cours/examens)
document.addEventListener('DOMContentLoaded', function() {
    const showQuestionsBtn = document.getElementById('showQuestionsBtn');
    const showLessonsBtn = document.getElementById('showLessonsBtn');
    const showExamsBtn = document.getElementById('showExamsBtn');
    const showSubmissionsBtn = document.getElementById('showSubmissionsBtn');
    const questionsTable = document.getElementById('questionsTableContainer');
    const lessonsTable = document.getElementById('lessonsTableContainer');
    const examsTable = document.getElementById('examsTableContainer');
    const submissionsTable = document.getElementById('submissionsTableContainer');

    showQuestionsBtn.addEventListener('click', function() {
        showQuestionsBtn.classList.add('active');
        showLessonsBtn.classList.remove('active');
        showExamsBtn.classList.remove('active');
        showSubmissionsBtn.classList.remove('active');
        questionsTable.classList.add('active');
        lessonsTable.classList.remove('active');
        examsTable.classList.remove('active');
        submissionsTable.classList.remove('active');
    });
    showLessonsBtn.addEventListener('click', function() {
        showLessonsBtn.classList.add('active');
        showQuestionsBtn.classList.remove('active');
        showExamsBtn.classList.remove('active');
        showSubmissionsBtn.classList.remove('active');
        lessonsTable.classList.add('active');
        questionsTable.classList.remove('active');
        examsTable.classList.remove('active');
        submissionsTable.classList.remove('active');
    });
    showExamsBtn.addEventListener('click', function() {
        showExamsBtn.classList.add('active');
        showQuestionsBtn.classList.remove('active');
        showLessonsBtn.classList.remove('active');
        showSubmissionsBtn.classList.remove('active');
        examsTable.classList.add('active');
        questionsTable.classList.remove('active');
        lessonsTable.classList.remove('active');
        submissionsTable.classList.remove('active');
    });
    showSubmissionsBtn.addEventListener('click', function() {
        showSubmissionsBtn.classList.add('active');
        showQuestionsBtn.classList.remove('active');
        showLessonsBtn.classList.remove('active');
        showExamsBtn.classList.remove('active');
        submissionsTable.classList.add('active');
        questionsTable.classList.remove('active');
        lessonsTable.classList.remove('active');
        examsTable.classList.remove('active');
    });
});

function showPopupMessage(msg, type = 'success') {
    const popup = document.getElementById('manageContentPopup');
    popup.textContent = msg;
    popup.className = 'popup-message ' + (type === 'error' ? 'error' : 'success');
    popup.style.display = 'block';
    setTimeout(() => { popup.style.display = 'none'; }, 2200);
}

function confirmAction(message, callback) {
    if (window.confirm(message)) callback();
}

function deleteQuestion(id) {
    confirmAction("Êtes-vous sûr de vouloir supprimer cette question ?", async function() {
        const res = await fetch(`/admin/delete-question/${id}`, { method: 'POST' });
        const data = await res.json();
        showPopupMessage(data.message, data.success ? 'success' : 'error');
        if (data.success) setTimeout(() => location.reload(), 1200);
    });
}

function deleteLesson(id) {
    confirmAction("Êtes-vous sûr de vouloir supprimer ce cours ?", async function() {
        const res = await fetch(`/admin/delete-lesson/${id}`, { method: 'POST' });
        const data = await res.json();
        showPopupMessage(data.message, data.success ? 'success' : 'error');
        if (data.success) setTimeout(() => location.reload(), 1200);
    });
}

function deleteExam(id) {
    confirmAction("Êtes-vous sûr de vouloir supprimer cet examen ?", async function() {
        const res = await fetch(`/admin/delete-exam/${id}`, { method: 'POST' });
        const data = await res.json();
        showPopupMessage(data.message, data.success ? 'success' : 'error');
        if (data.success) setTimeout(() => location.reload(), 1200);
    });
}

function deleteSubmission(id) {
    confirmAction("Êtes-vous sûr de vouloir supprimer cette soumission ?", async function() {
        const res = await fetch(`/admin/delete-submission/${id}`, { method: 'POST' });
        const data = await res.json();
        showPopupMessage(data.message, data.success ? 'success' : 'error');
        if (data.success) setTimeout(() => location.reload(), 1200);
    });
}
