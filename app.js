"use strict";

const phases = {
    INITIALIZED: "INITIALIZED",
    EDIT_GRID: "EDIT_GRID",
    EDIT_TEXT: "EDIT_TEXT"
}

const state = { //state updated with unidrectional data flow
    phase: phases.INITIALIZED,
    size: 0,
    legal: {
        twoWords: true,
        threeLetters: true,
        undivided: true,
        edge: true
    },
    totalFilled: 0,
    filledSquares: [],
    selected: null, //note: only for use in EDIT_TEXT phase
    clues: {across: {}, down: {}},
    clueEdit: {across: {}, down: {}}
}

const addIndices = () => { //adds appropriate numerical label to each square
    const puzzle = document.getElementById("puzzle");
    let count = 1;
    for (let i = 0; i < state.size; i++) {
        for (let j = 0; j < state.size; j++) {
            const square = document.getElementById(`grid-${i}X${j}`);
            const label = document.getElementById(`label-${i}X${j}`);
            let toLabel = !square.classList.contains("filled"); //initialize toLabel to true iff square is unfilled
            if (toLabel && i != 0 && j != 0) { //if square is unfilled but not on top row or left column, check to see if it has a filled seuare above or to the left
                const above = document.getElementById(`grid-${i - 1}X${j}`);
                const beside = document.getElementById(`grid-${i}X${j - 1}`);
                toLabel = above.classList.contains("filled") || beside.classList.contains("filled");
            }
            label.innerHTML = toLabel ? count++ : "";
        }
    }
}

const checkForWordLengthViolations = () => {
    state.legal.twoWords = true; //reset booleans in state to true; if both turn to false, we can exit the loop early
    state.legal.threeLetters = true;
    const {filledSquares} = state;
    for (let i = 0; i < state.size; i++) {
        for (let j = 1; j <= state.size; j++) {
            //first check for a single unfilled square in between an edge and a filled square or between two filled squares
            if (((j == state.size || filledSquares[i][j]) && (j < 2 || filledSquares[i][j - 2]) && !filledSquares[i][j - 1]) || //check horizontally
            ((j == state.size || filledSquares[j][i]) && (j < 2 || filledSquares[j - 2][i]) && !filledSquares[j - 1][i])) { //check vertically
                state.legal.twoWords = false;
            }
            if (j >= 2) { //now check for two unfilled squares in between edges and/or filled squares
                if (((j == state.size || filledSquares[i][j]) && (j < 3 || filledSquares[i][j - 3]) && !filledSquares[i][j - 1] && !filledSquares[i][j - 2]) ||
                ((j == state.size || filledSquares[j][i]) && (j < 3 || filledSquares[j - 3][i]) && !filledSquares[j - 1][i] && !filledSquares[j - 2][i])) {
                    state.legal.threeLetters = false;
                }
            }
            if (!state.legal.twoWords && !state.legal.threeLetters) { //if we've identified both, we can exit the loop early
                return;
            }
        } 
    }

}

const findFirstUnfilled = () => {
    const {filledSquares, size} = state; 
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (!filledSquares[i][j]) {
                return [i, j];
            }
        }
    }
}

const checkForConnectedViolations = () => {
    const {filledSquares, size, totalFilled} = state; 
    const found = new Set();
    const [i, j] = findFirstUnfilled();
    found.add(i + "X" + j);
    const q = [[i, j]];
    let count = 1;
    while (q.length > 0) { //run a DFS
        const [x, y] = q.pop();
        [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dx, dy]) => { //check all adjacent squares to see if they're unfilled and not yet found
            const [nx, ny] = [x + dx, y + dy];
            if (nx >= 0 && nx < size && ny >= 0 && ny < size && !found.has(nx + "X" + ny) && !filledSquares[nx][ny]) {
                count++;
                found.add(nx + "X" + ny);
                q.push([nx, ny]);
            }
        });
    }
    state.legal.undivided = count == size * size - totalFilled; //check the number of unfilled squares our DFS found with the known number
}

