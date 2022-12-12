const winPositions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 4, 8],
  [2, 4, 6],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
];

const MARK = {
  0: "cross",
  1: "circle",
};

let turn = 0;
let isActive = true;
const state = [];

const resultEl = document.querySelector("#result");
const restartEl = document.querySelector("#restart");
restartEl.addEventListener("click", clearBoard);
const allBoxes = document.querySelectorAll(".box");

function handleClick(box, index) {
  if (state[index] || !isActive || box.innerHTML) return;
  const player = turn % 2;
  const mark = document.createElement("div");
  mark.className = `${MARK[player]}-mark`;
  box.appendChild(mark);
  state[index] = player;
  resultEl.innerHTML = checkWinner(player, state);
  turn++;
}

function checkWinner(player, state) {
  if (turn < 4) return null;
  const isSamePlayer = (slice) => slice.every((x) => state[x] === player);
  const isWinner = winPositions.some(isSamePlayer);
  if (isWinner) {
    restartEl.removeAttribute("class");
    isActive = false;
    return `Player ${player} wins. Restart the game?`;
  } else if (!isWinner && turn === 8) {
    restartEl.removeAttribute("class");
    isActive = false;
    return `The game is Draw. Restart the game`;
  }
  return null;
}

function clearBoard() {
  allBoxes.forEach((box, index) => {
    state[index] = null;
    box.innerHTML = null;
    box.addEventListener("click", () => handleClick(box, index), {
      once: true,
    });
  });
  resultEl.innerHTML = null;
  restartEl.className = "d-none";
  isActive = true;
  turn = 0;
}

clearBoard();
