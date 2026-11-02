
/* =========================================
   PATTERNLAB
   KMP + RABIN-KARP VISUALIZER
========================================= */


/* =========================================
   DOM ELEMENTS
========================================= */

const ui = {
    algorithm: document.getElementById("algorithm"),

    speed: document.getElementById("speed"),
    speedLabel: document.getElementById("speed-label"),

    textInput: document.getElementById("text-input"),
    patternInput: document.getElementById("pattern-input"),

    exampleBtn: document.getElementById("example-btn"),
    startBtn: document.getElementById("start-btn"),
    inputStatus: document.getElementById("input-status"),

    phaseBadge: document.getElementById("phase-badge"),
    visualization: document.getElementById("visualization"),

    playBtn: document.getElementById("play-btn"),
    stepBtn: document.getElementById("step-btn"),
    pauseBtn: document.getElementById("pause-btn"),
    resetBtn: document.getElementById("reset-btn"),

    progressText: document.getElementById("progress-text"),
    progressBar: document.getElementById("progress-bar"),
    progressFill: document.getElementById("progress-fill"),

    operationTitle: document.getElementById("operation-title"),
    operationDescription: document.getElementById("operation-description"),

    detailTitle: document.getElementById("detail-title"),
    detailBadge: document.getElementById("detail-badge"),

    algorithmDetails: document.getElementById("algorithm-details"),
    pseudocode: document.getElementById("pseudocode"),

    comparisonsStat: document.getElementById("comparisons-stat"),
    hashStat: document.getElementById("hash-stat"),
    matchesStat: document.getElementById("matches-stat"),

    conceptHeading: document.getElementById("concept-heading"),
    conceptDescription: document.getElementById("concept-description"),
    complexityDescription: document.getElementById("complexity-description")
};


/* =========================================
   APPLICATION STATE
========================================= */

let events = [];
let currentStep = 0;

let isPlaying = false;
let timer = null;

let currentAlgorithm = "kmp";

let text = "";
let pattern = "";

let statistics = {
    comparisons: 0,
    hashes: 0,
    matches: 0
};


/* =========================================
   CONSTANTS
========================================= */

const BASE = 256;
const MOD = 101;

const ALGORITHMS = {

    kmp: {
        name: "Knuth-Morris-Pratt",
        shortName: "KMP",
        complexity: "O(n + m) time and O(m) extra space.",
        explanation:
            "KMP uses the Longest Prefix Suffix (LPS) table to avoid unnecessary comparisons. When a mismatch occurs, it shifts the pattern intelligently instead of restarting from the beginning."
    },

    rk: {
        name: "Rabin-Karp",
        shortName: "Rabin-Karp",
        complexity:
            "Average O(n + m) time; worst-case O(nm). Extra space is O(1), excluding stored visualization steps.",
        explanation:
            "Rabin-Karp compares hash values of the pattern and text windows. It uses a rolling hash to calculate the next window's hash efficiently. Actual characters are compared when hashes match."
    }

};


/* =========================================
   PSEUDOCODE
========================================= */

const PSEUDOCODE = {

    kmp: [
        "Build the LPS array",
        "i = 0, j = 0",
        "while i < n:",
        "    if text[i] == pattern[j]:",
        "        i++, j++",
        "        if j == m:",
        "            Report match",
        "            j = LPS[j - 1]",
        "    else if j > 0:",
        "        j = LPS[j - 1]",
        "    else:",
        "        i++"
    ],

    rk: [
        "Calculate pattern hash",
        "Calculate first window hash",
        "for each text window:",
        "    if hashes are equal:",
        "        Compare characters",
        "        if characters match:",
        "            Report match",
        "    Calculate next rolling hash",
        "    Shift window by one"
    ]

};


/* =========================================
   UTILITY FUNCTIONS
========================================= */

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[char];

    });

}


function delay() {

    const speed = Number(ui.speed.value);

    const delays = {
        1: 1500,
        2: 950,
        3: 550,
        4: 300,
        5: 120
    };

    return delays[speed] || 550;

}


function stopPlayback() {

    isPlaying = false;

    if (timer !== null) {
        clearTimeout(timer);
        timer = null;
    }

    updateControls();

}


