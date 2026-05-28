const playButton = document.getElementById("playButton");

playButton.addEventListener("click", () => {

  const username = document.getElementById("username").value;

  if (username.trim() === "") {
    alert("Please enter a username.");
    return;
  }

  // save username locally for leaderboard later 
  localStorage.setItem("username", username);

  // we gamin
  window.location.href = "game.html";

});
