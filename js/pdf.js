const pdf = (() => {

    const getPuzzleWidth = length => {
        if (length >= 15) { return 140; }
        if (length >= 11) { return 120; }
        return length * 12;
    }

    const generatePdf = async (puzzle, clues) => {
        const doc = new jsPDF("p", "mm", "a4");
        const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
        const PAGE_WIDTH = doc.internal.pageSize.getWidth();
        window.scrollTo(0, 0);
        await html2canvas(document.getElementById("puzzle")).then(function(canvas) {
            const imgData = canvas.toDataURL("image/jpeg", 1.5);
            const img = new Image();
            img.src = imgData;
            const puzzleWidth = getPuzzleWidth(puzzle.length);
            doc.addImage(img, "JPEG", (PAGE_WIDTH - puzzleWidth) / 2, (PAGE_HEIGHT - puzzleWidth) / 2, puzzleWidth, puzzleWidth);
        });
        doc.save("puzzle.pdf");
    };

    return { generatePdf };

})();