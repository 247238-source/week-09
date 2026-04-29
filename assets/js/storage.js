(function () {
    const storageKey = "arcade-nexus-scores";

    function getAllScores() {
        try {
            const savedData = localStorage.getItem(storageKey);
            return JSON.parse(savedData) || {};
        } catch (error) {
            return {};
        }
    }

    function saveAllScores(scoreObject) {
        localStorage.setItem(storageKey, JSON.stringify(scoreObject));
    }

    function getBestScore(gameName) {
        const scoreObject = getAllScores();
        return Number(scoreObject[gameName] || 0);
    }

    function saveBestScore(gameName, newScore) {
        const scoreObject = getAllScores();
        const oldScore = Number(scoreObject[gameName] || 0);
        const bestScore = Math.max(oldScore, Number(newScore || 0));

        scoreObject[gameName] = bestScore;
        saveAllScores(scoreObject);

        return bestScore;
    }

    window.GameStorage = {
        getAllScores,
        getBestScore,
        saveBestScore
    };
})();
