const renderUpdate = (() => {

    const renderViolations = ({ twoWords, threeLetters, connected, noEdges }) => {
        document.getElementById("two-words-error")
            .setAttribute("style", `visibility: ${twoWords ? "hidden" : "default"};`);
        document.getElementById("two-letters-error")
            .setAttribute("style", `visibility: ${threeLetters ? "hidden" : "default"};`);
        document.getElementById("divided-error")
            .setAttribute("style", `visibility: ${connected ? "hidden" : "default"};`);
        document.getElementById("edge-filled-error")
            .setAttribute("style", `visibility: ${noEdges ? "hidden" : "default"};`);
        };

    const toggleFill = (i, j, toFill, length) => {
        const el1 = document.getElementById(`grid-${i}X${j}`);
        const el2 = document.getElementById(`grid-${length - i - 1}X${length - j - 1}`);
        [el1, el2].forEach(el => {
            if (toFill) {
                el.classList.add("filled");
            } else {
                el.classList.remove("filled");
            }
        });
    };

    const addIndices = length => {
        let count = 1;
        for (let i = 0; i < length; i++) {
            for (let j = 0; j < length; j++) {
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
    };

    const renderSelected = (oldWord, newWord, { xPrime, yPrime }) => {
        oldWord.forEach(([i, j]) => {
            const square = document.getElementById(`grid-${i}X${j}`);
            square.classList.remove("selected-letter");
            square.classList.remove("selected-word");
        });
        newWord.forEach(([i, j]) => {
            const square = document.getElementById(`grid-${i}X${j}`);
            const selectedClass = (i === xPrime && j === yPrime) ? "selected-letter" : "selected-word";
            square.classList.add(selectedClass);
        });
    };

    const updateValue = (i, j, val) => {
        const squareText = document.getElementById(`text-${i}X${j}`);
        squareText.innerHTML = val;
    };

    const renderClue = (dir, i, newClue) => {
        const clueText = document.getElementById(`clue-${i}-${dir}`);
        clueText.innerHTML = `<strong>${i}</strong> ${newClue}`;
        renderHelperFunctions.addEditButton(clueText, dir, i);
    };

    return { renderViolations, toggleFill, addIndices, renderSelected, updateValue, renderClue };

})();