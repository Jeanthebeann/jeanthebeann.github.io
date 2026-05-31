const boardSize = 8;

let board = [];
let score = 0;
let currentPieces = [];

let dragging = null;
let dragClone = null;

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

let undoStack = [];
let redoStack = [];

const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");

undoButton.addEventListener("click", undoMove);
redoButton.addEventListener("click", redoMove);

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

      if (board[row][col] === 1 || board[row][col] === 2) {
        cell.classList.add("filled");
      }

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

    const pieceElement = createPieceElement(shape);
    pieceElement.classList.add("piece");
    pieceElement.dataset.index = index;

    pieceElement.addEventListener("pointerdown", event => {
      startDragging(event, shape, index, pieceElement);
    });

    piecesContainer.appendChild(pieceElement);
  });
}

function createPieceElement(shape) {
  const pieceElement = document.createElement("div");

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

  return pieceElement;
}

function startDragging(event, shape, index, originalElement) {
  event.preventDefault();

  dragging = {
    shape,
    index,
    originalElement
  };

  originalElement.classList.add("hidden-piece");

  dragClone = createPieceElement(shape);
  dragClone.classList.add("piece", "dragging-clone");

  document.body.appendChild(dragClone);

  moveDragClone(event.clientX, event.clientY);

  document.addEventListener("pointermove", handlePointerMove);
  document.addEventListener("pointerup", handlePointerUp);
}

function handlePointerMove(event) {
  if (!dragging || !dragClone) return;

  moveDragClone(event.clientX, event.clientY);
}

function moveDragClone(x, y) {
  dragClone.style.left = `${x}px`;
  dragClone.style.top = `${y}px`;
}

function handlePointerUp(event) {
  if (!dragging) return;

  const targetCell = getCellUnderPointer(event.clientX, event.clientY);

  if (targetCell) {
    const row = Number(targetCell.dataset.row);
    const col = Number(targetCell.dataset.col);

    if (canPlace(dragging.shape, row, col)) {
      saveState();
      
      placePiece(dragging.shape, row, col);

      score += countBlocks(dragging.shape) * 10;

      currentPieces[dragging.index] = null;

      const clearedSomething = clearFullLines();

      if (clearedSomething) {
        animateClearLines(() => {
          updateScore();
          renderBoard();
          renderPieces();
          continueAfterPlacement();
        });
      } else {
        updateScore();
        renderBoard();
        renderPieces();
        continueAfterPlacement();
      }
    } else {
      dragging.originalElement.classList.remove("hidden-piece");
    }
  } else {
    dragging.originalElement.classList.remove("hidden-piece");
  }

  cleanupDragging();
}

function getCellUnderPointer(x, y) {
  dragClone.style.display = "none";

  const element = document.elementFromPoint(x, y);

  dragClone.style.display = "grid";

  if (!element) return null;

  if (element.classList.contains("cell")) {
    return element;
  }

  return element.closest(".cell");
}

function cleanupDragging() {
  if (dragClone) {
    dragClone.remove();
  }

  dragClone = null;
  dragging = null;

  document.removeEventListener("pointermove", handlePointerMove);
  document.removeEventListener("pointerup", handlePointerUp);
}

function canPlace(shape, startRow, startCol) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) {
        const boardRow = startRow + r;
        const boardCol = startCol + c;

        if (boardRow < 0 || boardRow >= boardSize) return false;
        if (boardCol < 0 || boardCol >= boardSize) return false;

        if (board[boardRow][boardCol] === 1 || board[boardRow][boardCol] === 2) {
          return false;
        }
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
      if (board[row][col] !== 1) {
        full = false;
        break;
      }
    }

    if (full) {
      colsToClear.push(col);
    }
  }

  const linesCleared = rowsToClear.length + colsToClear.length;

  if (linesCleared === 0) {
    return false;
  }

  rowsToClear.forEach(row => {
    for (let col = 0; col < boardSize; col++) {
      board[row][col] = 2;
    }
  });

  colsToClear.forEach(col => {
    for (let row = 0; row < boardSize; row++) {
      board[row][col] = 2;
    }
  });

  score += linesCleared * 100;

  renderBoard();

  return true;
}

function animateClearLines(callback) {
  const cells = document.querySelectorAll(".cell");

  cells.forEach(cell => {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    if (board[row][col] === 2) {
      cell.classList.add("clearing");
    }
  });

  setTimeout(() => {
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        if (board[row][col] === 2) {
          board[row][col] = 0;
        }
      }
    }

    callback();
  }, 350);
}

function continueAfterPlacement() {
  if (currentPieces.every(piece => piece === null)) {
    generatePieces();
  }

  if (isGameOver()) {
    setTimeout(() => {
      saveScoreToLeaderboard();
      alert(`Game Over! Final Score: ${score}`);
      startGame();
    }, 200);
  }
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

function saveState() {
  const snapshot = {
    board: structuredClone(board),
    score: score,
    currentPieces: structuredClone(currentPieces)
  };

  undoStack.push(snapshot);
  redoStack = [];
}

function restoreState(snapshot) {
  board = structuredClone(snapshot.board);
  score = snapshot.score;
  currentPieces = structuredClone(snapshot.currentPieces);

  updateScore();
  renderBoard();
  renderPieces();
}

function undoMove() {
  if (undoStack.length === 0) {
    alert("Nothing to undo.");
    return;
  }

  const currentState = {
    board: structuredClone(board),
    score: score,
    currentPieces: structuredClone(currentPieces)
  };

  redoStack.push(currentState);

  const previousState = undoStack.pop();
  restoreState(previousState);
}

function redoMove() {
  if (redoStack.length === 0) {
    alert("Nothing to redo.");
    return;
  }

  const currentState = {
    board: structuredClone(board),
    score: score,
    currentPieces: structuredClone(currentPieces)
  };

  undoStack.push(currentState);

  const nextState = redoStack.pop();
  restoreState(nextState);
}

startGame();
