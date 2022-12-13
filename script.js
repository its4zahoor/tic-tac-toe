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
  0: "X",
  1: "O",
};

let turn = 0;
let isActive = true;
const state = [];
let timeout = null;
let difficulty = null;

const resultEl = document.querySelector("#result");
const allBoxes = document.querySelectorAll(".box");

const restartEl = document.querySelector("#restart");
restartEl.addEventListener("click", clearBoard);

const radios = document.querySelectorAll('input[name="difficulty"]');
radios.forEach((radio) => {
  radio.addEventListener("click", function () {
    difficulty = radio.value;
  });
});

const checkbox = document.querySelector("#computer");
checkbox.addEventListener("click", function (e) {
  difficulty = e.target.checked ? "easy" : null;
});

function handleClick(box, index) {
  if (state[index] || !isActive || box.innerHTML) return;
  const player = turn % 2;
  const mark = document.createElement("div");
  mark.className = MARK[player];
  box.appendChild(mark);
  state[index] = MARK[player];
  checkWinner(player, state);
  turn++;
  if (difficulty) playerTwoMove();
  disableControls();
}

function checkWinner(player, state) {
  if (turn < 4) return;
  const isSamePlayer = (x) => state[x] === MARK[player];
  const testEverySlice = (slice) => slice.every(isSamePlayer);
  const winnerSlice = winningSlices.find(testEverySlice);
  if (winnerSlice) {
    showResult(`Player ${MARK[player]} won`);
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

function playerTwoMove() {
  clearTimeout(timeout);
  if (turn % 2 === 0) return;
  const emptyBoxes = state.flatMap((s, i) => (!s ? i : []));
  const randomFloat = Math.random(emptyBoxes.length) * emptyBoxes.length;
  const index = Math.floor(randomFloat);
  const nextBox = emptyBoxes[index];
  timeout = setTimeout(() => handleClick(allBoxes[nextBox], nextBox), 500);
}

function disableControls() {
  radios.forEach((radio) => (radio.disabled = turn > 0 && isActive));
  checkbox.disabled = turn > 0 && isActive;
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
  clearTimeout(timeout);
}

clearBoard();
