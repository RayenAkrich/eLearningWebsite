function showPopupMessage(msg, type = 'success') {
    const popup = document.getElementById('notificationsPopup');
    popup.textContent = msg;
    popup.className = 'popup-message ' + (type === 'error' ? 'error' : 'success');
    popup.style.display = 'block';
    setTimeout(() => { popup.style.display = 'none'; }, 2200);
}

function markAsRead(id) {
    confirmAction("Marquer cette notification comme lue ?", async function() {
        const res = await fetch(`/notifications/mark-as-read/${id}`, { method: 'POST' });
        if (res.status === 204) {
            showPopupMessage('Notification marquée comme lue !', 'success');
            setTimeout(() => { location.reload(); }, 1200);
        } else {
            showPopupMessage('Erreur lors de la mise à jour.', 'error');
        }
    });
}

function markAllAsRead() {
    confirmAction("Marquer toutes les notifications comme lues ?", async function() {
        const res = await fetch(`/notifications/mark-all-as-read`, { method: 'POST' });
        if (res.status === 204) {
            showPopupMessage('Toutes les notifications sont marquées comme lues !', 'success');
            setTimeout(() => { location.reload(); }, 1200);
        } else {
            showPopupMessage('Erreur lors de la mise à jour.', 'error');
        }
    });
}

function deleteNotification(id) {
    confirmAction("Êtes-vous sûr de vouloir supprimer cette notification ?", async function() {
        const res = await fetch(`/notifications/delete/${id}`, { method: 'POST' });
        if (res.status === 204) {
            showPopupMessage('Notification supprimée !', 'success');
            setTimeout(() => { location.reload(); }, 1200);
        } else {
            showPopupMessage('Erreur lors de la suppression.', 'error');
        }
    });
}

function confirmAction(message, callback) {
    if (window.confirm(message)) callback();
}