function updateControls() {

    ui.playBtn.disabled =
        events.length === 0 ||
        isPlaying ||
        currentStep >= events.length;

    ui.pauseBtn.disabled = !isPlaying;

    ui.stepBtn.disabled =
        events.length === 0 ||
        isPlaying ||
        currentStep >= events.length;

    ui.resetBtn.disabled =
        events.length === 0 ||
        (currentStep === 0 && !isPlaying);

}


/* =========================================
   EVENT CREATION
========================================= */

function addEvent(data) {

    events.push({
        ...data,

        statistics: {
            comparisons: statistics.comparisons,
            hashes: statistics.hashes,
            matches: statistics.matches
        }
    });

}


/* =========================================
   RESET APPLICATION
========================================= */

function resetApplication() {

    stopPlayback();

    events = [];
    currentStep = 0;

    statistics = {
        comparisons: 0,
        hashes: 0,
        matches: 0
    };

    ui.comparisonsStat.textContent = "0";
    ui.hashStat.textContent = "0";
    ui.matchesStat.textContent = "0";

    ui.progressText.textContent = "0 / 0";
    ui.progressFill.style.width = "0%";
    ui.progressBar.setAttribute("aria-valuenow", "0");

    ui.phaseBadge.textContent = "Ready";
    ui.phaseBadge.className = "phase-badge";

    ui.operationTitle.textContent = "Waiting to start";

    ui.operationDescription.textContent =
        "Enter text and pattern, then press Start.";

    ui.visualization.innerHTML = `
        <div class="visualization-empty">
            <p>Start the algorithm to see the visualization.</p>
        </div>
    `;

    ui.pseudocode.innerHTML = "";

    ui.algorithmDetails.innerHTML = "";

    updateControls();

}


/* =========================================
   INPUT VALIDATION
========================================= */

function validateInputs() {

    text = ui.textInput.value;
    pattern = ui.patternInput.value;

    if (text.length === 0) {

        ui.inputStatus.textContent = "Please enter some text.";
        return false;

    }

    if (pattern.length === 0) {

        ui.inputStatus.textContent = "Please enter a pattern.";
        return false;

    }

    if (pattern.length > text.length) {

        ui.inputStatus.textContent =
            "The pattern cannot be longer than the text.";

        return false;

    }

    if (text.length > 100) {

        ui.inputStatus.textContent =
            "Please keep the text to 100 characters or fewer.";

        return false;

    }

    if (pattern.length > 30) {

        ui.inputStatus.textContent =
            "Please keep the pattern to 30 characters or fewer.";

        return false;

    }

    ui.inputStatus.textContent = "";

    return true;

}


/* =========================================
   START ALGORITHM
========================================= */

function startAlgorithm() {

    stopPlayback();

    if (!validateInputs()) {
        return;
    }

    events = [];
    currentStep = 0;

    statistics = {
        comparisons: 0,
        hashes: 0,
        matches: 0
    };

    currentAlgorithm = ui.algorithm.value;

    if (currentAlgorithm === "kmp") {

        buildKMP();

    } else {

        buildRabinKarp();

    }

    if (events.length === 0) {
        return;
    }

    renderPseudocode();

    updateLearningInformation();

    renderEvent(0);

    updateControls();

}


/* =========================================
   KMP ALGORITHM
========================================= */

