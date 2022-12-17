const winningSlices = [
  [0, 4, 8],
  [2, 4, 6],
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
];

const CORNERS = [0, 2, 6, 8];
const EDGES = [1, 3, 5, 7];
const CENTER = 4;

const MARK = {
  0: "X",
  1: "O",
};

let turn = null;
let state = null;
let timeout = null;
let isActive = null;
let robotMove = null;
let isRobotPlaying = null;

const resultEl = document.querySelector("#result");
const statsEl = document.querySelector("#stats");
const allBoxes = document.querySelectorAll(".box");
const root = document.querySelector(":root");

const restartEl = document.querySelector("#restart");
restartEl.addEventListener("click", clearBoard);

const checkbox = document.querySelector("#checkbox");
checkbox.addEventListener("click", function (e) {
  isRobotPlaying = e.target.checked;
  if (!e.target.checked) {
    moveCheckbox.checked = false;
    disableControls(true);
  }
  if (e.target.checked) disableControls(false);
  clearBoard();
});

const moveCheckbox = document.querySelector("#move");
moveCheckbox.addEventListener("click", function (e) {
  robotMove = e.target.checked ? 0 : 1;
  clearBoard();
  if (e.target.checked) playRobotMove();
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
  playRobotMove();
}

function getWinMessage(player) {
  if (!isRobotPlaying) return `Player ${MARK[player]} won`;
  const label = player === robotMove ? "Robot" : "You";
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
    if (isRobotPlaying) saveHistory("Draw");
    showResult(`Ooops!!! It's a draw`);
  }
}

function showStats() {
  if (!isRobotPlaying) return;
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
  if (turn < 4 + robotMove) return;
  const robotPlayer = MARK[robotMove];
  return getIndexForPlayer(robotPlayer);
}

function getDefendIndex() {
  if (turn < 4 - robotMove) return;
  const oppPlayer = MARK[(turn + 1) % 2];
  return getIndexForPlayer(oppPlayer);
}

function getCountIndex(array, index) {
  const count = array.filter((x) => x === index).length;
  return Number(`${count}${index}`);
}

function fallatenArray(array) {
  return array.flatMap((x) => x);
}

function uniqueSliceIndexes(array) {
  return [...new Set(array)];
}
function getCommonIndex(playerSlices, robotSlices) {
  const playerIdxs = fallatenArray(playerSlices);
  const robotIdxs = fallatenArray(robotSlices);
  const allIdxs = [...playerIdxs, ...robotIdxs];
  const uniqueIdxs = uniqueSliceIndexes(allIdxs);
  const emptyIdxs = uniqueIdxs.filter((i) => !state[i]);
  const countsList = emptyIdxs.map((x) => getCountIndex(allIdxs, x));
  const countIndex = Math.max(...countsList);
  return countIndex % 10;
}

function getBestIndex(playerSlices, robotSlices) {
  if (playerSlices.length === 4) return getEmptyIndex(EDGES);
  const commonIndex = getCommonIndex(playerSlices, robotSlices);
  if (!isNaN(commonIndex)) return commonIndex;
  return getEmptyIndex(robotSlices);
}

function getEmptySlices(player) {
  const emptySlots = (slice) => slice.filter((x) => !state[x]);
  const hasMove = (slice) => slice.some((x) => state[x] === player);
  const getPlayerSlice = (slice) =>
    emptySlots(slice).length === 2 && hasMove(slice);
  const slices = winningSlices.filter(getPlayerSlice);
  return slices;
}

function getRobotIndex() {
  if (turn === robotMove) {
    return getEmptyIndex([...CORNERS, CENTER]);
  }
  const player = MARK[(turn + 1) % 2];
  const playerSlices = getEmptySlices(player);
  const robot = MARK[robotMove];
  const robotSlices = getEmptySlices(robot);
  return getBestIndex(playerSlices, robotSlices);
}

function getEmptyIndex(array) {
  let emptyIdxs = array.flatMap((i) => (!state[i] ? i : []));
  if (!array?.length) emptyIdxs = state.flatMap((s, i) => (!s ? i : []));
  const randomFloat = Math.random() * emptyIdxs.length;
  const index = Math.floor(randomFloat);
  return emptyIdxs[index];
}

function getNextIndex() {
  let nextIndex = getWinIndex();
  if (isNaN(nextIndex)) nextIndex = getDefendIndex();
  if (isNaN(nextIndex)) nextIndex = getRobotIndex();
  return nextIndex;
}

function playRobotMove() {
  if (!(isRobotPlaying && turn % 2 === robotMove)) return;
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
  robotMove ??= 1;
  turn = 0;
  clearTimeout(timeout);
  playRobotMove();
}

function saveHistory(player) {
  let prev = getHistory();
  if (!prev) prev = { Robot: 0, You: 0, Draw: 0 };
  prev[player] += 1;
  localStorage.setItem("__history__", JSON.stringify(prev));
}

function getHistory() {
  return JSON.parse(localStorage.getItem("__history__"));
}

clearBoard();