const checkForEdgeFilledViolation = () => {
    const {filledSquares} = state;
    if (filledSquares[0].every(sq => sq)) {
        state.legal.edge = false;
    } else if (filledSquares.every(row => row[0])) {
        state.legal.edge = false;
    } else {
        state.legal.edge = true;
    }
}

const evaluateLegality = () => { //update state variables that track legality and display or hide error messages accordingly
    checkForWordLengthViolations();
    checkForConnectedViolations();
    checkForEdgeFilledViolation();
    document.getElementById("two-words-error")
        .setAttribute("style", `visibility: ${state.legal.twoWords ? "hidden" : "default"};`);
    document.getElementById("two-letters-error")
        .setAttribute("style", `visibility: ${state.legal.threeLetters ? "hidden" : "default"};`);
    document.getElementById("divided-error")
        .setAttribute("style", `visibility: ${state.legal.undivided ? "hidden" : "default"};`);
    document.getElementById("edge-filled-error")
        .setAttribute("style", `visibility: ${state.legal.edge ? "hidden" : "default"};`);
}

const toggleFill = (i, j) => { //change a square and its radial symmetric oppositte from filled to unfilled or vice versa
    const {filledSquares, size} = state;
    const el1 = document.getElementById(`grid-${i}X${j}`);
    const el2 = document.getElementById(`grid-${size - i - 1}X${size - j - 1}`);
    const isFilled = filledSquares[i][j]
    if (!isFilled) {
        [el1, el2].forEach(el => el.classList.add("filled"));
        filledSquares[i][j] = true;
        filledSquares[size - i - 1][size - j - 1] = true;
        state.totalFilled += i == Math.floor(size / 2) && j == Math.floor(size / 2) ? 1 : 2; //determine if the toggled square is in the middle, in which case we're only changing one square
    } else {
        [el1, el2].forEach(el => el.classList.remove("filled"));
        filledSquares[i][j] = false;
        filledSquares[size - i - 1][size - j - 1] = false;
        state.totalFilled -= i == Math.floor(size / 2) && j == Math.floor(size / 2) ? 1 : 2;
    }
    addIndices();
    evaluateLegality();
}

const handleInput = (numericCode) => {
    if (!state.selected) {
        return;
    }
    const {x, y} = state.selected;
    const el = document.getElementById(`text-${x}X${y}`);
    el.innerHTML = numericCode == 8 ? "" : String.fromCharCode(numericCode);
}

const moveLeft = () => {
    const {filledSquares, selected, size} = state;
    const {x, y} = selected;
    if (x == 0 && y == 0) {
        return;
    }
    const firstRow = y == 0 ? x - 1 : x; //determine which row the next square to check is on
    for (let i = firstRow; i >= 0; i--) {
        for (let j = i == firstRow ? (y == 0 ? size - 1 : y - 1) : size - 1; j >= 0; j--) { //if we're on the firt row, start by checking the next column
            if (!filledSquares[i][j]) {
                handleSelect(i, j);
                return;
            }
        }
    }
}

const moveDown = () => {
    const {filledSquares, selected} = state;
    const {x, y} = selected;
    if (x == 0) {
        return;
    }
    for (let i = x - 1; i >= 0; i--) {
        if (!filledSquares[i][y]) {
            handleSelect(i, y);
            return;
        }
    }
}

const moveRight = () => {
    const {filledSquares, selected, size} = state;
    const {x, y} = selected;
    if (x == size - 1 && y == size - 1) {
        return;
    }
    const firstRow = y == size - 1 ? x + 1 : x; //determine which row the next square to check is on
    for (let i = firstRow; i < size; i++) {
        for (let j = i == firstRow ? (y + 1) % size : 0; j < size; j++) { //if we're on the firt row, start by checking the next column
            if (!filledSquares[i][j]) {
                handleSelect(i, j);
                return;
            }
        }
    }
}

const moveUp = () => {
    const {filledSquares, selected, size} = state;
    const {x, y} = selected;
    if (x == size - 1) {
        return;
    }
    for (let i = x + 1; i < size; i++) {
        if (!filledSquares[i][y]) {
            handleSelect(i, y);
            return;
        }
    }
}

