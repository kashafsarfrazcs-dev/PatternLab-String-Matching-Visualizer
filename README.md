# PatternLab – String Matching Visualizer

PatternLab is an interactive web-based visualization tool designed to make string matching algorithms easier to understand through step-by-step execution and visual representation.

The project demonstrates how **Knuth-Morris-Pratt (KMP)** and **Rabin-Karp** algorithms search for patterns within a given text, helping learners understand their working processes, comparisons, and performance.

## Features

- **Multiple Algorithms:** Explore KMP and Rabin-Karp string matching algorithms.
- **Step-by-Step Visualization:** Follow each comparison and matching operation.
- **Pseudocode Highlighting:** View the corresponding pseudocode line as the algorithm executes.
- **Playback Controls:** Play, pause, reset, and manually step through execution.
- **Performance Statistics:** Track character comparisons, hash operations, and pattern matches.
- **Adjustable Speed:** Control the visualization playback speed.
- **Learning Support:** Explore algorithm explanations and time complexity information.
- **Interactive Inputs:** Enter custom text and patterns to experiment with different cases.

## Algorithms Implemented

### 1. Knuth-Morris-Pratt (KMP)

KMP is a string matching algorithm that uses the Longest Prefix Suffix (LPS) array to avoid unnecessary comparisons when a mismatch occurs.

- Preprocessing: Builds the LPS array.
- Matching: Uses previously computed prefix information to continue searching efficiently.
- Time Complexity: O(n + m)

### 2. Rabin-Karp

Rabin-Karp uses hashing to identify potential pattern matches within a text.

- Calculates the hash of the pattern and text windows.
- Uses a rolling hash to efficiently calculate the next window's hash.
- Performs character-by-character verification when hashes match.
- Average Time Complexity: O(n + m)
- Worst-Case Time Complexity: O(n × m)

Where:
- n = Length of the text
- m = Length of the pattern

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla JavaScript)

## Project Structure

```text
PatternLab-String-Matching-Visualizer/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/kashafsarfrazcs-dev/PatternLab-String-Matching-Visualizer.git
```

### 2. Navigate to the Project Directory

```bash
cd PatternLab-String-Matching-Visualizer
```

### 3. Run the Project

Open `index.html` in your browser.

No additional dependencies or installations are required.

## Learning Objectives

This project was developed to strengthen understanding of string matching algorithms and demonstrate how theoretical algorithm concepts can be transformed into interactive visual experiences.

It focuses on:

- Understanding string matching techniques.
- Visualizing algorithm execution step by step.
- Exploring LPS preprocessing in KMP.
- Understanding hashing and rolling hash in Rabin-Karp.
- Comparing algorithm operations and time complexity.

## Future Improvements

- Add more string matching algorithms.
- Introduce side-by-side algorithm comparisons.
- Improve visualization and learning features.

## Author

**Kashaf Sarfraz**

Computer Science Student | FAST-NUCES

- GitHub: [@kashafsarfrazcs-dev](https://github.com/kashafsarfrazcs-dev)

---

If you find this project useful for learning, consider giving the repository a ⭐.
