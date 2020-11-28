const renderHelperFunctions = (() => {
    const handleSubmit = e => {
        e.preventDefault();
        const sizeInput = document.getElementById("size-input").value;
        if (sizeInput >= 3 && sizeInput <= 55 && sizeInput % 2 == 1) {
            actions.changeToEditGrid(sizeInput);
        } else {
            const errorMessage = document.getElementById("error-message");
            errorMessage.setAttribute("style", "display: default;")
        }
    };

    const handleInputChange = () => { //get rid of any error messages once input is changed
        const errorMessage = document.getElementById("error-message");
            errorMessage.setAttribute("style", "display: none;")
    };

    const handleClickEdit = (e, dir, i) => { //creates form and adds event listener that saves input on pressing enter or clicking save button
        e.preventDefault();
        const clueTextElement = document.getElementById(`clue-${i}-${dir}`);
        const form = document.createElement("form");
        form.addEventListener("submit", e => e.preventDefault());
        const formInput = document.createElement("input");
        formInput.setAttribute("type", "text");  //get current clue text not including the initial number
        formInput.setAttribute("value", clueTextElement.innerHTML.substring(clueTextElement.innerHTML.indexOf("</strong>") + 10));
        formInput.addEventListener("keyup", e => {
            if (e.key == "Enter") {
                e.preventDefault();
                actions.saveClue(dir, i, formInput.value);
            }
        });
        const saveButton = document.createElement("a");
        saveButton.innerHTML = "save";
        saveButton.setAttribute("class", "btn");
        saveButton.addEventListener("click", () => actions.saveClue(dir, i, formInput.value));
        clueTextElement.appendChild(form);
        form.appendChild(formInput);
        form.appendChild(saveButton);
    }

    const addEditButton = (clueTextElement, dir, i) => {
        const editButton = document.createElement("a");
        editButton.setAttribute("class", "btn");
        editButton.innerHTML = "edit";
        editButton.addEventListener("click", e => handleClickEdit(e, dir, i));
        clueTextElement.appendChild(editButton);
    }

    return { handleSubmit, handleInputChange, addEditButton };

})();