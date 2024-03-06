// login.js

async function loginUser(username, password) {
    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (response.ok) {
            // Authentication successful, redirect to user_dash.html
            window.location.href = 'user_dash.html';
        } else {
            // Authentication failed, show error message
            alert(result.message || 'Login failed.');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Server error during login.');
    }
}

function validateLoginForm() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // Basic validation, you can enhance this as needed
    if (username.trim() === '' || password.trim() === '') {
        alert('Please enter username and password.');
        return;
    }

    // If validation passes, call loginUser function
    loginUser(username, password);
}

document.querySelector(".register-link-btn").addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = "register.html";
});
