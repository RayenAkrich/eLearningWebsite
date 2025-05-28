// JS pour la gestion des questions (étudiant)
function confirmAction(message, callback) {
    if (window.confirm(message)) callback();
}

function showPopupMessage(msg, type = 'success') {
    const popup = document.getElementById('addQuestionPopup');
    popup.textContent = msg;
    popup.className = 'popup-message ' + (type === 'error' ? 'error' : 'success');
    popup.style.display = 'block';
    setTimeout(() => { popup.style.display = 'none'; }, 2200);
}

function deleteQuestion(id) {
    confirmAction("Êtes-vous sûr de vouloir supprimer cette question ?", async function() {
        const res = await fetch(`/student/delete-question/${id}`, { method: 'POST' });
        const data = await res.json();
        showPopupMessage(data.message, data.success ? 'success' : 'error');
        if (data.success) setTimeout(() => location.reload(), 1200);
    });
}

function showAddQuestionForm() {
    document.getElementById('addQuestionModal').style.display = 'block';
}
function closeAddQuestionForm() {
    document.getElementById('addQuestionModal').style.display = 'none';
    document.getElementById('addQuestionForm').reset();
    document.getElementById('manageQuestionsMessage').textContent = '';
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addQuestionForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const speciality = this.speciality.value.trim();
        const descrp = this.descrp.value.trim();
        if (!speciality || !descrp) {
            showPopupMessage('Veuillez remplir tous les champs obligatoires.', 'error');
            return;
        }
        const res = await fetch('/student/add-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ speciality, descrp })
        });
        const data = await res.json();
        if (data.success) {
            showPopupMessage('Question ajoutée !', 'success');
            setTimeout(() => { location.reload(); }, 1200);
        } else {
            showPopupMessage(data.message, 'error');
        }
    });
});

function showMessage(msg, success) {
    const el = document.getElementById('manageQuestionsMessage');
    el.textContent = msg;
    el.style.display = 'block';
    el.style.color = success ? 'green' : 'red';
}
