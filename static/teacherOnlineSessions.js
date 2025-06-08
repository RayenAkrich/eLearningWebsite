// JS pour la gestion des séances en ligne (enseignant)
function confirmAction(message, callback) {
    if (window.confirm(message)) callback();
}

function showPopupMessage(msg, type = 'success') {
    const popup = document.getElementById('addSessionPopup');
    popup.textContent = msg;
    popup.className = 'popup-message ' + (type === 'error' ? 'error' : 'success');
    popup.style.display = 'block';
    setTimeout(() => { popup.style.display = 'none'; }, 2200);
}

function deleteSession(id) {
    confirmAction("Êtes-vous sûr de vouloir supprimer cette séance ?", async function() {
        const res = await fetch(`/teacher/delete-session/${id}`, { method: 'POST' });
        const data = await res.json();
        showPopupMessage(data.message, data.success ? 'success' : 'error');
        if (data.success) setTimeout(() => location.reload(), 1200);
    });
}

function showAddSessionForm() {
    document.getElementById('addSessionModal').style.display = 'block';
}
function closeAddSessionForm() {
    document.getElementById('addSessionModal').style.display = 'none';
    document.getElementById('addSessionForm').reset();
    document.getElementById('manageSessionsMessage').textContent = '';
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addSessionForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const classValue = this.class.value.trim();
        const timedate = this.timedate.value;
        const descrp = this.descrp.value.trim();
        const link = this.link.value.trim();
        const msgElem = document.getElementById('manageSessionsMessage');
        msgElem.textContent = '';
        if (!classValue || !timedate || !link) {
            showPopupMessage('Veuillez remplir tous les champs obligatoires.', 'error');
            return;
        }
        try {
            const res = await fetch('/teacher/add-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ class: classValue, timedate, descrp, link })
            });
            const data = await res.json();
            if (data.success) {
                showPopupMessage('Séance ajoutée !','success');
                setTimeout(() => { location.reload(); }, 1200);
            } else {
                showPopupMessage('Erreur', 'error');
            }
        } catch {
            showPopupMessage('Erreur lors de l\'ajout.', 'error');
        }
    });
});
