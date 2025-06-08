// signup.js
// Gestion du formulaire d'inscription avec validation côté client

document.addEventListener('DOMContentLoaded', function () {
    const signupForm = document.getElementById('signup-form');
    const rolesSelect = document.getElementById('roles');
    const classGroup = document.getElementById('class-group');
    const specialityGroup = document.getElementById('speciality-group');
    const errorMessage = document.getElementById('error-message');
    const passwordToggle = document.getElementById('password-toggle');
    const passwordInput = document.getElementById('mdp');

    // Afficher/masquer le mot de passe
    passwordToggle.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);        
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });

    // Show/hide class and speciality based on role
    rolesSelect.addEventListener('change', function() {
        if (this.value === 'student') {
            classGroup.style.display = 'block';
            specialityGroup.style.display = 'none';
        } else if (this.value === 'teacher') {
            classGroup.style.display = 'none';
            specialityGroup.style.display = 'block';
        } else {
            classGroup.style.display = 'none';
            specialityGroup.style.display = 'none';
        }
    });

    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        errorMessage.textContent = '';

        const nom = document.getElementById('nom').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const mdp = document.getElementById('mdp').value;
        const roles = document.getElementById('roles').value;
        const classValue = document.getElementById('class').value;
        const speciality = document.getElementById('speciality').value;

        // Validation email
        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailRegex.test(email)) {
            errorMessage.textContent = 'Email invalide (ex: text@text.text)';
            return;
        }
        // Validation téléphone
        if (!/^\d{8}$/.test(phone)) {
            errorMessage.textContent = 'Le numéro de téléphone doit comporter 8 chiffres.';
            return;
        }
        // Validation rôle
        if (!roles) {
            errorMessage.textContent = 'Veuillez choisir un rôle.';
            return;
        }
        // Validation classe/spécialité
        if (roles === 'student' && !classValue) {
            errorMessage.textContent = 'Veuillez choisir la classe.';
            return;
        }
        if (roles === 'teacher' && !speciality) {
            errorMessage.textContent = 'Veuillez choisir la spécialité.';
            return;
        }

        // Vérification email/phone déjà utilisé côté serveur
        fetch('/template/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nom, email, phone, mdp, roles, classValue, speciality }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Votre demande a été ajoutée !');
                    signupForm.reset();
                    classGroup.style.display = 'none';
                    specialityGroup.style.display = 'none';
                } else {
                    if (data.message) {
                        alert(data.message); 
                    }
                }
            })
            .catch(() => {
                errorMessage.textContent = 'Erreur serveur. Veuillez réessayer.';
            });
    });
});
