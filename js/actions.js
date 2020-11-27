//in global scope from previous script tags: 
//    phases, orientation, squareStates and arrowDirections "enum" objects; 
//    utils functions
//    renderUpdate functions

const actions = () => {

    const state = () => {
        //state variables:
        let phase = phases.INITIALIZED;
        const legal = { 
            twoWords: true,
            threeLetters: true,
            connected: true,
            noEdges: true
        };
        let puzzle = [];
        let totalFilled = 0;
        let totalLetters = 0;
        const clues = { across: {}, down: {} };
        let orientation = orientations.HORIZONTAL;
        const selected =  {x: -1, y: -1 };

        //getters and setters
        const getPhase = () => phase;
        const setPhase = newPhase => phase = newPhase;

        const isLegal = () => legal.twoWords && legal.threeLetters && legal.connected && legal.noEdges;
        const getLegal = () => {
            return { twoWords: legal.twoWords, twoLetters: legal.threeLetters, connected: legal.connected, noEdges: legal.noEdges };
        };
        const setTwoWords = newTwoWords => legal.twoWords = newTwoWords;
        const setThreeLetters = newThreeLetters => legal.threeLetters = newThreeLetters;
        const setConnected = newConnected => legal.connected = newConnected;
        const setNoEdges = newNoEdges => legal.noEdges = newNoEdges;

        const getPuzzle = () => puzzle.map(row => [ ...row]); //returns deep copy of puzzle
        const getPuzzleSquare = (i, j) => puzzle[i][j];
        const getLength = () => puzzle.length; //retrieve puzzle length without copying entire puzzle
        const setPuzzle = newPuzzle => puzzle = newPuzzle;
        const setPuzzleSquare = (i, j, val) => puzzle[i][j] = val;

        const getTotalFilled = () => totalFilled;
        const incrementTotalFilled = val => totalFilled += val;

        const getTotalLetters = () => totalLetters;
        const incrementTotalLetters = val => TotalLetters += val;

        const getClues = () => {
            return { across: Object.assign(clues.across, {}), down: Object.assign(clues.down, {}) }; //returns deep copy of clues
        };
        const getOneClue = (dir, i) => clues[dir][i];
        const setClues = newClues => clues = newClues;
        const setOneClue = (dir, i, newClue) => clues[dir][i] = newClue;

        const getOrientation = () => orientation;
        const setOrientation = newOrientation => orientation = newOrientation;

        const getSelected = () => {
            return {x: selected.x, y: selected.y };
        };
        const setSelected = (newX, newY) => {
            selected.x = newX;
            selected.y = newY;
        };

        //make getters and setters available as methods of state "object"
        return { 
            getPhase, setPhase, isLegal, getLegal, setTwoWords, setThreeLetters, setConnected, setNoEdges, 
            getPuzzle, getPuzzleSquare, setPuzzle, setPuzzleSquare, getLength, getTotalFilled, incrementTotalFilled, 
            getTotalLetters, incrementTotalLetters, getClues, getOneClue, setClues, setOneClue, 
            getOrientation, setOrientation, getSelected, setSelected
        }
    }

    //actions retrieve and modify state and then call appropriate render functions
    const checkViolations = () => {
        const puzzleCopy = state.getPuzzle();
        state.setTwoWords(utils.checkTwoWords(puzzleCopy));
        state.setThreeLetters(utils.checkThreeLetters(puzzleCopy));
        state.setConnected(utils.checkConnected(puzzleCopy, state.getTotalFilled()));
        state.setNoEdges(utils.checkNoEdges(puzzleCopy));
        //renderUpdate.renderViolations(state.getLegal());
    };

    const toggleSquare = (i, j) => {
        const puzzleCopy = state.getPuzzle();
        const currentState = state.getPuzzleSquare(i, j);
        const newState = currentState === squareStates.FILLED ? squareStates.EMPTY : squareStates.FILLED;
        const toFill = newState === squareStates.FILLED ? true : false;
        const isMiddle = i === Math.floor(puzzleCopy.length / 2) && j === Math.floor(puzzleCopy.length / 2);
        const incrementAmount = (isMiddle ? 1 : 2) * (toFill ? 1 : -1);
        state.incrementTotalFilled(incrementAmount);
        state.setPuzzleSquare(i, j, newState);
        state.setPuzzleSquare(puzzleCopy.length - i - 1, puzzleCopy.length - j - 1, newState);
        //now that puzzle is updated, check for violations and re-render 
        checkViolations();
        //renderUpdate.toggleFill(i, j, toFill); //use input indices so as to avoid rerendering every puzzle square 
        //renderUpdate.addIndices(puzzleCopy);
    };

    const addLetter = val => { //note that state does not store the actual value of the letter
        const { x: i, y: j } = state.getSelected();
        const puzzleCopy = state.getPuzzle();
        const wasEmpty = puzzleCopy[i][j] === squareStates.EMPTY;
        state.setPuzzleSquare(i, j, val === null ? squareStates.EMPTY : squareStates.LETTER);
        //now that we've updated the square, if we've added a letter, move to the next empty square
        const nextSelected = findNextSelected(wasEmpty, puzzle, {x: i, y: j}, state.getOrientation()); 
        changeSelected(nextSelected); //will trigger re-render
        //render the letter in the appropriate square
        renderUpdate.updateValue(i, j, val);
    }
}