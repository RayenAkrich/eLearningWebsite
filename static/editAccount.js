// JS pour la page d'édition de compte
// Validation et soumission AJAX

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('editAccountForm');
    const messageDiv = document.getElementById('editAccountMessage');

    // Afficher/masquer les mots de passe (hors submit !)
    const showOldPassword = document.getElementById('show-old-password');
    const oldPasswordInput = document.getElementById('old_mdp');
    if (showOldPassword && oldPasswordInput) {
        showOldPassword.addEventListener('change', function () {
            oldPasswordInput.type = this.checked ? 'text' : 'password';
        });
    }
    const showNewPassword = document.getElementById('show-new-password');
    const newPasswordInput = document.getElementById('new_mdp');
    if (showNewPassword && newPasswordInput) {
        showNewPassword.addEventListener('change', function () {
            newPasswordInput.type = this.checked ? 'text' : 'password';
        });
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        messageDiv.textContent = '';
        messageDiv.style.display = 'none';
        messageDiv.style.color = '';
        const nom = form.nom.value.trim();
        const email = form.email.value.trim();
        const phone = form.phone.value.trim();
        const old_mdp = form.old_mdp.value;
        const new_mdp = form.new_mdp.value;

        // Validation email
        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailRegex.test(email)) {
            messageDiv.style.display = 'block';
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Format d\'email invalide.';
            return;
        }

        // Phone: doit contenir exactement 8 chiffres
        if (!/^\d{8}$/.test(phone)) {
            messageDiv.style.display = 'block';
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Le numéro de téléphone doit contenir exactement 8 chiffres.';
            return;
        }

        // Envoi AJAX
        try {
            const res = await fetch(window.location.pathname, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom, email, phone, old_mdp, new_mdp })
            });
            const data = await res.json();
            if (data.success) {
                messageDiv.style.display = 'block';
                messageDiv.style.color = 'green';
                messageDiv.textContent = 'Modifications enregistrées !';
            } else {
                messageDiv.style.display = 'block';
                messageDiv.style.color = 'red';
                messageDiv.textContent = data.message;
            }
        } catch (err) {
            messageDiv.style.display = 'block';
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Erreur de connexion au serveur.';
        }
    });
});
