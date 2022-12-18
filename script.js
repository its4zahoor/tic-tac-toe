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

let state = [];
let turn = null;
let timeout = null;
let isActive = null;
let robotMove = null;
let isRobotPlaying = null;

const robotMark = () => MARK[robotMove];
const playerMark = (turn) => MARK[turn % 2];
const flat = (array) => array.flatMap((x) => x);
const unique = (array) => [...new Set(array)];
const isEmpty = (index) => !state[index];
const emptyList = (array) => array.filter(isEmpty);
const emptyIndexes = () => state.flatMap((s, i) => (!s ? i : []));
const playerCount = (slice, player) =>
  slice.filter((x) => state[x] === player).length;

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
  if (!isEmpty(index) || !isActive || box.innerHTML) return;
  const player = playerMark(turn);
  const mark = document.createElement("div");
  mark.className = player;
  box.appendChild(mark);
  state[index] = player;
  checkWinner(player);
  turn++;
  playRobotMove();
}

function getWinMessage(player) {
  if (!isRobotPlaying) return `Player ${player} won`;
  const label = player === robotMark() ? "Robot" : "You";
  saveHistory(label);
  return `${label} won`;
}

function checkWinner(player) {
  if (turn < 4) return;
  const isSamePlayer = (slice) => playerCount(slice, player) === 3;
  const winnerSlice = winningSlices.find(isSamePlayer);
  if (winnerSlice) {
    showResult(getWinMessage(player));
    changeSliceBG(winnerSlice);
  } else if (!winnerSlice && !emptyIndexes().length) {
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
  const getValidSlice = (slice) =>
    playerCount(slice, player) === 2 && emptyList(slice).length;
  const slice = winningSlices.find(getValidSlice);
  const index = slice?.findIndex(isEmpty);
  return slice?.[index];
}

function getWinIndex() {
  if (turn < 4 + robotMove) return;
  const robotPlayer = robotMark();
  return getIndexForPlayer(robotPlayer);
}

function getDefendIndex() {
  if (turn < 4 - robotMove) return;
  const player = playerMark(turn + 1);
  return getIndexForPlayer(player);
}

function getCountIndex(array, index) {
  const count = array.filter((x) => x === index).length;
  return Number(`${count}${index}`);
}

function getCommonIndex(playerSlices, robotSlices) {
  const playerIdxs = flat(playerSlices);
  const robotIdxs = flat(robotSlices);
  const allIdxs = [...playerIdxs, ...robotIdxs];
  const uniqueIdxs = unique(allIdxs);
  const emptyIdxs = emptyList(uniqueIdxs);
  const countsList = emptyIdxs.map((x) => getCountIndex(allIdxs, x));
  const countIndex = Math.max(...countsList);
  return countIndex % 10;
}

function getCenterOrSliceIndex(slice, skipCenter) {
  if (!skipCenter && isEmpty(CENTER)) return CENTER;
  return getEmptyIndex([...slice, CENTER]);
}

function getBestIndex(playerSlices, robotSlices) {
  if (playerSlices.length === 4) return getCenterOrSliceIndex(EDGES);
  const commonIndex = getCommonIndex(playerSlices, robotSlices);
  if (!isNaN(commonIndex)) return commonIndex;
  return getEmptyIndex(flat(robotSlices));
}

function getPlayerSlices(player) {
  const getPlayerSlice = (slice) =>
    emptyList(slice).length === 2 && playerCount(slice, player);
  const slices = winningSlices.filter(getPlayerSlice);
  return slices;
}

function getRobotIndex() {
  if (turn === robotMove) return getCenterOrSliceIndex(CORNERS, !robotMove);
  const player = playerMark(turn + 1);
  const playerSlices = getPlayerSlices(player);
  const robot = robotMark();
  const robotSlices = getPlayerSlices(robot);
  return getBestIndex(playerSlices, robotSlices);
}

function getEmptyIndex(slice) {
  let emptyIdxs = emptyList(slice);
  if (!slice?.length) emptyIdxs = emptyIndexes();
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
  const isRobotTurn = isRobotPlaying && playerMark(turn) === robotMark();
  if (!isRobotTurn || !isActive) return;
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
    state[index] = null;
    box.innerHTML = null;
    box.classList.remove("winner");
    box.addEventListener("click", () => handleClick(box, index), {
      once: true,
    });
  });
  resultEl.innerHTML = null;
  statsEl.innerHTML = null;
  restartEl.className = "d-none";
  isActive = true;
  robotMove ??= 1;
  isRobotPlaying ??= true;
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
