// JS pour la gestion des comptes (admin)
function confirmAction(message, callback) {
    if (window.confirm(message)) callback();
}

function showPopupMessage(msg, type = 'success') {
    const popup = document.getElementById('manageAccountsPopup');
    popup.textContent = msg;
    popup.className = 'popup-message ' + (type === 'error' ? 'error' : 'success');
    popup.style.display = 'block';
    setTimeout(() => { popup.style.display = 'none'; }, 2200);
}

function validateRequest(id) {
    confirmAction("Êtes-vous sûr de vouloir valider cette demande ?", async function() {
        const res = await fetch(`/admin/validate-request/${id}`, { method: 'POST' });
        const data = await res.json();
        showPopupMessage(data.message, data.success ? 'success' : 'error');
        if (data.success) setTimeout(() => location.reload(), 1200);
    });
}

function deleteRequest(id) {
    confirmAction("Êtes-vous sûr de vouloir supprimer cette demande ?", async function() {
        const res = await fetch(`/admin/delete-request/${id}`, { method: 'POST' });
        const data = await res.json();
        showPopupMessage(data.message, data.success ? 'success' : 'error');
        if (data.success) setTimeout(() => location.reload(), 1200);
    });
}

function deleteUser(id) {
    confirmAction("Êtes-vous sûr de vouloir supprimer cet utilisateur ?", async function() {
        const res = await fetch(`/admin/delete-user/${id}`, { method: 'POST' });
        const data = await res.json();
        showPopupMessage(data.message, data.success ? 'success' : 'error');
        if (data.success) setTimeout(() => location.reload(), 1200);
    });
}

// Tri de table HTML (simple)
function sortTable(tableId, colIdx) {
    const table = document.getElementById(tableId);
    const rows = Array.from(table.tBodies[0].rows);
    const asc = !table.asc || table.ascCol !== colIdx;
    rows.sort((a, b) => {
        let v1 = a.cells[colIdx].textContent.trim();
        let v2 = b.cells[colIdx].textContent.trim();
        if (!isNaN(v1) && !isNaN(v2)) {
            v1 = Number(v1); v2 = Number(v2);
        }
        if (v1 < v2) return asc ? -1 : 1;
        if (v1 > v2) return asc ? 1 : -1;
        return 0;
    });
    rows.forEach(row => table.tBodies[0].appendChild(row));
    table.asc = asc;
    table.ascCol = colIdx;
}
