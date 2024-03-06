// register.js


async function registerUser(username, password, confirmPassword) {
    try {
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Registration successful! You can now login.');
            window.location.href = 'index.html'; // Redirect to login page after successful registration
        } else {
            alert(result.message || 'Registration failed.');
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('Server error during registration.');
    }
}

function validateRegisterForm() {
    var username = document.getElementById("registerUsername").value;
    var password = document.getElementById("registerPassword").value;
    var confirmPassword = document.getElementById("registerConfirmPassword").value;

    // Basic validation, you can enhance this as needed
    if ([username, password, confirmPassword].some(field => field.trim() === '')) {
        alert('Please fill in all required fields.');
        return;
    }

    // Password strength validation
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
        alert('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one digit.');
        return;
    }

    // If validation passes, call registerUser function
    registerUser(username, password, confirmPassword);
}

document.querySelector(".login-link-btn").addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = "index.html";
});
