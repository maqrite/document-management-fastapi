const fetch = require('node-fetch');

async function register(username, email, password) {
    const body = new URLSearchParams();
    body.append("username", username);
    body.append("password", password);

    const response = await fetch("http://localhost:8000/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: username,
            password: password,
            email: email,
        })
    });


    if (response.ok) {
        const data = await response.json();
        console.log("Registration succsessful, token:", data.access_token);
    } else {
        console.error("Registration failed with status:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
    }
}

async function login(username, password) {
    const body = new URLSearchParams();
    body.append("username", username);
    body.append("password", password);

    const response = await fetch("http://localhost:8000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString()
    });

    if (response.ok) {
        const data = await response.json();
        console.log("Login successful, token:", data);
    } else {
        console.error("Login failed with status:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
    }
}

// Replace with test creds
register("tester", "testemail3@mail.ru", "testpassword")
// login("testemail1@mail.ru", "testpassword");
