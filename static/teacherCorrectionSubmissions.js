function openGradeModal(idSubmission) {
    document.getElementById('gradeSubmissionId').value = idSubmission;
    document.getElementById('gradeValue').value = '';
    document.getElementById('gradeModal').style.display = 'flex';
    document.getElementById('gradeMessage').style.display = 'none';
}
function closeGradeModal() {
    document.getElementById('gradeModal').style.display = 'none';
    document.getElementById('gradeForm').reset();
}
function openFeedbackModal(idSubmission) {
    document.getElementById('feedbackSubmissionId').value = idSubmission;
    document.getElementById('feedbackValue').value = '';
    document.getElementById('feedbackModal').style.display = 'flex';
    document.getElementById('feedbackMessage').style.display = 'none';
}
function closeFeedbackModal() {
    document.getElementById('feedbackModal').style.display = 'none';
    document.getElementById('feedbackForm').reset();
}

document.getElementById('gradeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const idSubmission = document.getElementById('gradeSubmissionId').value;
    const grade = document.getElementById('gradeValue').value;
    const msg = document.getElementById('gradeMessage');
    msg.style.display = 'none';
    const res = await fetch('/teacher/add-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idSubmission, grade })
    });
    const data = await res.json();
    msg.textContent = data.message;
    msg.className = 'popup-message ' + (data.success ? 'success' : 'error');
    msg.style.display = 'block';
    if (data.success) setTimeout(() => location.reload(), 1200);
});

document.getElementById('feedbackForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const idSubmission = document.getElementById('feedbackSubmissionId').value;
    const feedback = document.getElementById('feedbackValue').value;
    const msg = document.getElementById('feedbackMessage');
    msg.style.display = 'none';
    const res = await fetch('/teacher/add-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idSubmission, feedback })
    });
    const data = await res.json();
    msg.textContent = data.message;
    msg.className = 'popup-message ' + (data.success ? 'success' : 'error');
    msg.style.display = 'block';
    if (data.success) setTimeout(() => location.reload(), 1200);
});