function buildKMP() {

    const n = text.length;
    const m = pattern.length;

    const lps = new Array(m).fill(0);

    let len = 0;
    let i = 1;

    /* -------------------------------------
       PHASE 1: BUILD LPS ARRAY
    ------------------------------------- */

    addEvent({
        phase: "LPS Construction",

        title: "Building the LPS Table",

        description:
            "KMP first builds the Longest Prefix Suffix table. This table tells us how far to move the pattern after a mismatch.",

        textIndex: -1,
        patternIndex: -1,

        windowStart: 0,

        lps: [...lps],

        activeLine: 0,

        detail:
            "LPS means Longest Proper Prefix which is also a Suffix.",

        success: false
    });


    while (i < m) {

        statistics.comparisons++;

        const matched = pattern[i] === pattern[len];

        addEvent({
            phase: "LPS Construction",

            title: "Comparing Pattern Characters",

            description:
                `Compare pattern[${i}] = "${pattern[i]}" with pattern[${len}] = "${pattern[len]}".`,

            textIndex: -1,
            patternIndex: i,

            windowStart: 0,

            lps: [...lps],

            activePattern: [i, len],

            activeLine: 1,

            detail: matched
                ? "Both characters match. Increase the current prefix length."
                : "The characters do not match. Check whether a previous prefix can help.",

            success: false
        });


        if (matched) {

            len++;

            lps[i] = len;

            addEvent({
                phase: "LPS Construction",

                title: "LPS Value Updated",

                description:
                    `LPS[${i}] = ${len}. The matching prefix and suffix have length ${len}.`,

                textIndex: -1,
                patternIndex: i,

                windowStart: 0,

                lps: [...lps],

                activePattern: [i],

                activeLine: 2,

                detail:
                    "The LPS table stores the length of the longest proper prefix that is also a suffix.",

                success: false
            });

            i++;

        } else if (len !== 0) {

            len = lps[len - 1];

            addEvent({
                phase: "LPS Construction",

                title: "LPS Fallback",

                description:
                    `The mismatch occurred. Set len = LPS[${len}] to reuse previous prefix information.`,

                textIndex: -1,
                patternIndex: i,

                windowStart: 0,

                lps: [...lps],

                activePattern: [i],

                activeLine: 3,

                detail:
                    "KMP does not restart from zero. It uses an already calculated LPS value.",

                success: false
            });

        } else {

            lps[i] = 0;

            addEvent({
                phase: "LPS Construction",

                title: "LPS Value Is Zero",

                description:
                    `No proper prefix matches a suffix at this position. LPS[${i}] = 0.`,

                textIndex: -1,
                patternIndex: i,

                windowStart: 0,

                lps: [...lps],

                activePattern: [i],

                activeLine: 4,

                detail:
                    "Move to the next pattern position.",

                success: false
            });

            i++;

        }

    }


    /* -------------------------------------
       PHASE 2: PATTERN MATCHING
    ------------------------------------- */

    addEvent({
        phase: "Matching",

        title: "Starting Pattern Matching",

        description:
            "The LPS table is complete. Now KMP searches for the pattern inside the text.",

        textIndex: 0,
        patternIndex: 0,

        windowStart: 0,

        lps: [...lps],

        activeLine: 5,

        detail:
            "i represents the current text index, and j represents the current pattern index.",

        success: false
    });


    let textIndex = 0;
    let patternIndex = 0;

    while (textIndex < n) {

        statistics.comparisons++;

        const matched =
            text[textIndex] === pattern[patternIndex];

        addEvent({
            phase: "Matching",

            title: matched
                ? "Characters Match"
                : "Character Mismatch",

            description:
                `Text[${textIndex}] = "${text[textIndex]}" and Pattern[${patternIndex}] = "${pattern[patternIndex]}".`,

            textIndex,
            patternIndex,

            windowStart: Math.max(0, textIndex - patternIndex),

            lps: [...lps],

            activeLine: matched ? 6 : 9,

            detail: matched
                ? "The characters match. Move both pointers forward."
                : "A mismatch occurred. KMP uses the LPS table to avoid unnecessary comparisons.",

            success: false
        });


        if (matched) {

            textIndex++;
            patternIndex++;


            if (patternIndex === m) {

                const matchPosition = textIndex - patternIndex;

                statistics.matches++;

                addEvent({
                    phase: "Matching",

                    title: "Pattern Found!",

                    description:
                        `The complete pattern was found at index ${matchPosition}.`,

                    textIndex: textIndex - 1,
                    patternIndex: patternIndex - 1,

                    windowStart: matchPosition,

                    lps: [...lps],

                    activeLine: 7,

                    matchPosition,

                    detail:
                        `Match found at zero-based index ${matchPosition}. KMP continues searching using the LPS table.`,

                    success: true
                });


                patternIndex = lps[patternIndex - 1];

            }

        } else if (patternIndex !== 0) {

            const previous = patternIndex;

            patternIndex = lps[patternIndex - 1];

            addEvent({
                phase: "Matching",

                title: "Using LPS Fallback",

                description:
                    `Pattern index moves from ${previous} to ${patternIndex}. The text index remains at ${textIndex}.`,

                textIndex,
                patternIndex,

                windowStart: Math.max(0, textIndex - patternIndex),

                lps: [...lps],

                activeLine: 10,

                detail:
                    "The LPS value determines the next pattern position. No text character is skipped.",

                success: false
            });

        } else {

            textIndex++;

            addEvent({
                phase: "Matching",

                title: "Moving to Next Text Character",

                description:
                    "The mismatch occurred at pattern index zero. Move to the next text character.",

                textIndex: textIndex - 1,
                patternIndex: 0,

                windowStart: textIndex - 1,

                lps: [...lps],

                activeLine: 11,

                detail:
                    "Because there is no reusable prefix, advance the text pointer by one.",

                success: false
            });

        }

    }


    addEvent({
        phase: "Completed",

        title: "KMP Search Completed",

        description:
            statistics.matches > 0
                ? `Search completed. Found ${statistics.matches} match(es).`
                : "Search completed. No matching pattern was found.",

        textIndex: n,
        patternIndex: 0,

        windowStart: 0,

        lps: [...lps],

        activeLine: 12,

        detail:
            `Total character comparisons: ${statistics.comparisons}. Total matches: ${statistics.matches}.`,

        success: statistics.matches > 0
    });

}


