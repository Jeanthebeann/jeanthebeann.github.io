document.addEventListener("DOMContentLoaded", () => {
  const playButton = document.getElementById("playButton");
  const usernameInput = document.getElementById("username");

  playButton.addEventListener("click", () => {
    const username = usernameInput.value.trim();

    if (username === "") {
      alert("Please enter a username.");
      return;
    }

    localStorage.setItem("username", username);
    window.location.href = "./game.html";
  });
});