const handleKeyDown = (e) => { //determine if arrow keys were pressed
    if (state.selected == null) {
        return;
    }
    if ((e.keyCode >= 65 && e.keyCode < 90) || e.keyCode == 8) {
        handleInput(e.keyCode);
        return;
    }
    switch (e.keyCode) {
        case 37:
            moveLeft();
            break;
        case 38:
            moveDown();
            break;
        case 39:
            moveRight();
            break;
        case 40:
            moveUp();
            break;
        default:
            return;
    }
    e.preventDefault();
}

const handleSelect = (i, j) => { //use i = -1 to set selected element to null
    if (state.selected) {
        const {x, y} = state.selected;
        const oldSelected = document.getElementById(`grid-${x}X${y}`);
        oldSelected.classList.remove("selected");
    }
    if (i == -1) {
        state.selected = null;
        return;
    }
    state.selected = {x: i, y: j};
    const {x, y} = state.selected;
    const newSelected = document.getElementById(`grid-${x}X${y}`);
    newSelected.classList.add("selected");
}

const initializeClues = () => {
    const {filledSquares, size} = state;
    let count = 1;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (!filledSquares[i][j]) {
                let answerStart = false;
                if (i == 0 || filledSquares[i - 1][j]) {
                    state.clues.down[count] = `Clue for ${count} down.`;
                    answerStart = true;
                }
                if (j == 0 || filledSquares[i][j - 1]) {
                    state.clues.across[count] = `Clue for ${count} across.`;
                    answerStart = true;
                }
                count += answerStart ? 1 : 0;
            }
        }
    }
}

const handleEdit = (e, dir, i) => {
    e.preventDefault();
    const saveFunction = e => { //NB: variable shadowing with e throughout handleEdit function
        e.preventDefault;
        clueText.innerHTML = `<strong>${i}</strong> ${state.clueEdit[dir][i]}`;
        state.clues[dir][i] = state.clueEdit[dir][i];
        addEditButton(clueText, dir, i);
        delete state.clueEdit[dir][i];
        form.remove();
    }
    const currentClueText = state.clues[dir][i];
    state.clueEdit[dir][i] = state.clues[dir][i];
    const clueText = document.getElementById(`clue-${i}-${dir}`);
    const form = document.createElement("form");
    form.addEventListener("submit", e => e.preventDefault());
    const formInput = document.createElement("input");
    formInput.setAttribute("type", "text");
    formInput.setAttribute("value", currentClueText);
    formInput.addEventListener("keyup", e => {
        if (e.key == "Enter") {
            saveFunction(e);
        }
        state.clueEdit[dir][i] = formInput.value;
    });
    const saveButton = document.createElement("a");
    saveButton.innerHTML = "save";
    saveButton.setAttribute("class", "btn");
    saveButton.addEventListener("click", saveFunction);
    clueText.appendChild(form);
    form.appendChild(formInput);
    form.appendChild(saveButton);
}

const addEditButton = (clueText, dir, i) => {
    const editButton = document.createElement("a");
    editButton.setAttribute("class", "btn");
    editButton.innerHTML = "edit";
    editButton.addEventListener("click", e => handleEdit(e, dir, i));
    clueText.appendChild(editButton);
}

const renderClues = () => {
    const cluesElement = document.getElementById("clues");
    cluesElement.setAttribute("style", "display: default;");
    ["across", "down"].forEach(dir => {
        const dirHeading = document.createElement("h4");
        dirHeading.innerHTML = dir.toUpperCase();
        const rule = document.createElement("hr");
        cluesElement.appendChild(dirHeading);
        cluesElement.appendChild(rule);
        for (let i = 0; i < Object.keys(state.clues.down).length + Object.keys(state.clues.across).length; i++) { //searches for numbered clues in range equal to total answers
            if (i in state.clues[dir]) {
                const clueText = document.createElement("p");
                clueText.setAttribute("id", `clue-${i}-${dir}`);
                clueText.setAttribute("class", "clue-text");
                clueText.innerHTML = `<strong>${i}</strong> ${state.clues[dir][i]}`;
                cluesElement.appendChild(clueText);
                addEditButton(clueText, dir, i);
            }
        }
    })
}

