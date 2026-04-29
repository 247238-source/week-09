(function () {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const overlay = document.getElementById("gameOverlay");
    const startButton = document.getElementById("startGameButton");
    const scoreValue = document.getElementById("scoreValue");
    const shardsValue = document.getElementById("shardsValue");
    const livesValue = document.getElementById("livesValue");
    const bestValue = document.getElementById("bestValue");
    const gameMessage = document.getElementById("gameMessage");
    const statusText = document.getElementById("statusText");

    const gameName = "skyline-sprint";
    const platforms = [
        { x: 0, y: 485, w: 220, h: 55 },
        { x: 260, y: 430, w: 140, h: 22 },
        { x: 450, y: 360, w: 130, h: 20 },
        { x: 620, y: 300, w: 120, h: 20 },
        { x: 770, y: 230, w: 150, h: 22 },
        { x: 820, y: 485, w: 140, h: 55 }
    ];

    const hazards = [
        { x: 180, y: 473, w: 40, h: 12 },
        { x: 390, y: 418, w: 38, h: 12 },
        { x: 575, y: 348, w: 40, h: 12 }
    ];

    const shardSeeds = [
        { x: 110, y: 440 },
        { x: 324, y: 384 },
        { x: 504, y: 314 },
        { x: 672, y: 254 },
        { x: 805, y: 184 },
        { x: 900, y: 440 }
    ];

    const goal = { x: 900, y: 165, w: 20, h: 60 };
    const game = {
        running: false,
        score: 0,
        keys: {},
        lastTime: 0,
        best: window.GameStorage.getBestScore(gameName),
        player: null,
        shards: []
    };

    function setMessage(text) {
        gameMessage.textContent = text;
        statusText.textContent = text;
    }

    function resetGame() {
        game.running = true;
        game.score = 0;
        game.player = {
            x: 40,
            y: 430,
            w: 28,
            h: 38,
            vx: 0,
            vy: 0,
            speed: 240,
            jump: -420,
            onGround: false,
            lives: 3
        };
        game.shards = shardSeeds.map(seed => ({ x: seed.x, y: seed.y, active: true }));
        overlay.classList.add("hidden");
        startButton.textContent = "Start Run";
        setMessage("Run clean and reach the beacon.");
        syncHud();
    }

    function syncHud() {
        scoreValue.textContent = game.score;
        const collected = game.shards.filter(shard => !shard.active).length;
        shardsValue.textContent = collected + "/" + game.shards.length;
        livesValue.textContent = game.player.lives;
        bestValue.textContent = game.best;
    }

    function playerRect() {
        return game.player;
    }

    function intersects(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function respawnPlayer(message) {
        game.player.x = 40;
        game.player.y = 430;
        game.player.vx = 0;
        game.player.vy = 0;
        setMessage(message);
    }

    function endGame(win) {
        game.running = false;
        game.best = window.GameStorage.saveBestScore(gameName, game.score);
        bestValue.textContent = game.best;
        overlay.classList.remove("hidden");
        overlay.querySelector("h2").textContent = win ? "Beacon reached." : "Run failed.";
        overlay.querySelector("p").textContent = win
            ? "You finished with " + game.score + " points. Tighter shard routes will push that score higher."
            : "You ran out of lives. Reset and take a cleaner line through the lasers.";
        startButton.textContent = "Play Again";
    }

    function update(delta) {
        if (!game.running) {
            return;
        }

        const player = game.player;
        const left = game.keys.ArrowLeft || game.keys.a || game.keys.A;
        const right = game.keys.ArrowRight || game.keys.d || game.keys.D;
        player.vx = 0;
        if (left) player.vx = -player.speed;
        if (right) player.vx = player.speed;

        player.x += player.vx * delta;
        player.vy += 980 * delta;
        player.y += player.vy * delta;
        player.onGround = false;

        platforms.forEach(platform => {
            const rect = { x: platform.x, y: platform.y, w: platform.w, h: platform.h };
            if (intersects(player, rect) && player.vy >= 0 && player.y + player.h - player.vy * delta <= platform.y + 8) {
                player.y = platform.y - player.h;
                player.vy = 0;
                player.onGround = true;
            }
        });

        if (player.x < 0) player.x = 0;
        if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;

        hazards.forEach(hazard => {
            const rect = { x: hazard.x, y: hazard.y, w: hazard.w, h: hazard.h };
            if (intersects(player, rect)) {
                player.lives -= 1;
                if (player.lives <= 0) {
                    endGame(false);
                } else {
                    respawnPlayer("Laser hit. Try that section again.");
                }
            }
        });

        game.shards.forEach(shard => {
            const rect = { x: shard.x - 9, y: shard.y - 9, w: 18, h: 18 };
            if (shard.active && intersects(player, rect)) {
                shard.active = false;
                game.score += 100;
                setMessage("Shard collected.");
            }
        });

        if (intersects(player, goal)) {
            game.score += game.player.lives * 150;
            endGame(true);
        }

        if (player.y > canvas.height + 100) {
            player.lives -= 1;
            if (player.lives <= 0) {
                endGame(false);
            } else {
                respawnPlayer("You fell. Back to the start.");
            }
        }

        syncHud();
    }

    function drawBackground() {
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, "#0a1220");
        grad.addColorStop(0.6, "#13263d");
        grad.addColorStop(1, "#08111c");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "rgba(255,255,255,0.04)";
        for (let i = 0; i < 9; i++) {
            ctx.fillRect(80 + i * 100, 160 + (i % 3) * 26, 46, 220);
        }
    }

    function draw() {
        drawBackground();

        platforms.forEach(platform => {
            ctx.fillStyle = "#20334d";
            ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
            ctx.fillStyle = "#6de0a6";
            ctx.fillRect(platform.x, platform.y, platform.w, 5);
        });

        hazards.forEach(hazard => {
            ctx.fillStyle = "#ff5d8f";
            ctx.fillRect(hazard.x, hazard.y, hazard.w, hazard.h);
        });

        game.shards.forEach(shard => {
            if (!shard.active) {
                return;
            }
            ctx.fillStyle = "#6ee7f9";
            ctx.beginPath();
            ctx.moveTo(shard.x, shard.y - 10);
            ctx.lineTo(shard.x + 9, shard.y);
            ctx.lineTo(shard.x, shard.y + 10);
            ctx.lineTo(shard.x - 9, shard.y);
            ctx.closePath();
            ctx.fill();
        });

        ctx.fillStyle = "#ffbe55";
        ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
        ctx.fillStyle = "#fff2b8";
        ctx.fillRect(goal.x - 10, goal.y + 8, 10, 8);

        if (game.player) {
            ctx.fillStyle = "#f2f7ff";
            ctx.fillRect(game.player.x, game.player.y, game.player.w, game.player.h);
            ctx.fillStyle = "#6ee7f9";
            ctx.fillRect(game.player.x + 4, game.player.y + 6, game.player.w - 8, 10);
        }
    }

    function frame(timestamp) {
        if (!game.lastTime) {
            game.lastTime = timestamp;
        }
        const delta = Math.min(0.033, (timestamp - game.lastTime) / 1000);
        game.lastTime = timestamp;
        update(delta);
        draw();
        requestAnimationFrame(frame);
    }

    window.addEventListener("keydown", event => {
        game.keys[event.key] = true;
        if ((event.key === " " || event.key === "ArrowUp" || event.key === "w" || event.key === "W") && game.running && game.player.onGround) {
            game.player.vy = game.player.jump;
            game.player.onGround = false;
        }
    });

    window.addEventListener("keyup", event => {
        game.keys[event.key] = false;
    });

    startButton.addEventListener("click", resetGame);
    bestValue.textContent = game.best;
    requestAnimationFrame(frame);
})();
