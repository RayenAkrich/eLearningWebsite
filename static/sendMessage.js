// JS pour la gestion des messages envoyés (enseignant/admin)
function confirmAction(message, callback) {
    if (window.confirm(message)) callback();
}

function showPopupMessage(msg, type = 'success') {
    const popup = document.getElementById('sendMessagePopup');
    popup.textContent = msg;
    popup.className = 'popup-message ' + (type === 'error' ? 'error' : 'success');
    popup.style.display = 'block';
    setTimeout(() => { popup.style.display = 'none'; }, 2200);
}

function closeAddMessageForm() {
    document.getElementById('messageFormModal').style.display = 'none';
    document.getElementById('sendMessageForm').reset();
    const popup = document.getElementById('sendMessagePopup');
    if (popup) popup.textContent = '';
}

function deleteMessage(id) {
    confirmAction("Êtes-vous sûr de vouloir supprimer ce message ?", async function() {
        const res = await fetch(`/delete_message/${id}`, { method: 'POST' });
        if (res.status === 204) {
            showPopupMessage('Message supprimé !', 'success');
            setTimeout(() => { location.reload(); }, 1200);
        } else {
            showPopupMessage('Erreur lors de la suppression.', 'error');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const openFormBtn = document.getElementById('openFormBtn');
    const modal = document.getElementById('messageFormModal');
    const closeBtn = document.querySelector('.close');
    const classification = document.getElementById('classification');
    const recipientDiv = document.getElementById('recipientDiv');
    const classDiv = document.getElementById('classDiv');
    const popup = document.getElementById('sendMessagePopup');
    const sendMessageForm = document.getElementById('sendMessageForm');

    if (popup) popup.style.display = 'none';
    if (openFormBtn) openFormBtn.onclick = () => { modal.style.display = 'block'; };
    if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

    if (classification) {
        classification.onchange = function() {
            if (this.value === 'note') {
                recipientDiv.style.display = 'block';
                classDiv.style.display = 'none';
            } else {
                recipientDiv.style.display = 'none';
                classDiv.style.display = 'block';
            }
        };
    }

    if (sendMessageForm) {
        sendMessageForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(sendMessageForm);
            try {
                const res = await fetch(sendMessageForm.action, {
                    method: 'POST',
                    body: formData
                });
                if (res.redirected) {
                    showPopupMessage('Message envoyé !', 'success');
                    setTimeout(() => { location.reload(); }, 1200);
                } else {
                    const data = await res.json();
                    showPopupMessage(data.message || 'Erreur lors de l\'envoi.', 'error');
                }
            } catch {
                showPopupMessage('Erreur lors de l\'envoi.', 'error');
            }
        });
    }
});
