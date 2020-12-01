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
        renderUpdate.hideElements();
        window.scrollTo(0, 0);
        const puzzleElement = document.getElementById("container");
        const puzzleAndTitle = new Image();
        try {
            const dataUrl1 = await domtoimage.toJpeg(puzzleElement, { quality: 0.95 });
            puzzleAndTitle.src = dataUrl1;
        } catch (err) {
            console.error(err);
        };
        renderUpdate.unhideElements();
        renderUpdate.cleanClues();
        const cluesElement = document.getElementById("clues");
        const cluesImage = new Image();
        try {
            const dataUrl2 = await domtoimage.toJpeg(cluesElement, { quality: 0.95 });
            cluesImage.src = dataUrl2;
        } catch (err) {
            console.error(err);
        };
        document.body.appendChild(puzzleAndTitle);
        document.body.appendChild(cluesImage);
        renderUpdate.uncleanClues();
        cluesImage.onload = () => {
            const puzzleAndTitleHeight = PAGE_WIDTH * puzzleAndTitle.height / puzzleAndTitle.width;
            const cluesHeight = PAGE_WIDTH * cluesImage.height / cluesImage.width;
            doc.addImage(puzzleAndTitle, "JPEG", 0, (PAGE_HEIGHT - puzzleAndTitleHeight) / 2, PAGE_WIDTH, puzzleAndTitleHeight);
            doc.addPage();
            doc.addImage(cluesImage, "JPEG", 0, 20, PAGE_WIDTH, cluesHeight);
            console.log(cluesHeight);
            console.log(PAGE_WIDTH);
            console.log(cluesImage.height);
            console.log(cluesImage.width);
            doc.save("puzzle.pdf");
        }
    
    };

    return { generatePdf };

})();