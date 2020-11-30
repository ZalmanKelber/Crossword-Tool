const pdf = (() => {

    const specialElementHandlers = {
        "#puzzle": function(element, renderer) {
            return true;
        }
    }

    const generatePdf = (puzzle, clues) => {
        const doc = new jsPDF();
        doc.fromHTML($('#puzzle-container').html(), 15, 15, {
            "elementHandlers": specialElementHandlers
        });
        doc.save("puzzle.pdf");
    };

    return { generatePdf };

})();