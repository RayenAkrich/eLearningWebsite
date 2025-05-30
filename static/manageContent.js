// JS pour la gestion du contenu admin (questions/cours)
document.addEventListener('DOMContentLoaded', function() {
    const showQuestionsBtn = document.getElementById('showQuestionsBtn');
    const showLessonsBtn = document.getElementById('showLessonsBtn');
    const questionsTable = document.getElementById('questionsTableContainer');
    const lessonsTable = document.getElementById('lessonsTableContainer');
    const popup = document.getElementById('manageContentPopup');

    showQuestionsBtn.addEventListener('click', function() {
        showQuestionsBtn.classList.add('active');
        showLessonsBtn.classList.remove('active');
        questionsTable.classList.add('active');
        lessonsTable.classList.remove('active');
    });
    showLessonsBtn.addEventListener('click', function() {
        showLessonsBtn.classList.add('active');
        showQuestionsBtn.classList.remove('active');
        lessonsTable.classList.add('active');
        questionsTable.classList.remove('active');
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
