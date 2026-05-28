const username = localStorage.getItem("username");

const welcomeText = document.getElementById("welcomeText");

if (username) {
  welcomeText.innerText = `Welcome, ${username}!`;
} else {
  welcomeText.innerText = "Welcome!";
}

/* CREATE GRID */

const gameBoard = document.getElementById("gameBoard");

for (let i = 0; i < 64; i++) {

  const cell = document.createElement("div");

  cell.classList.add("cell");

  gameBoard.appendChild(cell);

}
