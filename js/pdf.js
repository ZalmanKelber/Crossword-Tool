console.log(html2canvas);

const pdf = (() => {

    const specialElementHandlers = {
        ".label": function(element, renderer) {
            return true;
        }
    }

    const generatePdf = (puzzle, clues) => {
        const doc = new jsPDF();
        console.log(doc);
        doc.addHTML(
            document.getElementById("container"), 
            function () {
            doc.save("puzzle.pdf");
            }
        );
    };

    return { generatePdf };

})();