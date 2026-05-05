var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var overlay = document.getElementById("gameOverlay");
var startButton = document.getElementById("startGameButton");
var scoreValue = document.getElementById("scoreValue");
var speedValue = document.getElementById("speedValue");
var streakValue = document.getElementById("streakValue");
var gameMessage = document.getElementById("gameMessage");
var statusText = document.getElementById("statusText");

var score = 0;
var speed = 7;
var streak = 0;
var gameRunning = false;
var keys = {};

var groundY = 420;
var makeTallObstacle = false;

var player = { x: 160, y: groundY - 78, w: 42, h: 78, vy: 0, jumping: false };
var obstacle = { x: 900, y: groundY - 54, w: 48, h: 54, passed: false };

function startGame() {
    score = 0;
    speed = 7;
    streak = 0;
    gameRunning = true;

    player = { x: 160, y: groundY - 78, w: 42, h: 78, vy: 0, jumping: false };
    resetObstacle();

    overlay.classList.add("d-none");
    startButton.textContent = "Run Again";
    showMessage("Jump over the blocks.");
    updateHud();
}

function showMessage(text) {
    gameMessage.textContent = text;
    statusText.textContent = text;
}

function updateHud() {
    scoreValue.textContent = Math.floor(score);
    speedValue.textContent = Math.floor(speed * 45);
    streakValue.textContent = streak;
}

function resetObstacle() {
    makeTallObstacle = !makeTallObstacle;

    obstacle = {
        x: canvas.width + 80,
        y: groundY - 54,
        w: 48,
        h: 54,
        passed: false
    };

    if (makeTallObstacle) {
        obstacle.y = groundY - 120;
        obstacle.w = 36;
        obstacle.h = 48;
    }
}

function isTouching(a, b) {
    if (a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y) {
        return true;
    }

    return false;
}

function jump() {
    if (gameRunning && player.jumping === false) {
        player.vy = -18;
        player.jumping = true;
    }
}

function movePlayer() {
    player.vy = player.vy + 0.9;
    player.y = player.y + player.vy;

    if (player.y > groundY - player.h) {
        player.y = groundY - player.h;
        player.vy = 0;
        player.jumping = false;
    }
}

function moveObstacle() {
    obstacle.x = obstacle.x - speed;

    if (obstacle.passed === false && obstacle.x + obstacle.w < player.x) {
        obstacle.passed = true;
        streak = streak + 1;
        score = score + 50;
        speed = speed + 0.3;
        showMessage("Obstacle cleared.");
    }

    if (obstacle.x + obstacle.w < 0) {
        resetObstacle();
    }
}

function endGame() {
    gameRunning = false;
    overlay.classList.remove("d-none");
    overlay.querySelector("h2").textContent = "Run over.";
    overlay.querySelector("p").textContent = "Your score is " + Math.floor(score) + ".";
    showMessage("Game finished. Click the button to restart.");
    updateHud();
}

function updateGame() {
    if (gameRunning === false) {
        return;
    }

    if (keys.ArrowDown || keys.s || keys.S) {
        player.h = 46;
    } else {
        player.h = 78;
    }

    if (player.jumping === false) {
        player.y = groundY - player.h;
    }

    movePlayer();
    moveObstacle();
    score = score + 0.2;

    if (isTouching(player, obstacle)) {
        endGame();
    }

    updateHud();
}

function drawGame() {
    ctx.fillStyle = "#07111d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0f1728";
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    ctx.fillStyle = "#f2f7ff";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    ctx.fillStyle = "#ff845c";
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
}

window.addEventListener("keydown", function (event) {
    keys[event.key] = true;

    if (event.key === " " || event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
        jump();
    }
});

window.addEventListener("keyup", function (event) {
    keys[event.key] = false;
});

startButton.addEventListener("click", startGame);

setInterval(function () {
    updateGame();
    drawGame();
}, 20);
