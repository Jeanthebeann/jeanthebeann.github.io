function login() {
    const username = document.getElementById('username').value.trim();
    const error = document.getElementById('error');

    // Example check: Only allow "Jeff" or "Alice"
    if (username.toLowerCase() === "jiwoo" || username === "지우" || username === "이지우" || username.toLowerCase() === "lee jiwoo") {
        window.location.href = "confess.html"; // redirect to another page
    } 
    else {
        window.location.href = "empty.html";
    }
}
