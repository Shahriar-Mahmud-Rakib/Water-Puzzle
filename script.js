let selectedTube = null;
let currentLevel = 0;
let moveCount = 0;
let isPaused = false;

const moveCounterEl = document.getElementById("move-counter");
const levelTitleEl = document.getElementById("level-title");
const pauseBtn = document.getElementById("pause-btn");
const pourSound = document.getElementById("pour-sound");
const container = document.getElementById("game-container");

const levels = generateLevels(50);
let levelStates = JSON.parse(JSON.stringify(levels));

function generateLevels(n) {
  const colors = ["red", "blue", "green", "orange", "purple", "yellow", "cyan", "pink"];
  const levels = [];

  for (let i = 0; i < n; i++) {
    let tubes = [];
    let colorCount = 4 + Math.floor(i / 10);
    let tubeCount = colorCount + 2;

    let pool = [];
    for (let c = 0; c < colorCount; c++) {
      for (let j = 0; j < 4; j++) pool.push(colors[c % colors.length]);
    }

    shuffle(pool);

    for (let t = 0; t < tubeCount; t++) tubes[t] = [];

    let index = 0;
    while (index < pool.length) {
      const r = Math.floor(Math.random() * tubeCount);
      if (tubes[r].length < 4) {
        tubes[r].push(pool[index++]);
      }
    }

    levels.push(tubes);
  }

  return levels;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function renderGame() {
  container.innerHTML = "";
  levelTitleEl.textContent = `Water Sort Puzzle - Level ${currentLevel + 1}`;
  updateMoveCounter();

  levelStates[currentLevel].forEach((tube, index) => {
    const tubeEl = document.createElement("div");
    tubeEl.className = "tube";
    tubeEl.dataset.index = index;

    tube.forEach((color, i) => {
      const liq = document.createElement("div");
      liq.className = "liquid";
      liq.style.backgroundColor = color;
      if (i === tube.length - 1) {
        liq.style.borderBottom = "2px solid rgba(255, 255, 255, 0.7)";
      }
      tubeEl.appendChild(liq);
    });

    tubeEl.addEventListener("click", () => handleTubeClick(index));
    container.appendChild(tubeEl);
  });
}

function handleTubeClick(index) {
  if (isPaused) return;

  const currentTubes = levelStates[currentLevel];

  if (selectedTube === null) {
    selectedTube = index;
    highlightTube(index, true);
  } else if (selectedTube === index) {
    highlightTube(index, false);
    selectedTube = null;
  } else {
    const moved = moveLiquid(selectedTube, index);
    highlightTube(selectedTube, false);
    selectedTube = null;

    if (moved) {
      pourSound.play();
      moveCount++;
      updateMoveCounter();
      setTimeout(() => {
        if (checkLevelComplete()) {
          setTimeout(() => {
            alert("🎉 Level Complete!");
            currentLevel++;
            if (currentLevel >= levelStates.length) {
              alert("🏆 All 50 levels complete!");
              currentLevel = 0;
            }
            moveCount = 0;
            resetCurrentLevel();
          }, 300);
        } else {
          renderGame();
        }
      }, 300);
    }
  }
}

function moveLiquid(from, to) {
  const fromTube = levelStates[currentLevel][from];
  const toTube = levelStates[currentLevel][to];

  if (fromTube.length === 0 || toTube.length >= 4) return false;

  const movingColor = fromTube[fromTube.length - 1];

  if (toTube.length === 0 || toTube[toTube.length - 1] === movingColor) {
    fromTube.pop();
    toTube.push(movingColor);
    return true;
  }

  return false;
}

function checkLevelComplete() {
  return levelStates[currentLevel].every(tube =>
    tube.length === 0 || (tube.length === 4 && tube.every(c => c === tube[0]))
  );
}

function highlightTube(index, active) {
  const tubes = document.getElementsByClassName("tube");
  if (tubes[index]) {
    tubes[index].style.border = active ? "3px solid #fff" : "2px solid #fff";
  }
}

function updateMoveCounter() {
  moveCounterEl.textContent = `Moves: ${moveCount}`;
}

function resetCurrentLevel() {
  levelStates[currentLevel] = JSON.parse(JSON.stringify(levels[currentLevel]));
  moveCount = 0;
  renderGame();
}

function togglePause() {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Resume" : "Pause";
}

renderGame();