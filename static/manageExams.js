// JS pour la gestion des devoirs (enseignant)
function confirmAction(message, callback) {
    if (window.confirm(message)) callback();
}

function showPopupMessage(msg, type = 'success') {
    const popup = document.getElementById('addExamPopup');
    popup.textContent = msg;
    popup.className = 'popup-message ' + (type === 'error' ? 'error' : 'success');
    popup.style.display = 'block';
    setTimeout(() => { popup.style.display = 'none'; }, 2200);
}

function deleteExam(id) {
    confirmAction("Êtes-vous sûr de vouloir supprimer ce devoir ?", async function() {
        const res = await fetch(`/teacher/delete-exam/${id}`, { method: 'POST' });
        const data = await res.json();
        showPopupMessage(data.message, data.success ? 'success' : 'error');
        if (data.success) setTimeout(() => location.reload(), 1200);
    });
}

function showAddExamForm() {
    document.getElementById('addExamModal').style.display = 'block';
}
function closeAddExamForm() {
    document.getElementById('addExamModal').style.display = 'none';
    document.getElementById('addExamForm').reset();
    document.getElementById('manageExamsMessage').textContent = '';
}

function showAddCorrectionModal(examId) {
    document.getElementById('correctionExamId').value = examId;
    document.getElementById('addCorrectionModal').style.display = 'block';
}
function closeAddCorrectionModal() {
    document.getElementById('addCorrectionModal').style.display = 'none';
    document.getElementById('addCorrectionForm').reset();
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addExamForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const speciality = document.getElementById('speciality').value;
        const classValue = document.getElementById('class').value;
        const descrp = document.getElementById('descrp').value;
        const deadline = document.getElementById('deadline').value;
        const fileInput = document.getElementById('file_path');
        const fileCorrInput = document.getElementById('file_path_corr');
        const msgElem = document.getElementById('manageExamsMessage');
        msgElem.textContent = '';
        if (!speciality || !classValue || !deadline || !fileInput.files.length) {
            msgElem.textContent = 'Veuillez remplir tous les champs obligatoires.';
            msgElem.className = 'error-message';
            return;
        }
        const formData = new FormData();
        formData.append('speciality', speciality);
        formData.append('class', classValue);
        formData.append('descrp', descrp);
        formData.append('deadline', deadline);
        formData.append('file', fileInput.files[0]);
        if (fileCorrInput.files.length) {
            formData.append('file_corr', fileCorrInput.files[0]);
        }
        try {
            const res = await fetch('/teacher/add-exam', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                showPopupMessage('Devoir ajouté !','success');
                setTimeout(() => { location.reload(); }, 1200);
            } else {
                msgElem.textContent = data.message || 'Erreur lors de l\'ajout.';
                msgElem.className = 'error-message';
            }
        } catch {
            msgElem.textContent = 'Erreur lors de l\'ajout.';
            msgElem.className = 'error-message';
        }
    });
    document.getElementById('addCorrectionForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const examId = document.getElementById('correctionExamId').value;
        const fileInput = document.getElementById('file_path_corr_modal');
        const popup = document.getElementById('addCorrectionPopup');
        popup.textContent = '';
        if (!fileInput.files.length) {
            popup.textContent = 'Veuillez sélectionner un fichier de correction.';
            popup.className = 'popup-message error';
            popup.style.display = 'block';
            setTimeout(() => { popup.style.display = 'none'; }, 2200);
            return;
        }
        const formData = new FormData();
        formData.append('file_path_corr', fileInput.files[0]);
        try {
            const res = await fetch(`/teacher/add-correction/${examId}`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                popup.textContent = 'Correction ajoutée !';
                popup.className = 'popup-message success';
                popup.style.display = 'block';
                setTimeout(() => { location.reload(); }, 1200);
            } else {
                popup.textContent = data.error || data.message || 'Erreur lors de l\'upload.';
                popup.className = 'popup-message error';
                popup.style.display = 'block';
            }
        } catch {
            popup.textContent = 'Erreur lors de l\'upload.';
            popup.className = 'popup-message error';
            popup.style.display = 'block';
        }
    });
});

function showMessage(msg, success) {
    const el = document.getElementById('manageExamsMessage');
    el.textContent = msg;
    el.style.display = 'block';
    el.style.color = success ? 'green' : 'red';
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