/* =========================================
   RABIN-KARP ALGORITHM
========================================= */

function buildRabinKarp() {

    const n = text.length;
    const m = pattern.length;

    const h = Math.pow(BASE, m - 1) % MOD;

    let patternHash = 0;
    let windowHash = 0;

    /* -------------------------------------
       PHASE 1: INITIAL HASHES
    ------------------------------------- */

    for (let i = 0; i < m; i++) {

        patternHash =
            (BASE * patternHash + pattern.charCodeAt(i)) % MOD;

        windowHash =
            (BASE * windowHash + text.charCodeAt(i)) % MOD;

        statistics.hashes += 2;

    }


    addEvent({
        phase: "Hashing",

        title: "Initial Hash Calculation",

        description:
            `Pattern hash = ${patternHash}. First text window hash = ${windowHash}.`,

        textIndex: 0,
        patternIndex: 0,

        windowStart: 0,

        patternHash,
        windowHash,

        activeLine: 0,

        detail:
            "Rabin-Karp calculates numeric hash values for the pattern and first text window.",

        success: false
    });


    /* -------------------------------------
       PHASE 2: SLIDING WINDOW
    ------------------------------------- */

    for (let start = 0; start <= n - m; start++) {

        const hashEqual = patternHash === windowHash;

        addEvent({
            phase: "Matching",

            title: "Comparing Hash Values",

            description:
                `Pattern hash = ${patternHash}, Window hash = ${windowHash}.`,

            textIndex: start,
            patternIndex: 0,

            windowStart: start,

            patternHash,
            windowHash,

            activeLine: 2,

            detail: hashEqual
                ? "The hash values match. Verify the actual characters to rule out a spurious hit."
                : "The hash values differ. This window cannot contain the pattern.",

            success: false
        });


        if (hashEqual) {

            let j = 0;

            let actualMatch = true;

            while (j < m) {

                statistics.comparisons++;

                const matched = text[start + j] === pattern[j];

                addEvent({
                    phase: "Matching",

                    title: matched
                        ? "Character Verification"
                        : "Hash Collision Detected",

                    description:
                        `Compare text[${start + j}] = "${text[start + j]}" with pattern[${j}] = "${pattern[j]}".`,

                    textIndex: start + j,
                    patternIndex: j,

                    windowStart: start,

                    patternHash,
                    windowHash,

                    activeLine: 4,

                    detail: matched
                        ? "Characters match. Continue verifying the remaining characters."
                        : "Hash values matched, but characters differ. This is a spurious hit.",

                    success: false
                });


                if (!matched) {

                    actualMatch = false;
                    break;

                }

                j++;

            }


            if (actualMatch) {

                statistics.matches++;

                addEvent({
                    phase: "Matching",

                    title: "Pattern Found!",

                    description:
                        `The pattern was found at index ${start}. Both hash values and all characters match.`,

                    textIndex: start + m - 1,
                    patternIndex: m - 1,

                    windowStart: start,

                    patternHash,
                    windowHash,

                    matchPosition: start,

                    activeLine: 6,

                    detail:
                        `A valid match was found at zero-based index ${start}.`,

                    success: true
                });

            }

        }


        /* ---------------------------------
           PHASE 3: ROLLING HASH
        --------------------------------- */

        if (start < n - m) {

            const oldHash = windowHash;

            const outgoing = text.charCodeAt(start);
            const incoming = text.charCodeAt(start + m);

            windowHash =
                (BASE * (windowHash - outgoing * h) + incoming) % MOD;

            if (windowHash < 0) {
                windowHash += MOD;
            }

            statistics.hashes++;

            addEvent({
                phase: "Rolling Hash",

                title: "Updating Rolling Hash",

                description:
                    `Remove "${text[start]}" and add "${text[start + m]}".`,

                textIndex: start + 1,
                patternIndex: 0,

                windowStart: start + 1,

                patternHash,
                windowHash,

                oldHash,

                outgoing,
                incoming,

                activeLine: 7,

                detail:
                    `Old hash = ${oldHash}. New hash = ${windowHash}. The window moves one position forward.`,

                success: false
            });

        }

    }


    addEvent({
        phase: "Completed",

        title: "Rabin-Karp Search Completed",

        description:
            statistics.matches > 0
                ? `Search completed. Found ${statistics.matches} match(es).`
                : "Search completed. No matching pattern was found.",

        textIndex: n - m,
        patternIndex: m - 1,

        windowStart: Math.max(0, n - m),

        patternHash,
        windowHash,

        activeLine: 8,

        detail:
            `Hash operations: ${statistics.hashes}. Character comparisons: ${statistics.comparisons}.`,

        success: statistics.matches > 0
    });

}


