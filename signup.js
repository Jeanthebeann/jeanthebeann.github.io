function login() {
    const username = document.getElementById('username').value.trim();
    const error = document.getElementById('error');

    // Example check: Only allow "Jeff" or "Alice"
    if (username === "엄마" ) {
        window.location.href = "confess.html"; // redirect to another page
    } 
    else {
        window.location.href = "empty.html";
    }
}