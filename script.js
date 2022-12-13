const winningSlices = [
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
  checkWinner(player, state);
  turn++;
}

function checkWinner(player, state) {
  if (turn < 4) return;
  const isSamePlayer = (x) => state[x] === player;
  const testEverySlice = (slice) => slice.every(isSamePlayer);
  const winnerSlice = winningSlices.find(testEverySlice);
  if (winnerSlice) {
    showResult(`Player ${player ? "O" : "X"} won`);
    changeSliceBG(winnerSlice);
  } else if (!winnerSlice && turn === 8) {
    showResult(`Ooops!!! It's a draw`);
  }
}

function showResult(message) {
  restartEl.classList.remove("d-none");
  isActive = false;
  resultEl.innerHTML = message;
}

function changeSliceBG(slice) {
  slice.forEach((index) => allBoxes[index].classList.add("winner"));
}

function clearBoard() {
  allBoxes.forEach((box, index) => {
    state[index] = null;
    box.innerHTML = null;
    box.classList.remove("winner");
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
