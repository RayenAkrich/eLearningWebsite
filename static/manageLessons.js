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
    // Logique dynamique pour les classes selon la spécialité (copiée de manageExams)
    const select = document.getElementById('class');
    const specialityInput = document.getElementById('speciality');
    if (select && specialityInput) {
        const speciality = specialityInput.value;
        // Même mapping que manageExams
        let options = [
            '1er Année', '2eme Science', '2eme Informatique', '3eme Science', '3eme Technique',
            '3eme Mathématiques', '3eme Informatique', 'Bac Math', 'Bac science', 'Bac Info', 'Bac Technique'
        ];
        if (speciality === 'SVT') {
            options = [
                '1er Année', '2eme Science', '3eme Science', '3eme Mathématiques', 'Bac Math', 'Bac science'
            ];
        } else if (speciality === 'Philosophie') {
            options = [
                '3eme Science', '3eme Mathématiques', '3eme Technique', '3eme Informatique',
                'Bac Informatique', 'Bac Technique', 'Bac Math', 'Bac science'
            ];
        }
        // Supprimer toutes les options sauf la première
        while (select.options.length > 1) select.remove(1);
        // Ajouter dynamiquement les options
        for (const cl of options) {
            const opt = document.createElement('option');
            opt.value = cl;
            opt.textContent = cl;
            select.appendChild(opt);
        }
    }
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

// Récupérer la spécialité depuis le template (input hidden ou readonly)
const specialityInput = document.getElementById('speciality');
let teacher_speciality = '';
if (specialityInput) {
    teacher_speciality = specialityInput.value;
}

// Utilisez teacher_speciality si besoin dans le JS (ex: pour logique dynamique de classes)
