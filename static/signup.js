// signup.js
// Gestion du formulaire d'inscription avec validation côté client

document.addEventListener('DOMContentLoaded', function () {
    const signupForm = document.getElementById('signup-form');
    const rolesSelect = document.getElementById('roles');
    const classGroup = document.getElementById('class-group');
    const specialityGroup = document.getElementById('speciality-group');
    const errorMessage = document.getElementById('error-message');
    const showPassword = document.getElementById('show-password');
    const passwordInput = document.getElementById('mdp');

    // Afficher/masquer le mot de passe
    showPassword.addEventListener('change', function () {
        passwordInput.type = this.checked ? 'text' : 'password';
        passwordInput.style.width='80%';
        passwordInput.style.padding='0.8rem';
        passwordInput.style.border = '1px solid #ccc';
        passwordInput.style.borderRadius = '5px';
        passwordInput.style.fontSize = '1rem';
    });

    // Affichage conditionnel des champs selon le rôle
    rolesSelect.addEventListener('change', function () {
        if (this.value === 'student') {
            classGroup.style.display = 'block';
            specialityGroup.style.display = 'none';
            document.getElementById('class').required = true;
            document.getElementById('speciality').required = false;
        } else if (this.value === 'teacher') {
            classGroup.style.display = 'none';
            specialityGroup.style.display = 'block';
            document.getElementById('class').required = false;
            document.getElementById('speciality').required = true;
        } else {
            classGroup.style.display = 'none';
            specialityGroup.style.display = 'none';
            document.getElementById('class').required = false;
            document.getElementById('speciality').required = false;
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
        const classValue = document.getElementById('class').value.trim();
        const speciality = document.getElementById('speciality').value.trim();

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
            errorMessage.textContent = 'Veuillez saisir la classe.';
            return;
        }
        if (roles === 'teacher' && !speciality) {
            errorMessage.textContent = 'Veuillez saisir la spécialité.';
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
