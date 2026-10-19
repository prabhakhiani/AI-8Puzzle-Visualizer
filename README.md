# Interactive 8-Puzzle Problem Solver using A* Search

An interactive web application developed for an Artificial Intelligence case study. The application solves the classic 8-Puzzle problem using the **A\* informed search algorithm** and visually demonstrates the solution path, search process, heuristic values, and performance statistics.

## Live Demo

- **GitHub Pages URL:** https://prabhakhiani.github.io/AI-8Puzzle-Visualizer/
- **GitHub Repository:** https://github.com/prabhakhiani/AI-8Puzzle-Visualizer

## Student Details

| Field | Details |
|---|---|
| Student Name | Prabha Khiani |
| Registration Number | 24BDS0354 |
| Course | Artificial Intelligence |
| Assignment | Interactive 8-Puzzle Problem Solver |
| Assigned Algorithm | A* Search (Informed Search) |

## Project Description

The 8-Puzzle contains eight numbered tiles and one blank space arranged in a 3 × 3 grid. A legal action moves the blank tile up, down, left, or right by swapping it with an adjacent numbered tile.

This project models every board arrangement as a state in a state-space graph. A* Search finds an optimal sequence of moves from an initial state to a goal state using:

```text
f(n) = g(n) + h(n)
```

Where:

- `g(n)` is the path cost from the initial state to node `n`
- `h(n)` is the estimated cost from node `n` to the goal state
- `f(n)` is the estimated total solution cost

## Features

- Manual initial-state and goal-state input
- Random solvable 8-puzzle generator
- A* Search implemented from scratch in JavaScript
- Two selectable heuristics
- Misplaced Tiles heuristic
- Manhattan Distance heuristic
- Puzzle solvability validation using inversion parity
- Animated blank-tile movement
- Run, Pause, Resume, Next Step, Previous Step, Reset, and speed controls
- Initial, current, and goal state boards
- Live search-process visualization
- Current node and parent node display
- Frontier (Open List) and Explored (Closed List) display
- Search depth, `g(n)`, `h(n)`, and `f(n)` values
- Solution path visualization
- Performance statistics
- Responsive design for desktop and mobile devices
- Algorithm comparison and A* documentation section

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6)
- GitHub
- GitHub Pages

## Search Algorithm

### A* Search

A* is an informed best-first search algorithm. It selects the frontier node with the smallest value of:

```text
f(n) = g(n) + h(n)
```

The algorithm uses:

1. An **Open List** (frontier) that stores states waiting to be explored.
2. A **Closed List** (explored set) that stores already expanded states.
3. A priority rule that chooses the node with the smallest `f(n)`.
4. Parent references to reconstruct the final solution path.

### A* Properties

| Property | Details |
|---|---|
| Search Type | Informed Search |
| Complete | Yes, with finite branching factor and positive step costs |
| Optimal | Yes, with an admissible and consistent heuristic |
| Time Complexity | Exponential in the worst case |
| Space Complexity | Exponential in the worst case |
| Path Cost | Each valid tile movement has a cost of 1 |

## Heuristics Used

### Misplaced Tiles

This heuristic counts the number of numbered tiles that are not in their goal position. The blank tile is ignored.

Example:

```text
State: 1 2 3 / 4 0 6 / 7 5 8
Goal : 1 2 3 / 4 5 6 / 7 8 0

Misplaced Tiles = 2
```

### Manhattan Distance

This heuristic calculates the total horizontal and vertical distance of every numbered tile from its goal position. The blank tile is ignored.

```text
h(n) = Σ (|current row − goal row| + |current column − goal column|)
```

Manhattan Distance usually guides A* more effectively than Misplaced Tiles because it includes how far every tile is from its target position.

## How to Run Locally

1. Download or clone this repository.
2. Open the project folder.
3. Open `index.html` in a modern web browser.
4. Enter a valid initial state and goal state, or click **Generate Random Solvable Puzzle**.
5. Select a heuristic.
6. Click **Run A***.
7. Observe the live search values and animated solution path.

No external installation or server is required.

## How to Use

1. Enter values from `0` to `8` in the Initial State grid.
2. Use `0` for the blank tile.
3. Ensure every value from `0` to `8` appears exactly once.
4. Enter the Goal State, or retain the default goal state.
5. Select **Manhattan Distance** or **Misplaced Tiles**.
6. Click **Run A***.
7. Use **Pause**, **Resume**, **Next Step**, and **Previous Step** to control the animation.
8. Review the Solution Summary and search-process statistics.

## Example Test Case

```text
Initial State:  1 2 3
                4 0 6
                7 5 8

Goal State:     1 2 3
                4 5 6
                7 8 0
```

Expected result:

- Solution found
- Total moves: 2
- Path cost: 2

## Project Structure

```text
AI-8Puzzle-Visualizer/
├── index.html          # Main webpage structure
├── README.md           # Project documentation
├── .nojekyll           # Disables Jekyll for GitHub Pages deployment
├── css/
│   └── style.css       # Responsive design and visual styling
└── js/
    └── app.js          # A* algorithm, heuristics, UI, and animation logic
```

## Screenshots

Add screenshots here before final submission.

Suggested screenshots:

1. Home page and puzzle input interface
2. A* search process showing `g(n)`, `h(n)`, and `f(n)`
3. Current animated puzzle state
4. Final solution path and performance summary
5. Algorithm comparison and A* information section

## References

1. GitHub Pages Documentation: https://docs.github.com/en/pages
2. MDN Web Docs — JavaScript: https://developer.mozilla.org/en-US/docs/Web/JavaScript
3. UC Berkeley CS188 — Informed Search: https://inst.eecs.berkeley.edu/~cs188/textbook/search/informed.html
4. University of Waterloo — Informed Search Notes: https://cs.uwaterloo.ca/~klarson/teaching/F19-486/notes/03-InformedSearch.pdf

## Academic Integrity

This project was developed for academic learning. Third-party conceptual and documentation resources are acknowledged in the References section.
