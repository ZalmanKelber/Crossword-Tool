//in global scope from previous script tags: 
//    phases, orientation, squareStates and arrowDirections "enum" objects; 
//    utils functions
//    renderUpdate functions

const actions = (() => {

    const state = (() => {
        //state variables:
        let phase = phases.INITIALIZED; //keeps track of which phase of the editing process the user is in
        const legal = {                 //keeps track of which rules the edited crossword is currently violating
            twoWords: true,
            threeLetters: true,
            connected: true,
            noEdges: true
        };
        let puzzle = [];                 //keeps track of whether a given square of the puzzle is filled in, empty or has a letter written in
        let totalFilled = 0;             //keeps track of the number of filled squares
        let totalLetters = 0;            //keeps track of the number of letters entered into squares
        const clues = { across: {}, down: {} };       //keeps track of the current clues, as edited by the user
        let orientation = orientations.HORIZONTAL;    //keeps track of whether or not the selected word is horizontal or vertical
        const selected =  {x: -1, y: -1 };            //keeps track of which square is currently selected

        //getters and setters
        const getPhase = () => phase;
        const setPhase = newPhase => phase = newPhase;

        const isLegal = () => legal.twoWords && legal.threeLetters && legal.connected && legal.noEdges;
        const getLegal = () => {
            return { twoWords: legal.twoWords, threeLetters: legal.threeLetters, connected: legal.connected, noEdges: legal.noEdges };
        };
        const setTwoWords = newTwoWords => legal.twoWords = newTwoWords;
        const setThreeLetters = newThreeLetters => legal.threeLetters = newThreeLetters;
        const setConnected = newConnected => legal.connected = newConnected;
        const setNoEdges = newNoEdges => legal.noEdges = newNoEdges;

        const getPuzzle = () => puzzle.map(row => [ ...row]); //returns deep copy of puzzle
        const getLength = () => puzzle.length; //retrieve puzzle length without copying entire puzzle
        const setPuzzle = newPuzzle => { //we can only set the puzzle in the first phase (otherwise we can set individual squares)
            if (phase === phases.INITIALIZED) { puzzle = newPuzzle } 
        };
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
        const setSelected = ({ xPrime, yPrime} ) => {
            selected.x = xPrime;
            selected.y = yPrime;
        };

        //make getters and setters available as methods of state "object"
        return { 
            getPhase, setPhase, isLegal, getLegal, setTwoWords, setThreeLetters, setConnected, setNoEdges, 
            getPuzzle, setPuzzle, setPuzzleSquare, getLength, getTotalFilled, incrementTotalFilled, 
            getTotalLetters, incrementTotalLetters, getClues, getOneClue, setClues, setOneClue, 
            getOrientation, setOrientation, getSelected, setSelected
        }
    })();

    //actions retrieve and modify state and then call appropriate render functions
    //checks the puzzle for each of the four possible violations after new squares are filled in or un-filled in
    const checkViolations = () => {
        const puzzleCopy = state.getPuzzle();
        state.setTwoWords(utils.checkTwoWords(puzzleCopy));
        state.setThreeLetters(utils.checkThreeLetters(puzzleCopy));
        state.setConnected(utils.checkConnected(puzzleCopy, state.getTotalFilled()));
        state.setNoEdges(utils.checkNoEdges(puzzleCopy));
        renderUpdate.renderViolations(state.getLegal());
    };

    //fills in or un-fills in a square and its mirror on the puzzle, and then calls the checkViolations action
    const toggleSquare = (i, j) => {
        const puzzleCopy = state.getPuzzle();
        const currentState = puzzleCopy[i][j];
        const newState = currentState === squareStates.FILLED ? squareStates.EMPTY : squareStates.FILLED;
        const toFill = newState === squareStates.FILLED ? true : false;
        const isMiddle = i === Math.floor(puzzleCopy.length / 2) && j === Math.floor(puzzleCopy.length / 2);
        const incrementAmount = (isMiddle ? 1 : 2) * (toFill ? 1 : -1);
        state.incrementTotalFilled(incrementAmount);
        state.setPuzzleSquare(i, j, newState);
        state.setPuzzleSquare(puzzleCopy.length - i - 1, puzzleCopy.length - j - 1, newState);
        //now that puzzle is updated, check for violations and re-render 
        checkViolations(); //will call renderViolations
        renderUpdate.toggleFill(i, j, toFill, puzzleCopy.length); //use input indices so as to avoid rerendering every puzzle square 
        renderUpdate.addIndices(puzzleCopy.length);
    };

    //selects a square, or selects no square.  If the selected square is already selected, the orientation is toggled between horizontal and vertical
    const changeSelected = ({ xPrime, yPrime }) => {
        const { x, y } = state.getSelected();
        const puzzleCopy = state.getPuzzle();
        const currentOrientation = state.getOrientation();
        const oldWord = x === -1 ? [] : utils.getWord(puzzleCopy, { x, y }, currentOrientation);
        const newWord = xPrime === -1 ? [] : utils.getWord(puzzleCopy, { x: xPrime, y: yPrime }, currentOrientation);
        state.setSelected({ xPrime, yPrime });
        //now that we've updated state, clear the old word and add the new word in the view
        renderUpdate.renderSelected(oldWord, newWord, { xPrime, yPrime });
    };

    //changes the selected word from horizontal to vertical or vice versa while keeping the same selected square
    const changeOrientation = () => {
        const currentOrientation = state.getOrientation();
        const puzzleCopy = state.getPuzzle();
        const selected = state.getSelected(); //NB: function should only be called when a square is selected
        const oldWord = utils.getWord(puzzleCopy, selected, currentOrientation);
        const newOrientation = currentOrientation === orientations.HORIZONTAL ? orientations.VERTICAL : orientations.HORIZONTAL;
        const newWord = utils.getWord(puzzleCopy, selected, newOrientation);
        state.setOrientation(newOrientation);
        //now that we've updated state, clear the old word and add the new word in the view
        renderUpdate.renderSelected(oldWord, newWord, { xPrime: selected.x, yPrime: selected.y });
    };

    //adds a letter to the puzzle and then selects the next blank square
    const addLetter = val => { //note that state does not store the actual value of the letter
        const { x: i, y: j } = state.getSelected();
        const puzzleCopy = state.getPuzzle();
        const wasEmpty = puzzleCopy[i][j] === squareStates.EMPTY;
        state.setPuzzleSquare(i, j, val === null ? squareStates.EMPTY : squareStates.LETTER);
        //now that we've updated the square, if we've added a letter, move to the next empty square
        const nextSelected = utils.findNextSelected(wasEmpty, puzzle, {x: i, y: j}, state.getOrientation()); 
        changeSelected(nextSelected); //will trigger re-render
        //render the letter in the appropriate square
        renderUpdate.updateValue(i, j, val ? val : "");
    };

    //selects the clicked square (x and y are provided by the DOM event listener functions)
    const handleClick = ({ xPrime, yPrime }) => { //if we click on a square that has already been selected, change the orientation
        const { x, y } = state.getSelected();
        if (x === xPrime && y === yPrime) { changeOrientation(); }
        else { changeSelected({ xPrime, yPrime }); };
    }

    //arrows either change the orientation between horixontal and vertical or change the selected 
    //square to the next available square in the specified direction
    const handleArrow = keyCode => { //37 - 40: left, up, right, down;  //change orientation or move selected square
        const puzzleCopy = state.getPuzzle();
        const { x, y } = state.getSelected(); //NB: function should only be called when a square is selected
        const orientation = state.getOrientation();
        const wasEmpty = puzzleCopy[x][y] === squareStates.EMPTY;
        switch (keyCode) {
            case 37:
                if (orientation === orientations.HORIZONTAL) {
                    const nextSelected = utils.findPrevSelected(wasEmpty, puzzle, {x , y }, orientation);
                    changeSelected(nextSelected);
                } else { changeOrientation() };
                break;
            case 38:
                if (orientation === orientations.VERTICAL) {
                    const nextSelected = utils.findPrevSelected(wasEmpty, puzzle, {x , y }, orientation);
                    changeSelected(nextSelected);
                } else { changeOrientation() };
                break;
            case 39:
                if (orientation === orientations.HORIZONTAL) {
                    const nextSelected = utils.findNextSelected(wasEmpty, puzzle, {x , y }, orientation);
                    changeSelected(nextSelected);
                } else { changeOrientation() };
                break;
            case 40:
                if (orientation === orientations.VERTICAL) {
                    const nextSelected = utils.findNextSelected(wasEmpty, puzzle, {x , y }, orientation);
                    changeSelected(nextSelected);
                } else { changeOrientation() };
                break;
        }
    };

    //determines whether or not letters or arrow keys should call on their respective functions
    const handleKeyDown = e => { //determine if arrow keys were pressed
        if (state.getSelected().x === -1) {
            return;
        }
        e.preventDefault();
        if (e.keyCode >= 65 && e.keyCode < 90) {
            addLetter(String.fromCharCode(e.keyCode));
            return;
        }
        if (e.key === "Backspace" || e.keyCode === 8) {
            addLetter(null);
            return;
        }
        if (e.keyCode >= 37 && e.keyCode < 41) {
            handleArrow(e.keyCode);
        }
    };

    //creates default clues for a puzzle once all specified squares have been filled in
    const initializeClues = () => {
        const puzzleCopy = state.getPuzzle();
        let count = 1;
        for (let i = 0; i < puzzle.length; i++) {
            for (let j = 0; j < puzzle.length; j++) {
                if (puzzleCopy[i][j] !== squareStates.FILLED) {
                    let answerStart = false;
                    if (i === 0 || puzzleCopy[i - 1][j] === squareStates.FILLED) {
                        state.setOneClue("down", count, `Clue for ${count}-DOWN`);
                        answerStart = true;
                    }
                    if (j == 0 || puzzleCopy[i][j - 1] === squareStates.FILLED) {
                        state.setOneClue("across", count, `Clue for ${count}-ACROSS`);
                        answerStart = true;
                    }
                    count += answerStart ? 1 : 0;
                }
            }
        }
        //now that we've updated state, retrieve all clues from state (NB: this only works because state functions are synchronous)
        const initialClues = state.getClues();
        renderInitial.renderClues(initialClues, count); //render function requires count variable in order to iterate through clues
    };

    //saves an edited clue
    const saveClue = (dir, i, newClue) => {
        state.setOneClue(dir, i, newClue);
        renderUpdate.renderOneClue(dir, i, newClue);
    };

    //initializes a puzzle based on the user-specified length
    const initializePuzzle = length => {
        state.setPuzzle(utils.initializePuzzle(length));
        renderInitial.renderPuzzle(length);
        renderUpdate.addIndices(length);
    };

    //called when the user enters in the length of the puzzle to be edited
    //creates puzzle and adds appropriate event listeners for next phase
    const changeToEditGrid = length => {
        initializePuzzle(length); //updates state and calls renderInitial.renderPuzzle
        state.setPhase(phases.EDIT_GRID);
        renderInitial.renderEditGridPhase();
    };

    //called once a puzzle is finalized.  renders puzzle, initalizes clues and adds appropriate event listeners
    const changeToEditText = () => {
        if (state.isLegal()) {
            initializeClues(); //updates state and calls renderInitial.renderClues
            state.setPhase(phases.EDIT_TEXT);
            renderInitial.renderFinalPuzzle(state.getLength());
            renderInitial.renderEditTextPhase();
        }
    };

    //calls the generatePdf function
    const generatePdf = () => {
        pdf.generatePdf(state.getPuzzle(), state.getClues());
    };

    return {
        checkViolations, toggleSquare, changeSelected, changeOrientation, addLetter, 
        handleArrow, handleClick, handleKeyDown, initializeClues, saveClue, initializePuzzle, 
        changeToEditGrid, changeToEditText, generatePdf
    };

})();