
const leaderboardList = document.getElementById("leaderboardList");

function loadLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

  leaderboardList.innerHTML = "";

  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = "<li>No scores yet.</li>";
    return;
  }

  leaderboard
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .forEach(player => {
      const li = document.createElement("li");
      li.innerText = `${player.username} — ${player.score}`;
      leaderboardList.appendChild(li);
    });
}

function goBack() {
  window.location.href = "game.html";
}

function clearLeaderboard() {
  localStorage.removeItem("leaderboard");
  loadLeaderboard();
}

loadLeaderboard();
