// JS pour la gestion des questions côté enseignant
function confirmAction(message, callback) {
    if (window.confirm(message)) callback();
}

function showPopupMessage(msg, type = 'success') {
    const popup = document.getElementById('manageQuestionsPopup');
    popup.textContent = msg;
    popup.className = 'popup-message ' + (type === 'error' ? 'error' : 'success');
    popup.style.display = 'block';
    setTimeout(() => { popup.style.display = 'none'; }, 2200);
}

function deleteQuestion(id) {
    confirmAction("Êtes-vous sûr de vouloir supprimer cette question ?", async function() {
        const res = await fetch(`/teacher/delete-question/${id}`, { method: 'POST' });
        const data = await res.json();
        showPopupMessage(data.message, data.success ? 'success' : 'error');
        if (data.success) setTimeout(() => location.reload(), 1200);
    });
}

function showRespondForm(id, descrp) {
    document.getElementById('respondModal').style.display = 'block';
    document.getElementById('respondQuestionId').value = id;
    document.getElementById('response').value = '';
}
function closeRespondForm() {
    document.getElementById('respondModal').style.display = 'none';
    document.getElementById('respondForm').reset();
    document.getElementById('manageQuestionsMessage').textContent = '';
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('respondForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const question_id = document.getElementById('respondQuestionId').value;
        const response = document.getElementById('response').value.trim();
        if (!response) {
            showPopupMessage('Veuillez saisir une réponse.', 'error');
            return;
        }
        const res = await fetch(`/teacher/respond-question/${question_id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ response })
        });
        const data = await res.json();
        if (data.success) {
            showPopupMessage('Réponse envoyée !', 'success');
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