/* =========================================
   RENDER PSEUDOCODE
========================================= */

function renderPseudocode(activeLine = -1) {

    const lines = PSEUDOCODE[currentAlgorithm];

    ui.pseudocode.innerHTML = lines.map((line, index) => {

        const activeClass =
            index === activeLine ? "active-line" : "";

        return `
            <div class="${activeClass}">
                <span class="line-number">${index + 1}.</span>
                <span>${escapeHTML(line)}</span>
            </div>
        `;

    }).join("");

}


/* =========================================
   RENDER VISUALIZATION
========================================= */

function renderVisualization(event) {

    const textIndex = event.textIndex;
    const patternIndex = event.patternIndex;

    const windowStart = event.windowStart || 0;

    let textHTML = "";
    let patternHTML = "";


    /* -------------------------------------
       TEXT CHARACTERS
    ------------------------------------- */

    for (let i = 0; i < text.length; i++) {

        let className = "char-cell";

        if (event.matchPosition !== undefined) {

            if (
                i >= event.matchPosition &&
                i < event.matchPosition + pattern.length
            ) {
                className += " matched";
            }

        } else if (
            i === textIndex &&
            event.phase !== "Completed"
        ) {

            className += " active";

        } else if (
            event.phase === "Matching" &&
            i >= windowStart &&
            i < windowStart + pattern.length &&
            currentAlgorithm === "rk"
        ) {

            className += " comparing";

        }


        textHTML += `
            <div class="${className}" title="Text index ${i}">
                ${escapeHTML(text[i])}
            </div>
        `;

    }


    /* -------------------------------------
       PATTERN CHARACTERS
    ------------------------------------- */

    for (let i = 0; i < pattern.length; i++) {

        let className = "char-cell";

        if (
            event.matchPosition !== undefined
        ) {

            className += " matched";

        } else if (
            i === patternIndex &&
            event.phase !== "Completed"
        ) {

            className += " active";

        } else if (
            event.phase === "Matching" &&
            currentAlgorithm === "rk"
        ) {

            className += " comparing";

        }

        patternHTML += `
            <div class="${className}" title="Pattern index ${i}">
                ${escapeHTML(pattern[i])}
            </div>
        `;

    }


    /* -------------------------------------
       KMP LPS TABLE
    ------------------------------------- */

    let lpsHTML = "";

    if (currentAlgorithm === "kmp" && event.lps) {

        lpsHTML = `
            <div class="lps-section" style="margin-top:18px;">
                <div style="color:#8995a8;font-size:11px;margin-bottom:7px;">
                    LPS TABLE
                </div>

                <div class="character-row">
                    ${event.lps.map((value, index) => `
                        <div style="
                            display:flex;
                            flex-direction:column;
                            align-items:center;
                            gap:4px;
                        ">
                            <span style="font-size:9px;color:#8995a8;">
                                ${index}
                            </span>

                            <div class="char-cell ${
                                event.activePattern?.includes(index)
                                    ? "active"
                                    : ""
                            }">
                                ${value}
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;

    }


    /* -------------------------------------
       RABIN-KARP HASH INFORMATION
    ------------------------------------- */

    let hashHTML = "";

    if (currentAlgorithm === "rk" &&
        event.patternHash !== undefined) {

        hashHTML = `
            <div class="hash-information" style="
                margin-top:16px;
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:8px;
            ">

                <div style="
                    background:#191f2b;
                    padding:9px;
                    border-radius:6px;
                ">
                    <span style="color:#8995a8;font-size:10px;">
                        PATTERN HASH
                    </span>

                    <strong style="display:block;margin-top:3px;">
                        ${event.patternHash}
                    </strong>
                </div>

                <div style="
                    background:#191f2b;
                    padding:9px;
                    border-radius:6px;
                ">
                    <span style="color:#8995a8;font-size:10px;">
                        WINDOW HASH
                    </span>

                    <strong style="display:block;margin-top:3px;">
                        ${event.windowHash}
                    </strong>
                </div>

            </div>
        `;

    }


    /* -------------------------------------
       FINAL VISUALIZATION
    ------------------------------------- */

    ui.visualization.innerHTML = `

        <div style="margin-bottom:12px;">

            <div style="
                display:flex;
                justify-content:space-between;
                margin-bottom:7px;
                color:#8995a8;
                font-size:10px;
            ">
                <span>TEXT</span>
                <span>${text.length} characters</span>
            </div>

            <div class="character-row">
                ${textHTML}
            </div>

        </div>


        <div>

            <div style="
                display:flex;
                justify-content:space-between;
                margin-bottom:7px;
                color:#8995a8;
                font-size:10px;
            ">
                <span>PATTERN</span>
                <span>${pattern.length} characters</span>
            </div>

            <div class="character-row">
                ${patternHTML}
            </div>

        </div>

        ${lpsHTML}

        ${hashHTML}

    `;

}


