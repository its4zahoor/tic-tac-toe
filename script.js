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

let turn = null;
let state = null;
let timeout = null;
let isActive = null;
let movebyPC = null;
let difficulty = null;

const resultEl = document.querySelector("#result");
const statsEl = document.querySelector("#stats");
const allBoxes = document.querySelectorAll(".box");
const root = document.querySelector(":root");

const restartEl = document.querySelector("#restart");
restartEl.addEventListener("click", clearBoard);

const radios = document.querySelectorAll('input[type="radio"]');
radios.forEach((radio) => {
  radio.addEventListener("click", function () {
    difficulty = radio.value;
    clearBoard();
  });
});

const checkbox = document.querySelector("#checkbox");
checkbox.addEventListener("click", function (e) {
  difficulty = e.target.checked ? "easy" : null;
  if (!e.target.checked) {
    moveCheckbox.checked = false;
    disableControls(true);
  }
  if (e.target.checked) disableControls(false);
  clearBoard();
});

const moveCheckbox = document.querySelector("#move");
moveCheckbox.addEventListener("click", function (e) {
  movebyPC = e.target.checked ? 0 : 1;
  clearBoard();
  if (e.target.checked) computerMove();
});

function handleClick(box, index) {
  if (turn === 0) disableControls();
  if (state[index] || !isActive || box.innerHTML) return;
  const player = turn % 2;
  const mark = document.createElement("div");
  mark.className = MARK[player];
  box.appendChild(mark);
  state[index] = MARK[player];
  checkWinner(player, state);
  turn++;
  computerMove();
}

function getWinMessage(player) {
  if (!difficulty) return `Player ${MARK[player]} won`;
  const label = player === movebyPC ? "Computer" : "You";
  saveHistory(label);
  return `${label} won`;
}

function checkWinner(player, state) {
  if (turn < 4) return;
  const isSamePlayer = (x) => state[x] === MARK[player];
  const testEverySlice = (slice) => slice.every(isSamePlayer);
  const winnerSlice = winningSlices.find(testEverySlice);
  if (winnerSlice) {
    showResult(getWinMessage(player));
    changeSliceBG(winnerSlice);
  } else if (!winnerSlice && turn === 8) {
    showResult(`Ooops!!! It's a draw`);
    if (difficulty) saveHistory("Draw");
  }
}

function showStats() {
  if (!difficulty) return;
  const history = getHistory();
  const statsArr = Object.keys(history).map((k) => `${k} ${history[k]}`);
  statsEl.innerHTML = statsArr.join(" | ");
}

function showResult(message) {
  showStats();
  restartEl.classList.remove("d-none");
  isActive = false;
  resultEl.innerHTML = message;
  disableControls();
}

function changeSliceBG(slice) {
  slice.forEach((index) => allBoxes[index].classList.add("winner"));
}

function changeCursor(cursor) {
  root.style.setProperty("--pointer", cursor);
}

function getIndexForPlayer(player) {
  const movesList = (slice) => slice.filter((x) => state[x] === player);
  const hasEmptyIndex = (slice) => slice.some((e) => !state[e]);
  const getValidSlice = (slice) =>
    movesList(slice).length === 2 && hasEmptyIndex(slice);
  const slice = winningSlices.find(getValidSlice);
  const index = slice?.findIndex((e) => !state[e]);
  return slice?.[index];
}

function getWinIndex() {
  if (turn < 4 + movebyPC) return;
  const pcPlayer = MARK[movebyPC];
  return getIndexForPlayer(pcPlayer);
}

function getDefendIndex() {
  if (turn < 4 - movebyPC) return;
  const oppPlayer = MARK[(turn + 1) % 2];
  return getIndexForPlayer(oppPlayer);
}

function getBestMoveForPC() {
  if (turn === movebyPC) return;
  const pcPlayer = MARK[movebyPC];
  const emptySlots = (slice) => slice.filter((x) => !state[x]);
  const hasPCMove = (slice) => slice.some((x) => state[x] === pcPlayer);
  const getSlice = (slice) =>
    emptySlots(slice).length === 2 && hasPCMove(slice);
  const slice = winningSlices.find(getSlice);
  const index = slice?.findIndex((e) => !state[e]);
  return slice?.[index];
}

function getEmptyIndex() {
  const emptyIdxs = state.flatMap((s, i) => (!s ? i : []));
  const randomFloat = Math.random() * emptyIdxs.length;
  const index = Math.floor(randomFloat);
  return emptyIdxs[index];
}

function getNextIndex() {
  let nextIndex;
  if (difficulty === "easy") nextIndex = getWinIndex();
  if (isNaN(nextIndex)) nextIndex = getDefendIndex();
  if (isNaN(nextIndex)) nextIndex = getBestMoveForPC();
  return nextIndex ?? getEmptyIndex();
}

function computerMove() {
  if (!(difficulty && turn % 2 === movebyPC)) return;
  changeCursor("wait");
  clearTimeout(timeout);
  const nextIdx = getNextIndex();
  timeout = setTimeout(() => {
    handleClick(allBoxes[nextIdx], nextIdx);
    changeCursor("pointer");
  }, 200);
}

function disableControls(isDisabled) {
  if (isDisabled === undefined) checkbox.disabled = isActive;
  radios.forEach((radio) => {
    if (radio.value === "hard") return;
    radio.disabled = isDisabled ?? isActive;
  });
  moveCheckbox.disabled = isDisabled ?? isActive;
}

function clearBoard() {
  if (turn === 0) return;
  allBoxes.forEach((box, index) => {
    box.innerHTML = null;
    box.classList.remove("winner");
    box.addEventListener("click", () => handleClick(box, index), {
      once: true,
    });
  });
  state = Array(9).fill(null);
  resultEl.innerHTML = null;
  statsEl.innerHTML = null;
  restartEl.className = "d-none";
  isActive = true;
  movebyPC ??= 1;
  turn = 0;
  clearTimeout(timeout);
  computerMove();
}

function saveHistory(player) {
  let prev = getHistory();
  if (!prev) prev = { Computer: 0, You: 0, Draw: 0 };
  prev[player] += 1;
  localStorage.setItem("__history__", JSON.stringify(prev));
}

function getHistory() {
  return JSON.parse(localStorage.getItem("__history__"));
}

clearBoard();
