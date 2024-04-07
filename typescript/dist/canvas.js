//---------------------------------------------------------------------
function loadGamesCanvas() {
    try {
        var games_1 = [];
        // get the games from local storage
        var gamesString = localStorage.getItem('games');
        // Handle the case where there are no games in localStorage
        if (!gamesString) {
            console.error("No games found in localStorage.");
            return [];
        }
        var gamesJson = JSON.parse(gamesString);
        gamesJson.forEach(function (gameJson) {
            var game = new Game(gameJson.playerName, gameJson.score, new Date(gameJson.date));
            games_1.push(game);
        });
        return games_1;
    }
    catch (error) {
        console.error("Error loading games:", error);
        return [];
    }
}
var games = loadGamesCanvas();
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var userName = localStorage.getItem('username');
var player = new Player(userName);
//const users: User[] = [];
var bombs = [];
var coins = [];
var floors = [];
var lastFloorId = 0;
var lastBombId = 0;
var lastCoinId = 0;
// Vertical offset for the canvas
var canvasOffsetY = 0;
var hasStartedMovingUp = false;
var hasStartedMovingDown = false;
//---------------------floors functions--------------------------------------
var floorImageUrl = "../../images/stick.png";
// Generate the floors
function generateFloor() {
    //const minGap = 100;
    //const maxGap = 200;
    var minWidth = 250;
    var maxWidth = 200;
    var lastFloor = floors[floors.length - 1];
    var y = lastFloor ? lastFloor.y - 100 : canvas.height - 20 - canvasOffsetY; // Apply the vertical offset to the first floor
    var width = floors.length === 0
        ? canvas.width
        : Math.floor(Math.random() * (maxWidth - minWidth + 1)) + minWidth;
    var x = floors.length === 0
        ? 0
        : Math.floor(Math.random() * (canvas.width - width));
    floors.push(new Floor(x, y, width, lastFloorId, floorImageUrl));
    lastFloorId++;
}
function removeFloors() {
    floors = floors.filter(function (floor) { return floor.y + floor.height > -canvasOffsetY; }); // Remove floors above the canvas
}
//-----------------------bomb function----------------------------
//generate the bombs
function generateBomb() {
    var width = 50;
    var x = Math.floor(Math.random() * (canvas.width - width)); //determine the horizontal position of the new "bomb" element
    var y = canvas.height - 20; // determine the vertical position of the new "bomb" element above the player's position  
    if (bombs.length < 5) {
        bombs.push(new Bomb(x, y, width, lastBombId));
        console.log(bombs);
        lastBombId++;
    }
}
function removeBombs() {
    bombs = bombs.filter(function (bomb) { return (bomb.y + bomb.height < 690); }); // Remove bombs beneath the canvas
}
//---------------coin function---------
//generate the coins
function generateCoin() {
    var width = 30;
    var x = Math.floor(Math.random() * (canvas.width - width)); //determine the horizontal position of the new "coin" element
    var y = player.y - 20; // determine the vertical position of the new "coin" element above the player's position  
    if (coins.length < 10) {
        coins.push(new Coin(x, y, width, lastCoinId));
        console.log(coins);
        lastCoinId++;
    }
}
function removeCoins() {
    coins = coins.filter(function (coin) { return coin.y + coin.height < 690; }); // Remove coins beneath the canvas
}
//------- gameover popup----------------------------
var gameOver = false;
function showGameOverPopup() {
    var popup = document.getElementById("popup");
    //--
    var scoreButton = document.createElement("button");
    scoreButton.classList.add("score-button");
    scoreButton.textContent = "score board";
    scoreButton.addEventListener("click", function () {
        window.location.href = "scoreboard.html";
    });
    //---
    var restartButton = document.createElement("button");
    restartButton.classList.add("restart-button");
    restartButton.textContent = "Restart";
    restartButton.addEventListener("click", function () {
        location.reload();
    });
    //--
    var backButton = document.createElement("button");
    backButton.classList.add("back-button");
    backButton.textContent = "Back";
    backButton.addEventListener("click", function () {
        window.location.href = "/index.html";
    });
    // popup.innerHTML = "You touched the floor! Game Over!";
    popup.appendChild(backButton);
    popup.appendChild(restartButton);
    popup.appendChild(scoreButton);
    popup.style.display = "block";
}
//-----------------------------------------------
//movement left right
var isLeftKeyPressed = false;
var isRightKeyPressed = false;
function onKeyDown(event) {
    if (event.key === "ArrowLeft" || event.key === "a") {
        isLeftKeyPressed = true;
    }
    else if (event.key === "ArrowRight" || event.key === "d") {
        isRightKeyPressed = true;
    }
}
function onKeyUp(event) {
    if (event.key === "ArrowLeft" || event.key === "a") {
        isLeftKeyPressed = false;
    }
    else if (event.key === "ArrowRight" || event.key === "d") {
        isRightKeyPressed = false;
    }
}
//--
//jump
var isFirstJump = true;
function onKeyPress(event) {
    if (event.key === " ") {
        if (isFirstJump) {
            player.jump();
            isFirstJump = false;
        }
        else {
            player.jump();
            hasStartedJumping = true;
        }
        // Start the game when the player presses the jump key
    }
}
//--
document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);
document.addEventListener("keypress", onKeyPress);
//---------------------------------------------------------------------
//update frames
var updateInterval;
var hasStartedJumping = false; // Flag to track if the player has started jumping
var backgroundImages = [
    "../../images/Ladder.jpg",
    "../../images/cloud-sky.jpg",
    "../../images/space.jpg"
    // Background image when player reaches a certain position
    // Add more background image URLs as needed
];
var currentBackgroundIndex = 0;
// Update function
function update() {
    if (!gameOver) {
        renderScore();
        if (player.score >= 10 && currentBackgroundIndex === 0) {
            // Change the background image when player's score reaches 100 and the current background is the default one
            currentBackgroundIndex = 1;
            canvas.style.backgroundImage = "url('" + backgroundImages[currentBackgroundIndex] + "')";
        }
        else if (player.score >= 20 && currentBackgroundIndex === 1) {
            // Change the background image when player's score reaches 200 and the current background is the second one
            currentBackgroundIndex = 2;
            canvas.style.backgroundImage = "url('" + backgroundImages[currentBackgroundIndex] + "')";
        }
        if (isLeftKeyPressed) {
            player.x -= 5;
        }
        else if (isRightKeyPressed) {
            player.x += 5;
        }
        if (player.y < canvas.height / 100) {
            canvasOffsetY = canvas.height / 100;
        }
        if (hasStartedJumping) {
            floors.forEach(function (floor) { return (floor.speedY = 2); });
            bombs.forEach(function (bomb) { return (bomb.speedY = 2); });
            coins.forEach(function (coin) { return (coin.speedY = 2); });
            if (player.y < canvas.height / 2 && player.isJumping) {
                canvasOffsetY += 1;
            }
        }
        player.update();
        var floorCollision = false;
        var targetFloorId_1 = null; // Keep track of the ID of the target floor
        // Check for collisions with floors
        for (var _i = 0, floors_1 = floors; _i < floors_1.length; _i++) {
            var floor = floors_1[_i];
            if (player.x + player.width > floor.x &&
                player.x < floor.x + floor.width &&
                player.y + player.velocityY + player.height >= floor.y &&
                player.y + player.velocityY < floor.y + floor.height) {
                floorCollision = true;
                targetFloorId_1 = floor.id;
                break;
            }
        }
        if (targetFloorId_1 !== null && (player.isJumping || player.velocityY >= 0)) {
            var targetFloor = floors.find(function (floor) { return floor.id === targetFloorId_1; });
            if (targetFloor && Math.abs(player.y + player.velocityY + player.height - targetFloor.y) <= 5) {
                player.y = targetFloor.y - player.height;
                player.velocityY = 0;
                player.isJumping = false;
                player.rotation = 0;
                canvasOffsetY = 0; // Reset the vertical offset when the player lands on the ground.
            }
            else {
                player.y += player.velocityY;
            }
        }
        if (floorCollision && player.rotation !== 0) {
            var targetFloor = floors.find(function (floor) { return floor.id === targetFloorId_1; });
            if (targetFloor) {
                if (player.x + player.width >= targetFloor.x &&
                    player.x <= targetFloor.x + targetFloor.width) {
                    player.y = targetFloor.y - player.height;
                    player.velocityY = 0;
                    player.isJumping = false;
                    player.rotation = 0;
                    canvasOffsetY = 0; // Reset the vertical offset when the player lands on the ground.
                }
            }
        }
        if (floorCollision || player.velocityY > 0) {
            player.isJumping = false;
            player.rotation = 0;
        }
        removeFloors();
        if (floors.length === 0 || floors[floors.length - 1].y > 100) {
            generateFloor();
        }
        else if (player.y + player.height < canvas.height / 2) {
            generateFloor();
        }
        generateBomb();
        removeBombs();
        var isBomb = checkCollisionBomb();
        if (isBomb) {
            player.score--;
        }
        generateCoin();
        removeCoins();
        var isCoin = checkCollisionCoin();
        if (isCoin) {
            player.score++;
        }
        if (player.y >= canvas.height) {
            gameOver = true;
            games.push(new Game(player.userName, player.score, new Date(player.date)));
            // save to local
            var arrayJSON = JSON.stringify(games);
            localStorage.setItem('games', arrayJSON);
            showGameOverPopup();
            clearInterval(updateInterval);
        }
    }
}
// Update loop
updateInterval = setInterval(update, 800 / 60);
generateFloor();
//--
//draw frames
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(0, canvasOffsetY);
    // Draw player & floors & bombs & coins
    player.draw(ctx);
    if (!gameOver) {
        for (var _i = 0, floors_2 = floors; _i < floors_2.length; _i++) {
            var floor = floors_2[_i];
            floor.draw(ctx);
            floor.newPos();
            if (gameOver)
                floor.speedY = 0;
        }
        for (var _a = 0, bombs_1 = bombs; _a < bombs_1.length; _a++) {
            var bomb = bombs_1[_a];
            bomb.drawBomb(ctx);
            bomb.newPos();
            if (gameOver)
                bomb.speedY = 0;
        }
        for (var _b = 0, coins_1 = coins; _b < coins_1.length; _b++) {
            var coin = coins_1[_b];
            coin.animation(ctx);
            coin.newPos();
            if (gameOver)
                coin.speedY = 0;
        }
    }
    // Reset the canvas transformation
    ctx.setTransform(1, 0, 0, 1, 0, 0); //resets the canvas transformation, undoing the previous vertical offset applied
    requestAnimationFrame(draw); //creates a loop that keeps redrawing the game elements
}
//--
generateFloor();
generateBomb();
generateCoin();
draw();
updateInterval = setInterval(update, 800 / 60);
//------------render score---------
//need to be FIX!!!!
function renderScore() {
    var html = document.querySelector("#score");
    //const  = localStorage.getItem("");
    try {
        if (!html)
            throw new Error("no element");
        html.innerHTML = "<h2>" + player.userName + " your current score is: " + player.score + "</h2>";
    }
    catch (error) {
        console.error(error);
    }
}
//------------------check collision-----------------------------
function checkCollisionBomb() {
    var bombCollision = false;
    var targetBombId = null; // Keep track of the ID of the target floor
    for (var _i = 0, bombs_2 = bombs; _i < bombs_2.length; _i++) {
        var bomb = bombs_2[_i];
        if (bomb.x < player.x + player.width &&
            bomb.x + bomb.width > player.x &&
            bomb.y + bomb.height > player.y) {
            bombCollision = true;
            console.log("collosion bomb");
            targetBombId = bomb.idB; // Save the ID of the target bomb
            console.log("targetBombId:", targetBombId);
            bombs = bombs.filter(function (bomb) { return (bomb.idB !== targetBombId); }); // Remove the bomb that hit 
            return bombCollision;
        }
    }
}
function checkCollisionCoin() {
    var coinCollision = false;
    var targetCoinId = null; // Keep track of the ID of the target floor
    for (var _i = 0, coins_2 = coins; _i < coins_2.length; _i++) {
        var coin = coins_2[_i];
        if (coin.x < player.x + player.width &&
            coin.x + coin.width > player.x &&
            coin.y + coin.height > player.y) {
            coinCollision = true;
            console.log("collosion coin");
            targetCoinId = coin.idC; // Save the ID of the target coin
            console.log("targetCoinId:", targetCoinId);
            coins = coins.filter(function (coin) { return (coin.idC !== targetCoinId); }); // Remove the bomb that hit 
            return coinCollision;
        }
    }
}
