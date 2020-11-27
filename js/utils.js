//"enum"-like objects for use in state object
const phases = { INITIALIZED, EDIT_GRID, EDIT_TEXT };
const orientations = { HORIZONTAL, VERTICAL };
const squareStates = { EMPTY, FILLED, LETTER };
const arrowDirections = { LEFT, UP, DOWN, RIGHT };

//util functions, which do not reference the DOM or state

const utils = () => {

    const findFirstUnfilled = puzzle => {
        for (let i = 0; i < puzzle.length; i++) {
            for (let j = 0; j < puzzle.length; j++) {
                if (puzzle[i][j] != squareStates.FILLED) {
                    return [i, j];
                }
            }
        }
    }

    const checkTwoWords = puzzle => {
        for (let i = 0; i < puzzle.length; i++) { //iterate through each row and column to search for pattern filled/edge -> empty -> filled/edge
            for (let j = 1; j <= puzzle.length; j++) { //for each row or column, we iterate from the second square to the first "square" beyond the puzzle
                //check row first
                if ((j === puzzle.length || puzzle[i][j] === squareStates.FILLED) && (j < 2 || puzzle[i][j - 2] === squareStates.FILLED) && puzzle[i][j - 1] !== squareStates.FILLED) {
                    return false;
                } 
                //check column
                if ((j === puzzle.length || puzzle[j][i]) === squareStates.FILLED && (j < 2 || puzzle[j - 2][i]) === squareStates.FILLED && puzzle[j - 1][i] !== squareStates.FILLED) { 
                    return false;
                }
            }
        }
        return true;
    };

    const checkThreeLetters = puzzle => {
        for (let i = 0; i < puzzle.length; i++) { //iterate through each row and column to search for pattern filled/edge -> empty -> empty -> filled/edge
            for (let j = 2; j <= puzzle.length; j++) { //for each row or column, we iterate from the third square to the first "square" beyond the puzzle
                //check row first
                if ((j === puzzle.length || puzzle[i][j] === squareStates.FILLED) && (j < 3 || puzzle[i][j - 3] === squareStates.FILLED) 
                            && puzzle[i][j - 1] !== squareStates.FILLED && puzzle[i][j - 2] !== squareStates.FILLED) {
                    return false;
                } 
                //check column
                if ((j === puzzle.length || puzzle[j][i]) === squareStates.FILLED && (j < 3 || puzzle[j - 3][i]) === squareStates.FILLED 
                            && puzzle[j - 1][i] !== squareStates.FILLED && puzzle[j - 2][i] !== squareStates.FILLED) { 
                    return false;
                }
            }
        }
        return true;
    };

    const checkConnected = (puzzle, totalFilled) => {
        const [i, j] = findFirstUnfilled(puzzle); //locate the first empty square, in order to begin search
        const found = new Set();
        found.add(i + "X" + j);
        const stack = [[i, j]];
        let count = 1;
        while (stack.length > 0) { //run a DFS
            const [x, y] = stack.pop();
            [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dx, dy]) => { //check all adjacent squares to see if they're within the grid, unfilled and not yet found
                const [xPrime, yPrime] = [x + dx, y + dy];
                if (xPrime >= 0 && xPrime < puzzle.length && yPrime >= 0 && yPrime < puzzle.length && !found.has(xPrime + "X" + yPrime) 
                        && puzzle[xPrime][yPrime] != squareStates.FILLED) {
                    count++;
                    found.add(xPrime + "X" + yPrime);
                    stack.push([xPrime, yPrime]);
                }
            });
        }
        return puzzle.length**2 - totalFilled === count; //determine if the number of squares found equals the total number of empty squares
    };

    const checkNoEdges = puzzle => { //because puzzle is symmetrical, we only have to check top row and leftmost column
        return puzzle.every(row => row[0] === squareStates.FILLED) || puzzle[0].every(cell => cell === squareStates.FILLED);
    };

    //if wasEmpty is true, then we find the next empty square.  Otherwise, find the next non-filled square
    //x and y are the previous selected square
    const findNextSelected = (wasEmpty, puzzle, { x, y }, orientation) => {  
        if (x === length - 1 && y === length - 1) { return { x, y }}; //if we are at the end of the board; no need to change anything
        if (orientation === orientations.HORIZONTAL) {
            const startRow = y === puzzle.length - 1 ? x + 1 : x;
            const startCol = y === puzzle.length - 1 ? 0 : y + 1;
            for (let i = startRow; i < puzzle.length; i++) {
                for (let j = i === startRow ? startCol : 0; j < puzzle.length; j++) {
                    const squareVal = puzzle[i][j];
                    if (squareVal === squareStates.EMPTY || (squareVal === squareStates.LETTER && !wasEmpty)) {
                        return {x: i, y: j};
                    }
                }
            }
        } else {
            const startCol = x === puzzle.length - 1 ? y + 1 : y;
            const startRow = x === puzzle.length - 1 ? 0 : x + 1;
            for (let i = startCol; i < puzzle.length; i++) {
                for (let j = i === startCol ? startRow : 0; j < puzzle.length; j++) {
                    const squareVal = puzzle[j][i];
                    if (squareVal === squareStates.EMPTY || (squareVal === squareStates.LETTER && !wasEmpty)) {
                        return {x: j, y: i};
                    }
                }
            }
        }
        return { x, y };
    }

    const findPrevSelected = (wasEmpty, puzzle, { x, y }, orientation) => {  
        if (x === 0 && y === 0) { return { x, y }}; //if we are at the beginning of the board; no need to change anything
        if (orientation === orientations.HORIZONTAL) {
            const startRow = y === 0 ? x - 1 : x;
            const startCol = y === 0 ? puzzle.length - 1 : y - 1;
            for (let i = startRow; i >= 0; i--) {
                for (let j = i === startRow ? startCol : puzzle.length - 1; j >= 0; j--) {
                    const squareVal = puzzle[i][j];
                    if (squareVal === squareStates.EMPTY || (squareVal === squareStates.LETTER && !wasEmpty)) {
                        return {x: i, y: j};
                    }
                }
            }
        } else {
            const startCol = x === 0 ? y - 1 : y;
            const startRow = x === 0 ? puzzle.length - 1 : x - 1;
            for (let i = startCol; i >= 0; i--) {
                for (let j = i === startCol ? startRow : puzzle.length - 1; j >= 0; j--) {
                    const squareVal = puzzle[j][i];
                    if (squareVal === squareStates.EMPTY || (squareVal === squareStates.LETTER && !wasEmpty)) {
                        return {x: j, y: i};
                    }
                }
            }
        }
        return { x, y };
    }

    return { checkTwoWords, checkThreeLetters, checkConnected, checkNoEdges, findNextSelected, findPrevSelected };
}