const phases = {
    INITIALIZED: "INITIALIZED",
    EDIT_GRID: "EDIT_GRID",
    EDIT_TEXT: "EDIT_TEXT"
}

const state = {
    phase: phases.INITIALIZED,
    size: 0,
    legal: true,
    filledSquares: []
}

const addIndices = () => {
    const puzzle = document.getElementById("puzzle");
    let count = 1;
    for (let i = 0; i < state.size; i++) {
        for (let j = 0; j < state.size; j++) {
            const square = document.getElementById(`grid-${i}X${j}`);
            const label = document.getElementById(`label-${i}X${j}`);
            let toLabel = !square.classList.contains("filled");
            if (toLabel && i != 0 && j != 0) {
                const above = document.getElementById(`grid-${i - 1}X${j}`);
                const beside = document.getElementById(`grid-${i}X${j - 1}`);
                toLabel = above.classList.contains("filled") || beside.classList.contains("filled");
            }
            label.innerHTML = toLabel ? count++ : "";
        }
    }
}

const evaluateLegality = () => {
    state.legal = true;
    let foundTwoWordsError = false;
    let foundTwoLettersError = false;
    const {filledSquares} = state;
    const twoWordsError = document.getElementById("two-words-error");
    const twoLettersError = document.getElementById("two-letters-error");
    
    for (let i = 0; i < state.size; i++) {
        for (let j = 1; j <= state.size; j++) {
            if (((j == state.size || filledSquares[i][j]) && (j < 2 || filledSquares[i][j - 2]) && !filledSquares[i][j - 1]) ||
            ((j == state.size || filledSquares[j][i]) && (j < 2 || filledSquares[j - 2][i]) && !filledSquares[j - 1][i])) {
                state.legal = false;
                foundTwoWordsError = true;
                console.log("found two words error with i and j: ", i, j);
                twoWordsError.setAttribute("style", "visibiity: default;");
            }
            if (j >= 2) {
                if (((j == state.size || filledSquares[i][j]) && (j < 3 || filledSquares[i][j - 3]) && !filledSquares[i][j - 1] && !filledSquares[i][j - 2]) ||
                ((j == state.size || filledSquares[j][i]) && (j < 3 || filledSquares[j - 3][i]) && !filledSquares[j - 1][i] && !filledSquares[j - 2][i])) {
                    state.legal = false;
                    console.log("filledSquares[i]:", filledSquares[i]);
                    console.log("found two letters error with i and j: ", i, j);
                    foundTwoLettersError = true;
                    twoLettersError.setAttribute("style", "visibility: default;");
                }
            }
            if (foundTwoLettersError && foundTwoWordsError) {
                return;
            }
        } 
    }
}

const toggleFill = (i, j) => {
    const {filledSquares, size} = state;
    const twoWordsError = document.getElementById("two-words-error");
    const twoLettersError = document.getElementById("two-letters-error");
    [twoWordsError, twoLettersError].forEach(el => el.setAttribute("style", "visibility: hidden;"));
    const el1 = document.getElementById(`grid-${i}X${j}`);
    const el2 = document.getElementById(`grid-${size - i - 1}X${size - j - 1}`);
    const els = [el1, el2];
    const isFilled = filledSquares[i][j]
    els.forEach(el => {
        if (!isFilled) {
            el.classList.add("filled");
            filledSquares[i][j] = true;
            filledSquares[size - i - 1][size - j - 1] = true;
        } else {
            el.classList.remove("filled");
            filledSquares[i][j] = false;
            filledSquares[size - i - 1][size - j - 1] = false;
        }
    });
    addIndices();
    evaluateLegality();
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
                text.setAttribute("contenteditable", "true");
                text.setAttribute("class", "text");
                newSquare.appendChild(text);
            }
        }
    }
}

const renderBoard = () => {
    let cols = "";
    let rows = "";
    for (let i = 0; i < state.size; i++) {
        cols += " auto";
        rows += "auto";
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
    e.preventDefault();
    if (state.legal) {
        state.phase = phases.EDIT_TEXT;
        const finalize = document.getElementById("finalize");
        finalize.setAttribute("style", "display: none;");
        finalizeBoard();
    }
}

const handleSubmit = e => {
    e.preventDefault();
    const sizeInput = document.getElementById("size-input").value;
    if (sizeInput >= 3 && sizeInput <= 55 && sizeInput % 2 == 1) {
        state.phase = phases.EDIT_GRID;
        state.size = sizeInput;
        const form = document.getElementById("form");
        form.setAttribute("style", "display: none;");
        const finalize = document.getElementById("finalize");
        finalize.setAttribute("style", "display: default;");
        finalize.addEventListener("click", handleFinalize);
        renderBoard();
    } else {
        const errorMessage = document.getElementById("error-message");
        errorMessage.setAttribute("style", "display: default;")
    }
}

const handleInputChange = () => {
    const errorMessage = document.getElementById("error-message");
        errorMessage.setAttribute("style", "display: none;")
}

const initializePage = () => {
    const form = document.getElementById("form");
    form.addEventListener("submit", handleSubmit);
    const inputField = document.getElementById("size-input");
    inputField.addEventListener("change", handleInputChange);
}

initializePage();