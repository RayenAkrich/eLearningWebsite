// JS pour la gestion des cours (enseignant)
function confirmAction(message, callback) {
    if (window.confirm(message)) callback();
}

function showPopupMessage(msg, type = 'success') {
    const popup = document.getElementById('addLessonPopup');
    popup.textContent = msg;
    popup.className = 'popup-message ' + (type === 'error' ? 'error' : 'success');
    popup.style.display = 'block';
    setTimeout(() => { popup.style.display = 'none'; }, 2200);
}

function deleteLesson(id) {
    confirmAction("Êtes-vous sûr de vouloir supprimer ce cours ?", async function() {
        const res = await fetch(`/teacher/delete-lesson/${id}`, { method: 'POST' });
        const data = await res.json();
        showPopupMessage(data.message, data.success ? 'success' : 'error');
        if (data.success) setTimeout(() => location.reload(), 1200);
    });
}

function showAddLessonForm() {
    document.getElementById('addLessonModal').style.display = 'block';
}
function closeAddLessonForm() {
    document.getElementById('addLessonModal').style.display = 'none';
    document.getElementById('addLessonForm').reset();
    document.getElementById('addLessonMessage').textContent = '';
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addLessonForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const title = this.title.value.trim();
        const descrp = this.descrp.value.trim();
        const classValue = this.class.value.trim();
        const fileInput = this.file_path;
        if (!title || !classValue || !fileInput.files.length) {
            showPopupMessage('Veuillez remplir tous les champs obligatoires.', 'error');
            return;
        }
        const formData = new FormData();
        formData.append('title', title);
        formData.append('descrp', descrp);
        formData.append('class', classValue);
        formData.append('file', fileInput.files[0]);
        const res = await fetch('/teacher/add-lesson', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (data.success) {
            showPopupMessage('Cours ajouté !', 'success');
            setTimeout(() => { location.reload(); }, 1200);
        } else {
            showPopupMessage(data.message, 'error');
        }
    });
});

function showMessage(msg, success) {
    const el = document.getElementById('manageLessonsMessage');
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
