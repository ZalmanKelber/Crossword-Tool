const renderInitial = (() => {

    const DEFAULT_SQUARE_LENGTH = 50;
    const LETTER_WIDTH = 563;
    let scale = 1; //variable can be assigned and accessed by other renderInitial functions
    
    const initializePage = () => {
        const form = document.getElementById("form");
        form.addEventListener("submit", renderHelperFunctions.handleSubmit); //checks if number is valid, then calls phase change action
        const inputField = document.getElementById("size-input");
        inputField.addEventListener("change", renderHelperFunctions.handleInputChange); //removes error message
    };

    const renderPuzzle = length => {
        const puzzle = document.getElementById("puzzle");
        puzzle.innerHTML = ""; //clear puzzle div and set up css grid
        puzzle.setAttribute("style", `display: grid; 
                    grid-template-columns: repeat(${length}, auto);
                    grid-template-rows: repeat(${length}, auto);`);
        const squareLength = Math.min(LETTER_WIDTH / length, DEFAULT_SQUARE_LENGTH);
        scale = squareLength / DEFAULT_SQUARE_LENGTH;
        if (squareLength * length > LETTER_WIDTH) { //if puzzle is larger than window, we don't want to center it
            const puzzleContainer = document.getElementById("puzzle-container");
            puzzleContainer.setAttribute("style", `float: left; 
                    margin-left: 10vw;`)
        }
        for (let i = 0; i < length; i++) {
            for (let j = 0; j < length; j++) {
                const square = document.createElement("div");
                square.setAttribute("id", `grid-${i}X${j}`);
                square.setAttribute("class", "square");
                square.setAttribute("style", `grid-row: ${i + 1} / ${i + 2};
                                                grid-column: ${j + 1} / ${j + 2};
                                                height: ${squareLength}px;
                                                width: ${squareLength}px;`)
                square.addEventListener("click", () => actions.toggleSquare(i, j)); //add event listener to each square to toggle it when clicked
                puzzle.appendChild(square);
                const label = document.createElement("div");
                label.setAttribute("id", `label-${i}X${j}`); //label divs will be used for numerical clue indexes on puzzle
                label.setAttribute("class", "label");
                label.setAttribute("style", `font-size: ${1.2 * Math.max(.5, scale)}rem;`)
                square.appendChild(label);
            }
        }
    };

    const renderEditGridPhase = () => { //hide original form and display the finalize button
        const form = document.getElementById("form");
        form.setAttribute("style", "display: none;"); 
        const finalize = document.getElementById("finalize");
        finalize.setAttribute("style", "display: default;");
        finalize.addEventListener("click", actions.changeToEditText); //checks to make sure puzzle is legal before changing
    };

    const renderEditTextPhase = () => {
        window.addEventListener("keydown", e => {
            actions.handleKeyDown(e);
        });
        window.addEventListener("click", () => actions.changeSelected({ xPrime: -1, yPrime: -1 })); //changes selected element to null
        document.getElementById("display-info").setAttribute("style", "display: none;"); //removes error messages from previous phase
        const pdfButton = document.getElementById("pdf-button");
        pdfButton.setAttribute("style", "display: default;")
        pdfButton.addEventListener("click", e => {
            e.preventDefault();
            actions.generatePdf();
        });
        document.getElementById("by").setAttribute("style", "display: default;");
        const author = document.getElementById("author");
        const title = document.getElementById("title");
        [author, title].forEach(el => renderHelperFunctions.addSimpleEditButton(el));
    };

    const renderFinalPuzzle = length => {
        for (let i = 0; i < length; i++) {
            for (let j = 0; j < length; j++) {
                const square = document.getElementById(`grid-${i}X${j}`);
                const newSquare = square.cloneNode(true);
                square.parentNode.replaceChild(newSquare, square); //replace each square with a clone in order to clear event listeners
                if (!newSquare.classList.contains("filled")) {
                    const invisibleTextarea = document.createElement("textarea");
                    invisibleTextarea.setAttribute("id", `invisible-${i}X${j}`);
                    invisibleTextarea.setAttribute("style", "display: none;");
                    newSquare.appendChild(invisibleTextarea);
                    const text = document.createElement("div");
                    text.setAttribute("id", `text-${i}X${j}`); //text div will display letters entered
                    text.setAttribute("class", "text");
                    text.setAttribute("style", `font-size: ${30 * scale}px; height: ${50 * scale}px;`);
                    text.addEventListener("click", e => {
                        e.stopPropagation();
                        actions.handleClick({ xPrime: i, yPrime: j });
                        invisibleTextarea.focus();
                    });
                    newSquare.appendChild(text);
                }
            }
        }
    };

    const renderClues = (clues, maxClueNum) => {
        const cluesElement = document.getElementById("clues");
        cluesElement.setAttribute("style", "display: default;");
        ["across", "down"].forEach(dir => {
            const dirElement = document.getElementById(dir);
            const dirHeading = document.createElement("h4");
            dirHeading.innerHTML = dir.toUpperCase();
            dirElement.appendChild(dirHeading);
            for (let i = 1; i < maxClueNum; i++) { //searches for numbered clues
                if (i in clues[dir]) {
                    const clueText = document.createElement("p");
                    clueText.setAttribute("id", `clue-${i}-${dir}`);
                    clueText.setAttribute("class", "clue-text");
                    clueText.innerHTML = `<strong>${i}</strong> ${clues[dir][i]}`;
                    dirElement.appendChild(clueText);
                    renderHelperFunctions.addEditButton(clueText, dir, i);
                }
            }
        });
    };

    return { initializePage, renderPuzzle, renderEditGridPhase, renderEditTextPhase, renderFinalPuzzle, renderClues };

})();