

//---------------------------------------------------------------------
function loadGamesCanvas(): Game[] {
  try {
    const games: Game[] = [];
    // get the games from local storage
    const gamesString = localStorage.getItem('games');

    // Handle the case where there are no games in localStorage
    if (!gamesString) {
      console.error("No games found in localStorage.");
      return [];
    }
    const gamesJson = JSON.parse(gamesString);
    gamesJson.forEach((gameJson: any) => {
      const game = new Game(gameJson.playerName, gameJson.score, new Date(gameJson.date));
      games.push(game);
    });

    return games;
  } catch (error) {
    console.error("Error loading games:", error);
    return [];
  }
}
const games: Game[] = loadGamesCanvas();

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const userName = localStorage.getItem('username');
const player = new Player(userName!);

//const users: User[] = [];
let bombs: Bomb[] = [];
let coins: Coin[] = [];
let floors: Floor[] = [];

let lastFloorId = 0;
let lastBombId = 0;
let lastCoinId = 0;

// Vertical offset for the canvas
let canvasOffsetY = 0;
let hasStartedMovingUp = false;
let hasStartedMovingDown = false;

//---------------------floors functions--------------------------------------

const floorImageUrl = "../../images/stick.png";

// Generate the floors
function generateFloor() {
  //const minGap = 100;
  //const maxGap = 200;
  const minWidth = 250;
  const maxWidth = 200;

  const lastFloor = floors[floors.length - 1];
  const y = lastFloor ? lastFloor.y - 100 : canvas.height - 20 - canvasOffsetY; // Apply the vertical offset to the first floor

  const width =
    floors.length === 0
      ? canvas.width
      : Math.floor(Math.random() * (maxWidth - minWidth + 1)) + minWidth;

  const x =
    floors.length === 0
      ? 0
      : Math.floor(Math.random() * (canvas.width - width));

  floors.push(new Floor(x, y, width, lastFloorId, floorImageUrl));
  lastFloorId++;
}

function removeFloors() {
  floors = floors.filter((floor) => floor.y + floor.height > -canvasOffsetY); // Remove floors above the canvas
}
//-----------------------bomb function----------------------------

//generate the bombs

function generateBomb() {
  const width = 50;

  const x = Math.floor(Math.random() * (canvas.width - width)); //determine the horizontal position of the new "bomb" element
  const y = canvas.height - 20; // determine the vertical position of the new "bomb" element above the player's position  

  if (bombs.length < 5) {
    bombs.push(new Bomb(x, y, width, lastBombId));
    console.log(bombs)
    lastBombId++;
  }
}

function removeBombs() {
  bombs = bombs.filter((bomb) => (bomb.y + bomb.height < 690)); // Remove bombs beneath the canvas
}

//---------------coin function---------

//generate the coins
function generateCoin() {

  const width = 30;

  const x = Math.floor(Math.random() * (canvas.width - width)); //determine the horizontal position of the new "coin" element
  const y = player.y - 20; // determine the vertical position of the new "coin" element above the player's position  

  if (coins.length < 10) {
    coins.push(new Coin(x, y, width, lastCoinId));
    console.log(coins)
    lastCoinId++;
  }
}

function removeCoins() {
  coins = coins.filter((coin) => coin.y + coin.height < 690); // Remove coins beneath the canvas
}

