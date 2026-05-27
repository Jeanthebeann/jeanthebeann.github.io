const playButton = document.getElementById("playButton");

playButton.addEventListener("click", () => {

  const username = document.getElementById("username").value;

  if (username.trim() === "") {
    alert("Please enter a username.");
    return;
  }

  alert(`Welcome ${username}!`);
  

});
