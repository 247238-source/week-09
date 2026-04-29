(function () {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const overlay = document.getElementById("gameOverlay");
    const startButton = document.getElementById("startGameButton");
    const scoreValue = document.getElementById("scoreValue");
    const healthValue = document.getElementById("healthValue");
    const bestValue = document.getElementById("bestValue");
    const timeValue = document.getElementById("timeValue");
    const gameMessage = document.getElementById("gameMessage");
    const statusText = document.getElementById("statusText");

    const gameName = "last-light";
    const game = {
        running: false,
        score: 0,
        best: window.GameStorage.getBestScore(gameName),
        keys: {},
        lastTime: 0,
        spawnTimer: 0,
        healTimer: 0,
        timeAlive: 0,
        player: null,
        bullets: [],
        enemies: [],
        pickups: []
    };

    function setMessage(text) {
        gameMessage.textContent = text;
        statusText.textContent = text;
    }

    function resetGame() {
        game.running = true;
        game.score = 0;
        game.spawnTimer = 0;
        game.healTimer = 6;
        game.timeAlive = 0;
        game.bullets = [];
        game.enemies = [];
        game.pickups = [];
        game.player = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            radius: 14,
            speed: 220,
            health: 100,
            fireTimer: 0
        };
        overlay.classList.add("hidden");
        startButton.textContent = "Start Run";
        setMessage("Keep moving. The weapon fires by itself.");
        updateHud();
    }

    function updateHud() {
        scoreValue.textContent = Math.floor(game.score);
        healthValue.textContent = Math.max(0, Math.ceil(game.player.health));
        bestValue.textContent = game.best;
        timeValue.textContent = Math.floor(game.timeAlive);
    }

    function endGame() {
        game.running = false;
        game.best = window.GameStorage.saveBestScore(gameName, Math.floor(game.score));
        bestValue.textContent = game.best;
        overlay.classList.remove("hidden");
        overlay.querySelector("h2").textContent = "You were overrun.";
        overlay.querySelector("p").textContent = "You survived for " + Math.floor(game.timeAlive) + " seconds and scored " + Math.floor(game.score) + ".";
        startButton.textContent = "Try Again";
        setMessage("Run ended. Best score saved.");
    }

    function spawnEnemy() {
        const side = Math.floor(Math.random() * 4);
        let x = 0;
        let y = 0;

        if (side === 0) {
            x = Math.random() * canvas.width;
            y = -20;
        } else if (side === 1) {
            x = canvas.width + 20;
            y = Math.random() * canvas.height;
        } else if (side === 2) {
            x = Math.random() * canvas.width;
            y = canvas.height + 20;
        } else {
            x = -20;
            y = Math.random() * canvas.height;
        }

        game.enemies.push({
            x: x,
            y: y,
            radius: 12,
            speed: 55 + game.timeAlive * 2.5
        });
    }

    function spawnHeal() {
        game.pickups.push({
            x: 80 + Math.random() * (canvas.width - 160),
            y: 80 + Math.random() * (canvas.height - 160),
            radius: 9
        });
    }

    function autoFire(delta) {
        const player = game.player;
        player.fireTimer -= delta;
        if (player.fireTimer > 0 || game.enemies.length === 0) {
            return;
        }

        let target = game.enemies[0];
        let bestDistance = Infinity;

        game.enemies.forEach(function (enemy) {
            const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
            if (distance < bestDistance) {
                bestDistance = distance;
                target = enemy;
            }
        });

        const angle = Math.atan2(target.y - player.y, target.x - player.x);
        game.bullets.push({
            x: player.x,
            y: player.y,
            vx: Math.cos(angle) * 420,
            vy: Math.sin(angle) * 420,
            radius: 4
        });
        player.fireTimer = 0.24;
    }

    function update(delta) {
        if (!game.running) {
            return;
        }

        game.timeAlive += delta;
        const player = game.player;
        let moveX = 0;
        let moveY = 0;

        if (game.keys.w || game.keys.W) moveY -= 1;
        if (game.keys.s || game.keys.S) moveY += 1;
        if (game.keys.a || game.keys.A) moveX -= 1;
        if (game.keys.d || game.keys.D) moveX += 1;

        const moveSize = Math.hypot(moveX, moveY) || 1;
        player.x += (moveX / moveSize) * player.speed * delta;
        player.y += (moveY / moveSize) * player.speed * delta;
        player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
        player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

        game.spawnTimer -= delta;
        if (game.spawnTimer <= 0) {
            spawnEnemy();
            game.spawnTimer = Math.max(0.2, 0.85 - Math.min(0.45, game.timeAlive * 0.01));
        }

        game.healTimer -= delta;
        if (game.healTimer <= 0) {
            spawnHeal();
            game.healTimer = 10;
        }

        autoFire(delta);

        game.bullets.forEach(function (bullet) {
            bullet.x += bullet.vx * delta;
            bullet.y += bullet.vy * delta;
        });

        game.enemies.forEach(function (enemy) {
            const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            enemy.x += Math.cos(angle) * enemy.speed * delta;
            enemy.y += Math.sin(angle) * enemy.speed * delta;

            if (Math.hypot(enemy.x - player.x, enemy.y - player.y) < enemy.radius + player.radius) {
                player.health -= 24 * delta;
            }
        });

        game.bullets.forEach(function (bullet) {
            game.enemies.forEach(function (enemy) {
                if (Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y) < enemy.radius + bullet.radius && enemy.radius > 0) {
                    enemy.radius = 0;
                    bullet.x = -1000;
                    game.score += 30;
                }
            });
        });

        game.pickups.forEach(function (pickup) {
            if (Math.hypot(player.x - pickup.x, player.y - pickup.y) < player.radius + pickup.radius && pickup.radius > 0) {
                pickup.radius = 0;
                player.health = Math.min(100, player.health + 18);
                setMessage("Health pickup collected.");
            }
        });

        game.enemies = game.enemies.filter(function (enemy) {
            return enemy.radius > 0;
        });
        game.bullets = game.bullets.filter(function (bullet) {
            return bullet.x > -100 && bullet.x < canvas.width + 100 && bullet.y > -100 && bullet.y < canvas.height + 100;
        });
        game.pickups = game.pickups.filter(function (pickup) {
            return pickup.radius > 0;
        });

        game.score += delta * (6 + game.timeAlive * 1.4);

        if (player.health <= 0) {
            endGame();
        }

        updateHud();
    }

    function drawBackground() {
        const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        bg.addColorStop(0, "#07111d");
        bg.addColorStop(1, "#15081a");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "rgba(110,231,249,0.08)";
        for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    function draw() {
        drawBackground();

        game.pickups.forEach(function (pickup) {
            ctx.fillStyle = "#6de0a6";
            ctx.beginPath();
            ctx.arc(pickup.x, pickup.y, pickup.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        game.bullets.forEach(function (bullet) {
            ctx.fillStyle = "#6ee7f9";
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        game.enemies.forEach(function (enemy) {
            ctx.fillStyle = "#ff5d8f";
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        if (game.player) {
            ctx.fillStyle = "#f2f7ff";
            ctx.beginPath();
            ctx.arc(game.player.x, game.player.y, game.player.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#6ee7f9";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(game.player.x, game.player.y, game.player.radius + 6, 0, Math.PI * 2);
            ctx.stroke();
        }
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
    });

    window.addEventListener("keyup", function (event) {
        game.keys[event.key] = false;
    });

    startButton.addEventListener("click", resetGame);
    bestValue.textContent = game.best;
    requestAnimationFrame(frame);
})();
