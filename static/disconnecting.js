localStorage.removeItem('username');
localStorage.removeItem('user_id');

let seconds = 5;
function updateTimer() {
    const timer = document.getElementById('timer');
    if (seconds > 0) {
        timer.textContent = seconds;
        seconds--;
        setTimeout(updateTimer, 1000);
    } else {
        fetch('/logout', { method: 'GET', credentials: 'same-origin' })
            .then(() => { window.location.href = '/'; });
    }
}
window.onload = updateTimer;
