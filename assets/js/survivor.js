var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var overlay = document.getElementById("gameOverlay");
var startButton = document.getElementById("startGameButton");
var scoreValue = document.getElementById("scoreValue");
var healthValue = document.getElementById("healthValue");
var timeValue = document.getElementById("timeValue");
var gameMessage = document.getElementById("gameMessage");
var statusText = document.getElementById("statusText");

var score = 0;
var health = 100;
var timeAlive = 0;
var gameRunning = false;
var keys = {};

var player = { x: 480, y: 270, size: 28, speed: 5 };
var enemy = { x: 40, y: 40, size: 28, speed: 2 };
var pickup = { x: 700, y: 340, size: 18, visible: true };

function startGame() {
    score = 0;
    health = 100;
    timeAlive = 0;
    gameRunning = true;

    player = { x: 480, y: 270, size: 28, speed: 5 };
    enemy = { x: 40, y: 40, size: 28, speed: 2 };
    pickup = { x: 700, y: 340, size: 18, visible: true };

    overlay.classList.add("d-none");
    startButton.textContent = "Try Again";
    showMessage("Move with WASD and avoid the red enemy.");
    updateHud();
}

function showMessage(text) {
    gameMessage.textContent = text;
    statusText.textContent = text;
}

function updateHud() {
    var shownHealth = Math.floor(health);

    if (shownHealth < 0) {
        shownHealth = 0;
    }

    scoreValue.textContent = Math.floor(score);
    healthValue.textContent = shownHealth;
    timeValue.textContent = Math.floor(timeAlive);
}

function isTouching(a, b) {
    if (a.x < b.x + b.size &&
        a.x + a.size > b.x &&
        a.y < b.y + b.size &&
        a.y + a.size > b.y) {
        return true;
    }

    return false;
}

function movePlayer() {
    if (keys.w || keys.W) {
        player.y = player.y - player.speed;
    }

    if (keys.s || keys.S) {
        player.y = player.y + player.speed;
    }

    if (keys.a || keys.A) {
        player.x = player.x - player.speed;
    }

    if (keys.d || keys.D) {
        player.x = player.x + player.speed;
    }

    if (player.x < 0) {
        player.x = 0;
    }

    if (player.y < 0) {
        player.y = 0;
    }

    if (player.x + player.size > canvas.width) {
        player.x = canvas.width - player.size;
    }

    if (player.y + player.size > canvas.height) {
        player.y = canvas.height - player.size;
    }
}

function moveEnemy() {
    if (enemy.x < player.x) {
        enemy.x = enemy.x + enemy.speed;
    }

    if (enemy.x > player.x) {
        enemy.x = enemy.x - enemy.speed;
    }

    if (enemy.y < player.y) {
        enemy.y = enemy.y + enemy.speed;
    }

    if (enemy.y > player.y) {
        enemy.y = enemy.y - enemy.speed;
    }
}

function checkPickup() {
    if (pickup.visible && isTouching(player, pickup)) {
        health = health + 20;

        if (health > 100) {
            health = 100;
        }

        pickup.visible = false;
        showMessage("Health collected.");
    }
}

function endGame() {
    gameRunning = false;
    overlay.classList.remove("d-none");
    overlay.querySelector("h2").textContent = "You were overrun.";
    overlay.querySelector("p").textContent = "Your score is " + Math.floor(score) + ".";
    showMessage("Game finished. Click the button to restart.");
    updateHud();
}

function updateGame() {
    if (gameRunning === false) {
        return;
    }

    movePlayer();
    moveEnemy();
    checkPickup();

    score = score + 0.3;
    timeAlive = timeAlive + 0.02;
    enemy.speed = 2 + timeAlive / 20;

    if (isTouching(player, enemy)) {
        health = health - 1.5;
    }

    if (health <= 0) {
        endGame();
    }

    updateHud();
}

function drawSquare(item, color) {
    ctx.fillStyle = color;
    ctx.fillRect(item.x, item.y, item.size, item.size);
}

function drawGame() {
    ctx.fillStyle = "#07111d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (pickup.visible) {
        drawSquare(pickup, "#6de0a6");
    }

    drawSquare(enemy, "#ff5d8f");
    drawSquare(player, "#f2f7ff");
}

window.addEventListener("keydown", function (event) {
    keys[event.key] = true;
});

window.addEventListener("keyup", function (event) {
    keys[event.key] = false;
});

startButton.addEventListener("click", startGame);

setInterval(function () {
    updateGame();
    drawGame();
}, 20);
