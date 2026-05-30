const boardSize = 8;

let board = [];
let score = 0;
let currentPieces = [];
let draggedPiece = null;

const gameBoard = document.getElementById("gameBoard");
const scoreText = document.getElementById("scoreText");
const piecesContainer = document.getElementById("piecesContainer");
const welcomeText = document.getElementById("welcomeText");

const username = localStorage.getItem("username") || "Guest";
welcomeText.innerText = `Welcome, ${username}!`;

const pieceShapes = [
  [[1]],
  [[1, 1]],
  [[1], [1]],
  [[1, 1, 1]],
  [[1], [1], [1]],
  [[1, 1], [1, 1]],
  [[1, 0], [1, 1]],
  [[0, 1], [1, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]]
];

function startGame() {
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
  score = 0;
  currentPieces = [];

  updateScore();
  renderBoard();
  generatePieces();
}

function renderBoard() {
  gameBoard.innerHTML = "";

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cell = document.createElement("div");

      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;

      if (board[row][col] === 1) {
        cell.classList.add("filled");
      }

      cell.addEventListener("dragover", event => {
        event.preventDefault();
      });

      cell.addEventListener("drop", event => {
        event.preventDefault();

        if (!draggedPiece) return;

        const dropRow = Number(cell.dataset.row);
        const dropCol = Number(cell.dataset.col);

        handleDrop(dropRow, dropCol);
      });

      gameBoard.appendChild(cell);
    }
  }
}

function generatePieces() {
  piecesContainer.innerHTML = "";
  currentPieces = [];

  for (let i = 0; i < 3; i++) {
    const randomShape =
      pieceShapes[Math.floor(Math.random() * pieceShapes.length)];

    currentPieces.push(randomShape);
  }

  renderPieces();
}

function renderPieces() {
  piecesContainer.innerHTML = "";

  currentPieces.forEach((shape, index) => {
    if (shape === null) return;

    const pieceElement = document.createElement("div");

    pieceElement.classList.add("piece");
    pieceElement.draggable = true;
    pieceElement.style.gridTemplateColumns =
      `repeat(${shape[0].length}, 30px)`;

    shape.forEach(row => {
      row.forEach(cell => {
        const block = document.createElement("div");

        block.classList.add("piece-cell");

        if (cell === 0) {
          block.classList.add("empty-piece-cell");
        }

        pieceElement.appendChild(block);
      });
    });

    pieceElement.addEventListener("dragstart", event => {
      draggedPiece = {
        shape: shape,
        index: index
      };

      event.dataTransfer.setData("text/plain", index);
    });

    pieceElement.addEventListener("dragend", () => {
      draggedPiece = null;
    });

    piecesContainer.appendChild(pieceElement);
  });
}

function handleDrop(row, col) {
  const shape = draggedPiece.shape;

  if (!canPlace(shape, row, col)) {
    alert("You can't place that piece there.");
    return;
  }

  placePiece(shape, row, col);

  score += countBlocks(shape) * 10;

  currentPieces[draggedPiece.index] = null;
  draggedPiece = null;

  clearFullLines();
  updateScore();
  renderBoard();
  renderPieces();

  if (currentPieces.every(piece => piece === null)) {
    generatePieces();
  }

  if (isGameOver()) {
    setTimeout(() => {
      alert(`Game Over! Final Score: ${score}`);
      startGame();
    }, 200);
  }
}

function canPlace(shape, startRow, startCol) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) {
        const boardRow = startRow + r;
        const boardCol = startCol + c;

        if (boardRow < 0 || boardRow >= boardSize) return false;
        if (boardCol < 0 || boardCol >= boardSize) return false;

        if (board[boardRow][boardCol] === 1) return false;
      }
    }
  }

  return true;
}

function placePiece(shape, startRow, startCol) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) {
        board[startRow + r][startCol + c] = 1;
      }
    }
  }
}

function clearFullLines() {
  const rowsToClear = [];
  const colsToClear = [];

  for (let row = 0; row < boardSize; row++) {
    if (board[row].every(cell => cell === 1)) {
      rowsToClear.push(row);
    }
  }

  for (let col = 0; col < boardSize; col++) {
    let full = true;

    for (let row = 0; row < boardSize; row++) {
      if (board[row][col] === 0) {
        full = false;
        break;
      }
    }

    if (full) {
      colsToClear.push(col);
    }
  }

  rowsToClear.forEach(row => {
    for (let col = 0; col < boardSize; col++) {
      board[row][col] = 0;
    }
  });

  colsToClear.forEach(col => {
    for (let row = 0; row < boardSize; row++) {
      board[row][col] = 0;
    }
  });

  score += (rowsToClear.length + colsToClear.length) * 100;
}

function isGameOver() {
  const remainingPieces = currentPieces.filter(piece => piece !== null);

  for (const shape of remainingPieces) {
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        if (canPlace(shape, row, col)) {
          return false;
        }
      }
    }
  }

  return true;
}

function countBlocks(shape) {
  let total = 0;

  shape.forEach(row => {
    row.forEach(cell => {
      if (cell === 1) total++;
    });
  });

  return total;
}

function updateScore() {
  scoreText.innerText = `Score: ${score}`;
}

startGame();
