const renderInitial = (() => {

    const SQUARE_LENGTH = 50;
    
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

        if (SQUARE_LENGTH * length > window.innerWidth * .8) { //if puzzle is larger than window, we don't want to center it
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
                                                height: ${SQUARE_LENGTH}px;
                                                width: ${SQUARE_LENGTH}px;`)
                square.addEventListener("click", () => actions.toggleSquare(i, j)); //add event listener to each square to toggle it when clicked
                puzzle.appendChild(square);
                const label = document.createElement("div");
                label.setAttribute("id", `label-${i}X${j}`); //label divs will be used for numerical clue indexes on puzzle
                label.setAttribute("class", "label");
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
    };

    const renderFinalPuzzle = length => {
        for (let i = 0; i < length; i++) {
            for (let j = 0; j < length; j++) {
                const square = document.getElementById(`grid-${i}X${j}`);
                const newSquare = square.cloneNode(true);
                square.parentNode.replaceChild(newSquare, square); //replace each square with a clone in order to clear event listeners
                if (!newSquare.classList.contains("filled")) {
                    const text = document.createElement("div");
                    text.setAttribute("id", `text-${i}X${j}`); //text div will display letters entered
                    text.setAttribute("class", "text");
                    text.addEventListener("click", e => {
                        e.stopPropagation();
                        actions.handleClick({ xPrime: i, yPrime: j });
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
            const dirHeading = document.createElement("h4");
            dirHeading.innerHTML = dir.toUpperCase();
            const rule = document.createElement("hr");
            cluesElement.appendChild(dirHeading);
            cluesElement.appendChild(rule);
            for (let i = 1; i < maxClueNum; i++) { //searches for numbered clues
                if (i in clues[dir]) {
                    const clueText = document.createElement("p");
                    clueText.setAttribute("id", `clue-${i}-${dir}`);
                    clueText.setAttribute("class", "clue-text");
                    clueText.innerHTML = `<strong>${i}</strong> ${clues[dir][i]}`;
                    cluesElement.appendChild(clueText);
                    renderHelperFunctions.addEditButton(clueText, dir, i);
                }
            }
        });
    };

    return { initializePage, renderPuzzle, renderEditGridPhase, renderEditTextPhase, renderFinalPuzzle, renderClues };

})();