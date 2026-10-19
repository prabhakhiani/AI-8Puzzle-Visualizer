"use strict";

const DEFAULT_INITIAL = [1, 2, 3, 4, 0, 6, 7, 5, 8];
const DEFAULT_GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 0];

const elements = {
  initialInputs: document.getElementById("initialInputs"),
  goalInputs: document.getElementById("goalInputs"),
  initialBoard: document.getElementById("initialBoard"),
  currentBoard: document.getElementById("currentBoard"),
  goalBoard: document.getElementById("goalBoard"),
  heuristicSelect: document.getElementById("heuristicSelect"),
  speedSelect: document.getElementById("speedSelect"),
  randomButton: document.getElementById("randomButton"),
  runButton: document.getElementById("runButton"),
  pauseButton: document.getElementById("pauseButton"),
  resumeButton: document.getElementById("resumeButton"),
  previousButton: document.getElementById("previousButton"),
  nextButton: document.getElementById("nextButton"),
  resetButton: document.getElementById("resetButton"),
  messageBox: document.getElementById("messageBox"),
  stepLabel: document.getElementById("stepLabel"),
  searchStatus: document.getElementById("searchStatus"),
  currentNode: document.getElementById("currentNode"),
  parentNode: document.getElementById("parentNode"),
  currentDepth: document.getElementById("currentDepth"),
  nodesGenerated: document.getElementById("nodesGenerated"),
  nodesExpanded: document.getElementById("nodesExpanded"),
  frontierSize: document.getElementById("frontierSize"),
  exploredSize: document.getElementById("exploredSize"),
  gValue: document.getElementById("gValue"),
  hValue: document.getElementById("hValue"),
  fValue: document.getElementById("fValue"),
  maxDepth: document.getElementById("maxDepth"),
  frontierList: document.getElementById("frontierList"),
  exploredList: document.getElementById("exploredList"),
  solutionResult: document.getElementById("solutionResult"),
  totalMoves: document.getElementById("totalMoves"),
  summaryGenerated: document.getElementById("summaryGenerated"),
  summaryExpanded: document.getElementById("summaryExpanded"),
  summaryDepth: document.getElementById("summaryDepth"),
  executionTime: document.getElementById("executionTime"),
  pathCost: document.getElementById("pathCost"),
  memoryUsage: document.getElementById("memoryUsage"),
  solutionPath: document.getElementById("solutionPath")
};

let initialState = [...DEFAULT_INITIAL];
let goalState = [...DEFAULT_GOAL];
let solutionPath = [];
let currentStep = 0;
let animationTimer = null;
let paused = false;
let searchHasRun = false;
let lastSearchResult = null;

function createInputGrid(container, values) {
  container.innerHTML = "";

  values.forEach((value, index) => {
    const input = document.createElement("input");
    input.className = "tile-input";
    input.type = "number";
    input.min = "0";
    input.max = "8";
    input.value = value;
    input.setAttribute("aria-label", `Tile ${index + 1}`);
    container.appendChild(input);
  });
}

function getInputState(container) {
  const inputs = [...container.querySelectorAll(".tile-input")];
  return inputs.map((input) => Number(input.value));
}

function setInputState(container, state) {
  const inputs = [...container.querySelectorAll(".tile-input")];
  inputs.forEach((input, index) => {
    input.value = state[index];
  });
}

function stateKey(state) {
  return state.join(",");
}

function stateText(state) {
  return state.map((tile) => (tile === 0 ? "_" : tile)).join(" ");
}

function showMessage(message, type = "") {
  elements.messageBox.textContent = message;
  elements.messageBox.className = `message-box ${type}`;
}

function renderBoard(container, state, movedIndex = -1) {
  container.innerHTML = "";

  state.forEach((tile, index) => {
    const tileElement = document.createElement("div");
    tileElement.className = "puzzle-tile";

    if (tile === 0) {
      tileElement.classList.add("blank");
      tileElement.textContent = "";
      tileElement.setAttribute("aria-label", "Blank tile");
    } else {
      tileElement.textContent = tile;
      tileElement.setAttribute("aria-label", `Tile ${tile}`);
    }

    if (index === movedIndex) {
      tileElement.classList.add("moved");
    }

    container.appendChild(tileElement);
  });
}

