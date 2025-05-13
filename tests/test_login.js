const fetch = require('node-fetch');

async function login(username, password) {
    const body = new URLSearchParams();
    body.append("username", username);
    body.append("password", password);

    const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString()
    });

    if (response.ok) {
        const data = await response.json();
        console.log("Login successful, token:", data.access_token);
    } else {
        console.error("Login failed with status:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
    }
}

// Replace with test creds
login("testuser", "testpassword");
