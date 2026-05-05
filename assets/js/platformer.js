var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var overlay = document.getElementById("gameOverlay");
var startButton = document.getElementById("startGameButton");
var scoreValue = document.getElementById("scoreValue");
var shardsValue = document.getElementById("shardsValue");
var livesValue = document.getElementById("livesValue");
var gameMessage = document.getElementById("gameMessage");
var statusText = document.getElementById("statusText");

var score = 0;
var lives = 3;
var gameRunning = false;
var keys = {};

var gravity = 0.7;
var jumpPower = -15;

var player = { x: 40, y: 430, w: 28, h: 38, speed: 6, vy: 0, onGround: false };
var goal = { x: 900, y: 165, w: 20, h: 60 };

var platforms = [
    { x: 0, y: 485, w: 220, h: 55 },
    { x: 260, y: 430, w: 140, h: 22 },
    { x: 450, y: 360, w: 130, h: 20 },
    { x: 620, y: 300, w: 120, h: 20 },
    { x: 770, y: 230, w: 150, h: 22 },
    { x: 820, y: 485, w: 140, h: 55 }
];

var lasers = [
    { x: 180, y: 473, w: 40, h: 12 },
    { x: 390, y: 418, w: 38, h: 12 },
    { x: 575, y: 348, w: 40, h: 12 }
];

var shardStart = [
    { x: 110, y: 440 },
    { x: 324, y: 384 },
    { x: 504, y: 314 },
    { x: 672, y: 254 },
    { x: 805, y: 184 },
    { x: 900, y: 440 }
];

var shards = [];

function startGame() {
    score = 0;
    lives = 3;
    gameRunning = true;

    player = { x: 40, y: 430, w: 28, h: 38, speed: 6, vy: 0, onGround: false };
    shards = [];

    for (var i = 0; i < shardStart.length; i++) {
        shards.push({
            x: shardStart[i].x,
            y: shardStart[i].y,
            taken: false
        });
    }

    overlay.classList.add("d-none");
    startButton.textContent = "Play Again";
    showMessage("Game started. Reach the yellow beacon.");
    updateHud();
}

function showMessage(text) {
    gameMessage.textContent = text;
    statusText.textContent = text;
}

function updateHud() {
    var collected = 0;

    for (var i = 0; i < shards.length; i++) {
        if (shards[i].taken) {
            collected = collected + 1;
        }
    }

    scoreValue.textContent = score;
    livesValue.textContent = lives;
    shardsValue.textContent = collected + "/" + shards.length;
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

function movePlayer() {
    if (keys.ArrowLeft || keys.a || keys.A) {
        player.x = player.x - player.speed;
    }

    if (keys.ArrowRight || keys.d || keys.D) {
        player.x = player.x + player.speed;
    }

    player.vy = player.vy + gravity;
    player.y = player.y + player.vy;
    player.onGround = false;

    for (var i = 0; i < platforms.length; i++) {
        if (isTouching(player, platforms[i]) && player.vy > 0) {
            player.y = platforms[i].y - player.h;
            player.vy = 0;
            player.onGround = true;
        }
    }

    if (player.x < 0) {
        player.x = 0;
    }

    if (player.x + player.w > canvas.width) {
        player.x = canvas.width - player.w;
    }
}

function loseLife(text) {
    lives = lives - 1;
    player.x = 40;
    player.y = 430;
    player.vy = 0;
    showMessage(text);

    if (lives <= 0) {
        endGame(false);
    }
}

function checkCollisions() {
    for (var i = 0; i < lasers.length; i++) {
        if (isTouching(player, lasers[i])) {
            loseLife("Laser touched. You lost a life.");
            return;
        }
    }

    for (var j = 0; j < shards.length; j++) {
        var shardBox = { x: shards[j].x - 9, y: shards[j].y - 9, w: 18, h: 18 };

        if (shards[j].taken === false && isTouching(player, shardBox)) {
            shards[j].taken = true;
            score = score + 100;
            showMessage("Shard collected.");
        }
    }

    if (isTouching(player, goal)) {
        score = score + lives * 150;
        endGame(true);
        return;
    }

    if (player.y > canvas.height) {
        loseLife("You fell down.");
    }
}

function endGame(playerWon) {
    gameRunning = false;
    overlay.classList.remove("d-none");

    if (playerWon) {
        overlay.querySelector("h2").textContent = "Beacon reached.";
    } else {
        overlay.querySelector("h2").textContent = "Run failed.";
    }

    overlay.querySelector("p").textContent = "Your score is " + score + ".";
    showMessage("Game finished. Click the button to play again.");
    updateHud();
}

function updateGame() {
    if (gameRunning === false) {
        return;
    }

    movePlayer();
    checkCollisions();
    updateHud();
}

function drawRect(item, color) {
    ctx.fillStyle = color;
    ctx.fillRect(item.x, item.y, item.w, item.h);
}

function drawGame() {
    ctx.fillStyle = "#08111c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < platforms.length; i++) {
        drawRect(platforms[i], "#20334d");
        ctx.fillStyle = "#6de0a6";
        ctx.fillRect(platforms[i].x, platforms[i].y, platforms[i].w, 5);
    }

    for (var j = 0; j < lasers.length; j++) {
        drawRect(lasers[j], "#ff5d8f");
    }

    for (var k = 0; k < shards.length; k++) {
        if (shards[k].taken === false) {
            ctx.fillStyle = "#6ee7f9";
            ctx.fillRect(shards[k].x - 8, shards[k].y - 8, 16, 16);
        }
    }

    drawRect(goal, "#ffbe55");
    drawRect(player, "#f2f7ff");
}

window.addEventListener("keydown", function (event) {
    keys[event.key] = true;

    if ((event.key === " " || event.key === "ArrowUp" || event.key === "w" || event.key === "W") && player.onGround) {
        player.vy = jumpPower;
        player.onGround = false;
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