function renderAllBoards() {
  renderBoard(elements.initialBoard, initialState);
  renderBoard(elements.goalBoard, goalState);
  renderBoard(elements.currentBoard, initialState);
  elements.stepLabel.textContent = "Step: —";
}

function validateState(state, stateName) {
  if (state.length !== 9 || state.some((tile) => !Number.isInteger(tile) || tile < 0 || tile > 8)) {
    return `${stateName} must contain exactly nine whole numbers from 0 to 8.`;
  }

  const sorted = [...state].sort((a, b) => a - b);
  const expected = "0,1,2,3,4,5,6,7,8";

  if (sorted.join(",") !== expected) {
    return `${stateName} must contain every value from 0 to 8 exactly once. Use 0 for the blank tile.`;
  }

  return null;
}

function countInversions(state) {
  const tiles = state.filter((tile) => tile !== 0);
  let inversions = 0;

  for (let i = 0; i < tiles.length; i += 1) {
    for (let j = i + 1; j < tiles.length; j += 1) {
      if (tiles[i] > tiles[j]) {
        inversions += 1;
      }
    }
  }

  return inversions;
}

function isSolvable(start, goal) {
  return countInversions(start) % 2 === countInversions(goal) % 2;
}

function getGoalPositions(goal) {
  const positions = new Map();

  goal.forEach((tile, index) => {
    positions.set(tile, {
      row: Math.floor(index / 3),
      col: index % 3
    });
  });

  return positions;
}

function misplacedTiles(state, goal) {
  let count = 0;

  for (let i = 0; i < state.length; i += 1) {
    if (state[i] !== 0 && state[i] !== goal[i]) {
      count += 1;
    }
  }

  return count;
}

function manhattanDistance(state, goalPositions) {
  let distance = 0;

  state.forEach((tile, index) => {
    if (tile === 0) return;

    const currentRow = Math.floor(index / 3);
    const currentCol = index % 3;
    const goalPosition = goalPositions.get(tile);

    distance += Math.abs(currentRow - goalPosition.row) + Math.abs(currentCol - goalPosition.col);
  });

  return distance;
}

function calculateHeuristic(state, goal, goalPositions, heuristicName) {
  if (heuristicName === "misplaced") {
    return misplacedTiles(state, goal);
  }

  return manhattanDistance(state, goalPositions);
}

function getSuccessors(state) {
  const blankIndex = state.indexOf(0);
  const row = Math.floor(blankIndex / 3);
  const col = blankIndex % 3;
  const moves = [];

  const possibleMoves = [
    { row: row - 1, col, name: "Up" },
    { row: row + 1, col, name: "Down" },
    { row, col: col - 1, name: "Left" },
    { row, col: col + 1, name: "Right" }
  ];

  possibleMoves.forEach((move) => {
    if (move.row >= 0 && move.row < 3 && move.col >= 0 && move.col < 3) {
      const swapIndex = move.row * 3 + move.col;
      const nextState = [...state];

      nextState[blankIndex] = nextState[swapIndex];
      nextState[swapIndex] = 0;

      moves.push({
        state: nextState,
        move: move.name,
        movedTileIndex: blankIndex
      });
    }
  });

  return moves;
}

function reconstructPath(node) {
  const path = [];

  let current = node;
  while (current !== null) {
    path.unshift(current);
    current = current.parent;
  }

  return path;
}