/* =========================================
   RENDER CURRENT EVENT
========================================= */

function renderEvent(index) {

    const event = events[index];

    if (!event) {
        return;
    }

    currentStep = index;

    /* Visualization */

    renderVisualization(event);

    /* Pseudocode */

    renderPseudocode(event.activeLine);

    /* Operation explanation */

    ui.operationTitle.textContent = event.title;

    ui.operationDescription.textContent =
        event.description;

    /* Phase */

    ui.phaseBadge.textContent = event.phase;

    ui.phaseBadge.className = "phase-badge";

    if (event.phase === "Completed") {

        if (event.success) {
            ui.phaseBadge.classList.add("success");
        }

    } else {

        ui.phaseBadge.classList.add("active");

    }

    /* Algorithm name */

    ui.detailBadge.textContent =
        ALGORITHMS[currentAlgorithm].shortName;

    ui.detailTitle.textContent =
        ALGORITHMS[currentAlgorithm].name;

    /* Statistics */

    ui.comparisonsStat.textContent =
        event.statistics.comparisons;

    ui.hashStat.textContent =
        event.statistics.hashes;

    ui.matchesStat.textContent =
        event.statistics.matches;

    /* Additional details */

    ui.algorithmDetails.textContent =
        event.detail || "";

    /* Progress */

    const progress =
        ((index + 1) / events.length) * 100;

    ui.progressFill.style.width = `${progress}%`;

    ui.progressText.textContent =
        `${index + 1} / ${events.length}`;

    ui.progressBar.setAttribute(
        "aria-valuenow",
        Math.round(progress)
    );

    updateControls();

}


/* =========================================
   LEARNING INFORMATION
========================================= */

