(function () {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const overlay = document.getElementById("gameOverlay");
    const startButton = document.getElementById("startGameButton");
    const scoreValue = document.getElementById("scoreValue");
    const speedValue = document.getElementById("speedValue");
    const bestValue = document.getElementById("bestValue");
    const streakValue = document.getElementById("streakValue");
    const gameMessage = document.getElementById("gameMessage");
    const statusText = document.getElementById("statusText");

    const gameName = "neon-rush";
    const groundY = 420;
    const game = {
        running: false,
        score: 0,
        speed: 320,
        streak: 0,
        best: window.GameStorage.getBestScore(gameName),
        keys: {},
        lastTime: 0,
        spawnTimer: 0,
        player: null,
        obstacles: []
    };

    function setMessage(text) {
        gameMessage.textContent = text;
        statusText.textContent = text;
    }

    function resetGame() {
        game.running = true;
        game.score = 0;
        game.speed = 320;
        game.streak = 0;
        game.spawnTimer = 0;
        game.obstacles = [];
        game.player = {
            x: 160,
            y: groundY - 78,
            width: 42,
            height: 78,
            vy: 0,
            jumping: false,
            sliding: false
        };
        overlay.classList.add("hidden");
        startButton.textContent = "Start Run";
        setMessage("Clean reactions build streak.");
        updateHud();
    }

    function updateHud() {
        scoreValue.textContent = Math.floor(game.score);
        speedValue.textContent = Math.floor(game.speed);
        bestValue.textContent = game.best;
        streakValue.textContent = game.streak;
    }

    function endGame() {
        game.running = false;
        game.best = window.GameStorage.saveBestScore(gameName, Math.floor(game.score));
        bestValue.textContent = game.best;
        overlay.classList.remove("hidden");
        overlay.querySelector("h2").textContent = "Run over.";
        overlay.querySelector("p").textContent = "You scored " + Math.floor(game.score) + " with a streak of " + game.streak + ".";
        startButton.textContent = "Run Again";
        setMessage("Run ended. Best score saved.");
    }

    function jump() {
        const player = game.player;
        if (!game.running || player.jumping) {
            return;
        }
        player.vy = -700;
        player.jumping = true;
        player.sliding = false;
    }

    function updatePlayer(delta) {
        const player = game.player;
        player.sliding = !!(game.keys.ArrowDown || game.keys.s || game.keys.S) && !player.jumping;

        const targetHeight = player.sliding ? 46 : 78;
        const heightChange = player.height < targetHeight ? 220 : -220;
        if (player.height !== targetHeight) {
            player.height += heightChange * delta;
            if ((heightChange > 0 && player.height > targetHeight) || (heightChange < 0 && player.height < targetHeight)) {
                player.height = targetHeight;
            }
            player.y = groundY - player.height;
        }

        player.vy += 1800 * delta;
        player.y += player.vy * delta;

        if (player.y >= groundY - player.height) {
            player.y = groundY - player.height;
            player.vy = 0;
            player.jumping = false;
        }
    }

    function spawnObstacle() {
        const tall = Math.random() > 0.5;
        game.obstacles.push({
            x: canvas.width + 60,
            width: tall ? 36 : 48,
            height: tall ? 108 : 54,
            y: tall ? groundY - 108 : groundY - 54,
            type: tall ? "tall" : "low",
            passed: false
        });
    }

    function intersects(a, b) {
        return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
    }

    function updateObstacles(delta) {
        game.spawnTimer -= delta;
        if (game.spawnTimer <= 0) {
            spawnObstacle();
            game.spawnTimer = Math.max(0.65, 1.1 - Math.min(0.35, game.speed / 1200));
        }

        game.obstacles.forEach(function (obstacle) {
            obstacle.x -= game.speed * delta;

            if (!obstacle.passed && obstacle.x + obstacle.width < game.player.x) {
                obstacle.passed = true;
                game.streak += 1;
                game.score += 40 + game.streak * 6;
                setMessage("Clean clear. Keep the streak alive.");
            }

            if (intersects(game.player, obstacle)) {
                endGame();
            }
        });

        game.obstacles = game.obstacles.filter(function (obstacle) {
            return obstacle.x + obstacle.width > -80;
        });
    }

    function update(delta) {
        if (!game.running) {
            return;
        }

        game.speed = Math.min(620, game.speed + delta * 10);
        game.score += game.speed * delta * 0.05;
        updatePlayer(delta);
        updateObstacles(delta);
        updateHud();
    }

    function drawBackground() {
        const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bg.addColorStop(0, "#07111d");
        bg.addColorStop(1, "#18091a");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "rgba(110,231,249,0.08)";
        for (let x = 0; x < canvas.width; x += 60) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
    }

    function drawGround() {
        ctx.fillStyle = "#0f1728";
        ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(canvas.width, groundY);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255,132,92,0.4)";
        ctx.lineWidth = 2;
        ctx.setLineDash([18, 14]);
        ctx.beginPath();
        ctx.moveTo(0, groundY + 36);
        ctx.lineTo(canvas.width, groundY + 36);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function drawPlayer() {
        const player = game.player;
        if (!player) {
            return;
        }
        ctx.fillStyle = "#f2f7ff";
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.fillStyle = "#6ee7f9";
        ctx.fillRect(player.x + 6, player.y + 8, player.width - 12, 16);
    }

    function drawObstacles() {
        game.obstacles.forEach(function (obstacle) {
            ctx.fillStyle = obstacle.type === "tall" ? "#ff5d8f" : "#ff845c";
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
    }

    function draw() {
        drawBackground();
        drawGround();
        drawObstacles();
        drawPlayer();
    }

    function frame(time) {
        if (!game.lastTime) {
            game.lastTime = time;
        }
        const delta = Math.min(0.033, (time - game.lastTime) / 1000);
        game.lastTime = time;
        update(delta);
        draw();
        requestAnimationFrame(frame);
    }

    window.addEventListener("keydown", function (event) {
        game.keys[event.key] = true;
        if (event.key === " " || event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
            jump();
        }
    });

    window.addEventListener("keyup", function (event) {
        game.keys[event.key] = false;
    });

    startButton.addEventListener("click", resetGame);
    bestValue.textContent = game.best;
    requestAnimationFrame(frame);
})();