function formatMemory(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function updateSearchDisplay(node, stats, openList, closedList) {
  elements.searchStatus.textContent = stats.status;
  elements.currentNode.textContent = node ? stateText(node.state) : "—";
  elements.parentNode.textContent = node && node.parent ? stateText(node.parent.state) : "—";
  elements.currentDepth.textContent = node ? node.g : "0";
  elements.nodesGenerated.textContent = stats.generated;
  elements.nodesExpanded.textContent = stats.expanded;
  elements.frontierSize.textContent = openList.length;
  elements.exploredSize.textContent = closedList.size;
  elements.gValue.textContent = node ? node.g : "0";
  elements.hValue.textContent = node ? node.h : "0";
  elements.fValue.textContent = node ? node.f : "0";
  elements.maxDepth.textContent = stats.maxDepth;

  const openPreview = openList
    .slice(0, 12)
    .map((item) => `[f=${item.f}, g=${item.g}, h=${item.h}] ${stateText(item.state)}`)
    .join("\n");

  const closedPreview = [...closedList]
    .slice(-12)
    .map((key) => key.replaceAll(",", " ").replace("0", "_"))
    .join("\n");

  elements.frontierList.textContent = openPreview || "No states in frontier.";
  elements.exploredList.textContent = closedPreview || "No states explored.";
}

function runAStar(start, goal, heuristicName) {
  const goalPositions = getGoalPositions(goal);
  const startTime = performance.now();
  const startHeuristic = calculateHeuristic(start, goal, goalPositions, heuristicName);

  const startNode = {
    state: [...start],
    parent: null,
    move: "Start",
    g: 0,
    h: startHeuristic,
    f: startHeuristic,
    movedTileIndex: -1
  };

  const openList = [startNode];
  const closedList = new Set();
  const bestG = new Map([[stateKey(start), 0]]);
  const stats = {
    generated: 1,
    expanded: 0,
    maxDepth: 0,
    status: "Searching"
  };

  let currentNode = null;

  while (openList.length > 0) {
    openList.sort((a, b) => a.f - b.f || a.h - b.h || a.g - b.g);
    currentNode = openList.shift();
    const currentKey = stateKey(currentNode.state);

    if (closedList.has(currentKey)) {
      continue;
    }

    closedList.add(currentKey);
    stats.expanded += 1;
    stats.maxDepth = Math.max(stats.maxDepth, currentNode.g);

    if (currentKey === stateKey(goal)) {
      stats.status = "Solution found";
      const endTime = performance.now();
      const path = reconstructPath(currentNode);
      updateSearchDisplay(currentNode, stats, openList, closedList);

      return {
        found: true,
        path,
        stats,
        time: endTime - startTime,
        memoryBytes: (openList.length + closedList.size + bestG.size) * 160
      };
    }

    const successors = getSuccessors(currentNode.state);

    successors.forEach((successor) => {
      const successorKey = stateKey(successor.state);
      const newG = currentNode.g + 1;

      if (closedList.has(successorKey)) {
        return;
      }

      if (!bestG.has(successorKey) || newG < bestG.get(successorKey)) {
        const h = calculateHeuristic(successor.state, goal, goalPositions, heuristicName);

        openList.push({
          state: successor.state,
          parent: currentNode,
          move: successor.move,
          g: newG,
          h,
          f: newG + h,
          movedTileIndex: successor.movedTileIndex
        });

        bestG.set(successorKey, newG);
        stats.generated += 1;
        stats.maxDepth = Math.max(stats.maxDepth, newG);
      }
    });
  }

  const endTime = performance.now();
  stats.status = "No solution found";
  updateSearchDisplay(currentNode, stats, openList, closedList);

  return {
    found: false,
    path: [],
    stats,
    time: endTime - startTime,
    memoryBytes: (closedList.size + bestG.size) * 160
  };
}

function createMiniBoard(state) {
  const board = document.createElement("div");
  board.className = "path-mini-board";

  state.forEach((tile) => {
    const tileElement = document.createElement("div");
    tileElement.className = "path-mini-tile";

    if (tile === 0) {
      tileElement.classList.add("blank");
    } else {
      tileElement.textContent = tile;
    }

    board.appendChild(tileElement);
  });

  return board;
}

function renderSolutionPath() {
  elements.solutionPath.innerHTML = "";

  solutionPath.forEach((node, index) => {
    const step = document.createElement("div");
    step.className = "path-step";

    const title = document.createElement("p");
    title.textContent = index === 0 ? "Step 0: Start" : `Step ${index}: ${node.move}`;

    step.appendChild(title);
    step.appendChild(createMiniBoard(node.state));
    elements.solutionPath.appendChild(step);
  });
}

function updateCurrentStep() {
  if (solutionPath.length === 0) return;

  const node = solutionPath[currentStep];
  renderBoard(elements.currentBoard, node.state, node.movedTileIndex);
  elements.stepLabel.textContent = `Step ${currentStep} of ${solutionPath.length - 1}${currentStep === 0 ? " — Start" : ` — Move ${node.move}`}`;
  elements.previousButton.disabled = currentStep === 0;
  elements.nextButton.disabled = currentStep >= solutionPath.length - 1;
}

function stopAnimation() {
  if (animationTimer !== null) {
    clearTimeout(animationTimer);
    animationTimer = null;
  }
}

function playAnimation() {
  stopAnimation();

  if (paused || currentStep >= solutionPath.length - 1) {
    return;
  }

  const speed = Number(elements.speedSelect.value);

  animationTimer = setTimeout(() => {
    if (!paused && currentStep < solutionPath.length - 1) {
      currentStep += 1;
      updateCurrentStep();
      playAnimation();
    }
  }, speed);
}

function setControlStateAfterRun() {
  elements.pauseButton.disabled = false;
  elements.resumeButton.disabled = true;
  elements.previousButton.disabled = currentStep === 0;
  elements.nextButton.disabled = currentStep >= solutionPath.length - 1;
}

function updateSummary(result) {
  const finalNode = result.path[result.path.length - 1];

  elements.solutionResult.textContent = result.found ? "Solution Found" : "Not Found";
  elements.totalMoves.textContent = result.found ? result.path.length - 1 : "—";
  elements.summaryGenerated.textContent = result.stats.generated;
  elements.summaryExpanded.textContent = result.stats.expanded;
  elements.summaryDepth.textContent = result.stats.maxDepth;
  elements.executionTime.textContent = `${result.time.toFixed(2)} ms`;
  elements.pathCost.textContent = result.found ? finalNode.g : "—";
  elements.memoryUsage.textContent = formatMemory(result.memoryBytes);
}

function resetStatistics() {
  elements.searchStatus.textContent = "Not started";
  elements.currentNode.textContent = "—";
  elements.parentNode.textContent = "—";
  elements.currentDepth.textContent = "0";
  elements.nodesGenerated.textContent = "0";
  elements.nodesExpanded.textContent = "0";
  elements.frontierSize.textContent = "0";
  elements.exploredSize.textContent = "0";
  elements.gValue.textContent = "0";
  elements.hValue.textContent = "0";
  elements.fValue.textContent = "0";
  elements.maxDepth.textContent = "0";
  elements.frontierList.textContent = "No states yet.";
  elements.exploredList.textContent = "No states yet.";
  elements.solutionResult.textContent = "Not run";
  elements.totalMoves.textContent = "—";
  elements.summaryGenerated.textContent = "—";
  elements.summaryExpanded.textContent = "—";
  elements.summaryDepth.textContent = "—";
  elements.executionTime.textContent = "—";
  elements.pathCost.textContent = "—";
  elements.memoryUsage.textContent = "—";
  elements.solutionPath.textContent = "Run the A* search to display the solution states here.";
}

function handleRun() {
  stopAnimation();
  paused = false;

  const enteredInitial = getInputState(elements.initialInputs);
  const enteredGoal = getInputState(elements.goalInputs);

  const initialError = validateState(enteredInitial, "Initial state");
  const goalError = validateState(enteredGoal, "Goal state");

  if (initialError) {
    showMessage(initialError, "error");
    return;
  }

  if (goalError) {
    showMessage(goalError, "error");
    return;
  }

  if (!isSolvable(enteredInitial, enteredGoal)) {
    showMessage("This puzzle is not solvable for the chosen goal state. Please enter a solvable configuration or generate a random puzzle.", "error");
    return;
  }

  initialState = [...enteredInitial];
  goalState = [...enteredGoal];
  renderBoard(elements.initialBoard, initialState);
  renderBoard(elements.goalBoard, goalState);

  showMessage("A* search is running. Calculating the optimal solution path...", "");
  const result = runAStar(initialState, goalState, elements.heuristicSelect.value);

  lastSearchResult = result;
  searchHasRun = true;

  if (!result.found) {
    showMessage("No solution was found.", "error");
    updateSummary(result);
    return;
  }

  solutionPath = result.path;
  currentStep = 0;

  renderSolutionPath();
  updateCurrentStep();
  updateSummary(result);
  setControlStateAfterRun();

  const heuristicLabel = elements.heuristicSelect.options[elements.heuristicSelect.selectedIndex].text;
  showMessage(
    `Solution found using A* with ${heuristicLabel}. ${solutionPath.length - 1} move(s), ${result.stats.expanded} node(s) expanded.`,
    "success"
  );

  playAnimation();
}

function handlePause() {
  if (!searchHasRun) return;

  paused = true;
  stopAnimation();
  elements.pauseButton.disabled = true;
  elements.resumeButton.disabled = false;
  showMessage("Animation paused. Use Next Step, Previous Step, or Resume.", "");
}

function handleResume() {
  if (!searchHasRun) return;

  paused = false;
  elements.pauseButton.disabled = false;
  elements.resumeButton.disabled = true;
  showMessage("Animation resumed.", "");
  playAnimation();
}

function handleNext() {
  if (!searchHasRun || currentStep >= solutionPath.length - 1) return;

  paused = true;
  stopAnimation();
  currentStep += 1;
  updateCurrentStep();
  elements.pauseButton.disabled = true;
  elements.resumeButton.disabled = currentStep >= solutionPath.length - 1;
}

function handlePrevious() {
  if (!searchHasRun || currentStep <= 0) return;

  paused = true;
  stopAnimation();
  currentStep -= 1;
  updateCurrentStep();
  elements.pauseButton.disabled = true;
  elements.resumeButton.disabled = false;
}

function handleReset() {
  stopAnimation();

  initialState = [...DEFAULT_INITIAL];
  goalState = [...DEFAULT_GOAL];
  solutionPath = [];
  currentStep = 0;
  paused = false;
  searchHasRun = false;
  lastSearchResult = null;

  setInputState(elements.initialInputs, initialState);
  setInputState(elements.goalInputs, goalState);
  renderAllBoards();
  resetStatistics();

  elements.pauseButton.disabled = true;
  elements.resumeButton.disabled = true;
  elements.previousButton.disabled = true;
  elements.nextButton.disabled = true;

  showMessage("Puzzle reset to the default solvable configuration.", "");
}

function generateRandomSolvablePuzzle() {
  stopAnimation();

  let randomState;

  do {
    randomState = [...DEFAULT_GOAL];

    for (let i = randomState.length - 1; i > 0; i -= 1) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [randomState[i], randomState[randomIndex]] = [randomState[randomIndex], randomState[i]];
    }
  } while (
    !isSolvable(randomState, goalState) ||
    stateKey(randomState) === stateKey(goalState) ||
    manhattanDistance(randomState, getGoalPositions(goalState)) < 8
  );

  initialState = randomState;
  setInputState(elements.initialInputs, initialState);

  solutionPath = [];
  currentStep = 0;
  paused = false;
  searchHasRun = false;

  renderAllBoards();
  resetStatistics();

  elements.pauseButton.disabled = true;
  elements.resumeButton.disabled = true;
  elements.previousButton.disabled = true;
  elements.nextButton.disabled = true;

  showMessage("A new random solvable puzzle has been generated. Click Run A* to solve it.", "success");
}

function initializeApp() {
  createInputGrid(elements.initialInputs, initialState);
  createInputGrid(elements.goalInputs, goalState);
  renderAllBoards();
  resetStatistics();

  elements.runButton.addEventListener("click", handleRun);
  elements.pauseButton.addEventListener("click", handlePause);
  elements.resumeButton.addEventListener("click", handleResume);
  elements.nextButton.addEventListener("click", handleNext);
  elements.previousButton.addEventListener("click", handlePrevious);
  elements.resetButton.addEventListener("click", handleReset);
  elements.randomButton.addEventListener("click", generateRandomSolvablePuzzle);

  showMessage("Enter an initial state or use the random-puzzle button, then run A*.", "");
}

initializeApp();