function updateLearningInformation() {

    const info = ALGORITHMS[currentAlgorithm];

    ui.conceptHeading.textContent = info.name;

    ui.conceptDescription.textContent =
        info.explanation;

    ui.complexityDescription.textContent =
        info.complexity;

}


/* =========================================
   STEP FORWARD
========================================= */

function stepForward() {

    if (currentStep < events.length - 1) {

        renderEvent(currentStep + 1);

    } else {

        stopPlayback();

    }

}


/* =========================================
   PLAY ANIMATION
========================================= */

function playAnimation() {

    if (events.length === 0) {

        startAlgorithm();

        if (events.length === 0) {
            return;
        }

    }

    if (currentStep >= events.length - 1) {
        renderEvent(0);
    }

    if (isPlaying) {
        return;
    }

    isPlaying = true;

    updateControls();

    function next() {

        if (!isPlaying) {
            return;
        }

        if (currentStep >= events.length - 1) {

            stopPlayback();

            return;

        }

        stepForward();

        timer = setTimeout(next, delay());

    }

    timer = setTimeout(next, delay());

}


/* =========================================
   PAUSE ANIMATION
========================================= */

function pauseAnimation() {

    stopPlayback();

}


/* =========================================
   EXAMPLE BUTTON
========================================= */

function loadExample() {

    stopPlayback();

    ui.textInput.value = "ABABDABACDABABCABAB";

    ui.patternInput.value = "ABABCABAB";

    ui.inputStatus.textContent = "";

    resetApplication();

}


/* =========================================
   SPEED LABEL
========================================= */

function updateSpeedLabel() {

    const labels = {
        1: "0.5x",
        2: "0.75x",
        3: "1x",
        4: "1.5x",
        5: "2x"
    };

    ui.speedLabel.textContent =
        labels[ui.speed.value] || "1x";

}


/* =========================================
   EVENT LISTENERS
========================================= */

ui.startBtn.addEventListener("click", startAlgorithm);

ui.playBtn.addEventListener("click", playAnimation);

ui.pauseBtn.addEventListener("click", pauseAnimation);

ui.stepBtn.addEventListener("click", () => {

    if (events.length === 0) {

        startAlgorithm();

        if (events.length === 0) {
            return;
        }

    }

    stopPlayback();

    stepForward();

});

ui.resetBtn.addEventListener("click", () => {

    resetApplication();

});

ui.exampleBtn.addEventListener("click", loadExample);

ui.speed.addEventListener("input", updateSpeedLabel);


/* =========================================
   ALGORITHM CHANGE
========================================= */

ui.algorithm.addEventListener("change", () => {

    stopPlayback();

    resetApplication();

    currentAlgorithm = ui.algorithm.value;

    const info = ALGORITHMS[currentAlgorithm];

    ui.detailBadge.textContent = info.shortName;

    ui.detailTitle.textContent = info.name;

    updateLearningInformation();

});


/* =========================================
   INPUT CHANGE
========================================= */

ui.textInput.addEventListener("input", () => {

    stopPlayback();

    resetApplication();

    ui.inputStatus.textContent = "";

});

ui.patternInput.addEventListener("input", () => {

    stopPlayback();

    resetApplication();

    ui.inputStatus.textContent = "";

});


/* =========================================
   KEYBOARD SHORTCUTS
========================================= */

document.addEventListener("keydown", event => {

    const tag = event.target.tagName;

    if (
        tag === "INPUT" ||
        tag === "SELECT" ||
        tag === "TEXTAREA"
    ) {
        return;
    }

    if (event.code === "Space") {

        event.preventDefault();

        if (isPlaying) {
            pauseAnimation();
        } else {
            playAnimation();
        }

    }

    if (event.key === "ArrowRight") {

        stopPlayback();

        if (events.length > 0) {
            stepForward();
        }

    }

    if (event.key === "Escape") {

        pauseAnimation();

    }

});


/* =========================================
   INITIALIZATION
========================================= */

function initializeApp() {

    currentAlgorithm = ui.algorithm.value;

    updateSpeedLabel();

    updateLearningInformation();

    ui.detailBadge.textContent =
        ALGORITHMS[currentAlgorithm].shortName;

    ui.detailTitle.textContent =
        ALGORITHMS[currentAlgorithm].name;

    resetApplication();

}

initializeApp();