const finalizeBoard = () => {
    for (let i = 0; i < state.size; i++) {
        for (let j = 0; j < state.size; j++) {
            const square = document.getElementById(`grid-${i}X${j}`);
            const newSquare = square.cloneNode(true);
            square.parentNode.replaceChild(newSquare, square);
            if (!newSquare.classList.contains("filled")) {
                const text = document.createElement("div");
                text.setAttribute("id", `text-${i}X${j}`);
                text.setAttribute("class", "text");
                text.addEventListener("input", input => handleTextEdit(text, input));
                text.addEventListener("click", e => {
                    e.stopPropagation();
                    handleSelect(i, j);
                });
                newSquare.appendChild(text);
            }
        }
    }
    initializeClues();
    renderClues();
    window.addEventListener("keydown", handleKeyDown);
    // window.addEventListener("input", input => handleKeyDown(input));
    window.addEventListener("click", () => handleSelect(-1, -1)); //changes selected element to null
    document.getElementById("display-info").setAttribute("style", "display: none;")
}

const renderBoard = () => {
    let cols = "";
    let rows = "";
    for (let i = 0; i < state.size; i++) {
        cols += " auto";
        rows += " auto";
    }
    const puzzle = document.getElementById("puzzle");
    puzzle.innerHTML = "";
    puzzle.setAttribute("style", `display: grid; 
                grid-template-columns:${cols};
                grid-template-rows:${rows};`);

    const SQUARE_LENGTH = 50;
    if (SQUARE_LENGTH * state.size > innerWidth * .8) {
        const puzzleContainer = document.getElementById("puzzle-container");
        puzzleContainer.setAttribute("style", "float: left;")
    }
    for (let i = 0; i < state.size; i++) {
        const row = [];
        for (let j = 0; j < state.size; j++) {
            row.push(false);

            const square = document.createElement("div");
            square.setAttribute("id", `grid-${i}X${j}`);
            square.setAttribute("class", "square");
            square.setAttribute("style", `grid-row: ${i + 1} / ${i + 2};
                                            grid-column: ${j + 1} / ${j + 2};
                                            height: ${SQUARE_LENGTH}px;
                                            width: ${SQUARE_LENGTH}px;`)
            square.addEventListener("click", () => toggleFill(i, j));
            puzzle.appendChild(square);
            const label = document.createElement("div");
            label.setAttribute("id", `label-${i}X${j}`);
            label.setAttribute("class", "label");
            square.appendChild(label);
        }
        state.filledSquares.push(row);
    }
    addIndices();

}

const handleFinalize = e => {
    const {twoWords, threeLetters, undivided, edge} = state.legal;
    e.preventDefault();
    if (twoWords && threeLetters && undivided && edge) { //make sure all conditions are met
        state.phase = phases.EDIT_TEXT;
        const finalize = document.getElementById("finalize");
        finalize.setAttribute("style", "display: none;");
        finalizeBoard();
    }
}

const handleSubmit = e => { //make sure submission is valid or else set error message
    e.preventDefault();
    const sizeInput = document.getElementById("size-input").value;
    if (sizeInput >= 3 && sizeInput <= 55 && sizeInput % 2 == 1) {
        state.phase = phases.EDIT_GRID;
        state.size = sizeInput;
        const form = document.getElementById("form");
        form.setAttribute("style", "display: none;"); //hide form and display finalize button
        const finalize = document.getElementById("finalize");
        finalize.setAttribute("style", "display: default;");
        finalize.addEventListener("click", handleFinalize);
        renderBoard();
    } else {
        const errorMessage = document.getElementById("error-message");
        errorMessage.setAttribute("style", "display: default;")
    }
}

const handleInputChange = () => { //get rid of any error messages once input is changed
    const errorMessage = document.getElementById("error-message");
        errorMessage.setAttribute("style", "display: none;")
}

const initializePage = () => { //add event listeners to form
    const form = document.getElementById("form");
    form.addEventListener("submit", handleSubmit);
    const inputField = document.getElementById("size-input");
    inputField.addEventListener("change", handleInputChange);
}

initializePage();