//------- gameover popup----------------------------
let gameOver = false;
function showGameOverPopup() {
  const popup = document.getElementById("popup")!;
  //--
  const scoreButton = document.createElement("button");
  scoreButton.classList.add("score-button");
  scoreButton.textContent = "score board";
  scoreButton.addEventListener("click", () => {
    window.location.href = "scoreboard.html";
  });
  //---
  const restartButton = document.createElement("button");
  restartButton.classList.add("restart-button");
  restartButton.textContent = "Restart";
  restartButton.addEventListener("click", () => {
    location.reload();
  });
  //--
  const backButton = document.createElement("button");
  backButton.classList.add("back-button");
  backButton.textContent = "Back";
  backButton.addEventListener("click", () => {
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
let isLeftKeyPressed = false;
let isRightKeyPressed = false;
function onKeyDown(event: KeyboardEvent) {
  if (event.key === "ArrowLeft" || event.key === "a") {
    isLeftKeyPressed = true;
  } else if (event.key === "ArrowRight" || event.key === "d") {
    isRightKeyPressed = true;
  }
}
function onKeyUp(event: KeyboardEvent) {
  if (event.key === "ArrowLeft" || event.key === "a") {
    isLeftKeyPressed = false;
  } else if (event.key === "ArrowRight" || event.key === "d") {
    isRightKeyPressed = false;
  }
}
//--
//jump
let isFirstJump=true;
function onKeyPress(event: KeyboardEvent) {
  if (event.key === " ") {
    if (isFirstJump){
      player.jump();
      isFirstJump=false}
    else{
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
let updateInterval: number;

let hasStartedJumping = false; // Flag to track if the player has started jumping

const backgroundImages = [
  "../../images/Ladder.jpg", // Default background image
  "../../images/cloud-sky.jpg",
  "../../images/space.jpg"
  // Background image when player reaches a certain position
  // Add more background image URLs as needed
]; 
let currentBackgroundIndex = 0;

// Update function
function update() {

  if (!gameOver) {
    renderScore() ;
  
    if (player.score >= 10 && currentBackgroundIndex === 0) {
      // Change the background image when player's score reaches 100 and the current background is the default one
      currentBackgroundIndex = 1;
      canvas.style.backgroundImage = `url('${backgroundImages[currentBackgroundIndex]}')`;
    } else if (player.score >=20 && currentBackgroundIndex === 1) {
      // Change the background image when player's score reaches 200 and the current background is the second one
      currentBackgroundIndex = 2;
      canvas.style.backgroundImage = `url('${backgroundImages[currentBackgroundIndex]}')`;
    }
   
  

    if (isLeftKeyPressed) {
      player.x -= 5;
    } else if (isRightKeyPressed) {
      player.x += 5;
    }

    if (player.y < canvas.height / 100) {
      canvasOffsetY = canvas.height / 100;
    }

    if (hasStartedJumping) {
      floors.forEach((floor) => (floor.speedY = 2));
      bombs.forEach((bomb) => (bomb.speedY = 2));
      coins.forEach((coin) => (coin.speedY = 2));

      if (player.y < canvas.height / 2 && player.isJumping) {
        canvasOffsetY += 1;
      }
    }

    player.update();

    
    let floorCollision = false;
    let targetFloorId :number|null = null; // Keep track of the ID of the target floor

    // Check for collisions with floors
    for (const floor of floors) {
      if (
        player.x + player.width > floor.x &&
        player.x < floor.x + floor.width &&
        player.y + player.velocityY + player.height >= floor.y &&
        player.y + player.velocityY < floor.y + floor.height
      ) {
        floorCollision = true;
        targetFloorId = floor.id;
        break;
      }
    }

    if (targetFloorId !== null && (player.isJumping || player.velocityY >= 0)) {
      const targetFloor = floors.find((floor) => floor.id === targetFloorId);
      if (targetFloor && Math.abs(player.y + player.velocityY + player.height - targetFloor.y) <= 5) {
        player.y = targetFloor.y - player.height;
        player.velocityY = 0;
        player.isJumping = false;
        player.rotation = 0;
        canvasOffsetY = 0; // Reset the vertical offset when the player lands on the ground.
      } else {
        player.y += player.velocityY;
      }
    }

    if (floorCollision && player.rotation !== 0) {
      const targetFloor = floors.find((floor) => floor.id === targetFloorId);
      if (targetFloor) {
        if (
          player.x + player.width >= targetFloor.x &&
          player.x <= targetFloor.x + targetFloor.width
        ) {
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
    } else if (player.y + player.height < canvas.height / 2) {
      generateFloor();
    }

    generateBomb();
    removeBombs();
    const isBomb = checkCollisionBomb();
    if (isBomb) {
      player.score--;
    }

    generateCoin();
    removeCoins();
    const isCoin = checkCollisionCoin();
    if (isCoin) {
      player.score++;
    }

    if (player.y >= canvas.height) {
      gameOver = true;
      games.push(new Game(player.userName, player.score, new Date(player.date)));
      // save to local
      const arrayJSON = JSON.stringify(games);
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
    for (const floor of floors) {
      floor.draw(ctx);
      floor.newPos();
      if (gameOver) floor.speedY = 0;
    }

    for (const bomb of bombs) {
      bomb.drawBomb(ctx);
      bomb.newPos();
      if (gameOver) bomb.speedY = 0;
    }

    for (const coin of coins) {
      coin.animation(ctx);
      coin.newPos();
      if (gameOver) coin.speedY = 0;
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
  const html = document.querySelector("#score");
  //const  = localStorage.getItem("");
  try {
    if (!html) throw new Error("no element");
    html.innerHTML = `<h2>${player.userName} your current score is: ${player.score}</h2>`;
  } catch (error) {
    console.error(error);
  }
}

//------------------check collision-----------------------------
function checkCollisionBomb() {
  let bombCollision = false;
  let targetBombId: number | null = null; // Keep track of the ID of the target floor

  for (const bomb of bombs) {
    if (
      bomb.x < player.x + player.width &&
      bomb.x + bomb.width > player.x &&
      bomb.y + bomb.height > player.y
    ) {
      bombCollision = true;
      console.log(`collosion bomb`)
      targetBombId = bomb.idB; // Save the ID of the target bomb
      console.log(`targetBombId:`, targetBombId)
      bombs = bombs.filter((bomb) => (bomb.idB !== targetBombId)); // Remove the bomb that hit 

      return bombCollision;
    }
  }
}

function checkCollisionCoin() {
  let coinCollision = false;
  let targetCoinId: number | null = null; // Keep track of the ID of the target floor

  for (const coin of coins) {
    if (
      coin.x < player.x + player.width &&
      coin.x + coin.width > player.x &&
      coin.y + coin.height > player.y
    ) {
      coinCollision = true;
      console.log(`collosion coin`)
      targetCoinId = coin.idC; // Save the ID of the target coin
      console.log(`targetCoinId:`, targetCoinId)
      coins = coins.filter((coin) => (coin.idC !== targetCoinId)); // Remove the bomb that hit 

      return coinCollision;
    }
  }
}
