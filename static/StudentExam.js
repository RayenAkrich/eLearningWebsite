// Student submission modal logic for student manageExams page
function openSubmissionModal(descrp, speciality, className, filePath, deadline, createdAt, filePathCorr, rowIndex) {
    document.getElementById('submissionModal').style.display = 'flex';
    document.getElementById('modalExamDescrp').value = descrp;
    document.getElementById('modalSpeciality').value = speciality;
    document.getElementById('modalClass').value = className;
    document.getElementById('modalExamFilePath').value = filePath;
    document.getElementById('modalDeadline').value = deadline;
    document.getElementById('modalCreatedAt').value = createdAt;
    document.getElementById('modalFilePathCorr').value = filePathCorr;
}
function closeSubmissionModal() {
    document.getElementById('submissionModal').style.display = 'none';
    document.getElementById('submissionForm').reset();
    document.getElementById('submissionMessage').style.display = 'none';
}
document.addEventListener('DOMContentLoaded', function() {
    var submissionForm = document.getElementById('submissionForm');
    if (submissionForm) {
        submissionForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const res = await fetch('/student/submit-exam', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            const msg = document.getElementById('submissionMessage');
            msg.textContent = data.message;
            msg.className = 'popup-message ' + (data.success ? 'success' : 'error');
            msg.style.display = 'block';
            if (data.success) setTimeout(() => { location.reload(); }, 1200);
        });
    }
});
