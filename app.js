const addIndices = size => {
    const puzzle = document.getElementById("puzzle");
    let count = 1;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
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

const toggleFill = (i, j, size) => {
    const el1 = document.getElementById(`grid-${i}X${j}`);
    const el2 = document.getElementById(`grid-${size - i - 1}X${size - j - 1}`);
    const isFilled = el1.classList.contains("filled");
    [el1, el2].forEach(el => {
        if (!isFilled) {
            el.classList.add("filled");
        } else {
            el.classList.remove("filled");
        }
    });
    addIndices(size);
}

const finalizeBoard = size => {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const square = document.getElementById(`grid-${i}X${j}`);
            square.addEventListener("click", e => e.preventDefault());
            if (!square.classList.contains("filled")) {
                const text = document.getElementById(`text-${i}X${j}`);
                text.setAttribute("contenteditable", "true");
            }
        }
    }
}

const renderBoard = () => {
    const size = window.prompt("Enter board size");
    let cols = "";
    let rows = "";
    for (let i = 0; i < size; i++) {
        cols += " auto";
        rows += "auto";
    }
    const puzzle = document.getElementById("puzzle");
    puzzle.innerHTML = "";
    puzzle.setAttribute("style", `display: grid; 
                grid-template-columns:${cols};
                grid-template-rows:${rows};`);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const square = document.createElement("div");
            square.setAttribute("id", `grid-${i}X${j}`);
            square.setAttribute("class", "square");
            square.setAttribute("style", `grid-row: ${i + 1} / ${i + 2};
                                            grid-column: ${j + 1} / ${j + 2}`)
            square.addEventListener("click", () => toggleFill(i, j, size));
            puzzle.appendChild(square);
            const label = document.createElement("div");
            label.setAttribute("id", `label-${i}X${j}`);
            label.setAttribute("class", "label");
            square.appendChild(label);
            const text = document.createElement("div");
            text.setAttribute("id", `text-${i}X${j}`);
            text.setAttribute("class", "letter");
            text.innerHTML = " ";
            square.appendChild(text);
        }
    }
    addIndices(size);
    const btn2 = document.getElementById("finalize");
    btn2.addEventListener("click", () => finalizeBoard(size));
}

const btn1 = document.getElementById("btn");
btn1.addEventListener("click", renderBoard);