const remote = require('electron').remote;
const {ipcRenderer} = require('electron');

var animFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame    || window.oRequestAnimationFrame      || window.msRequestAnimationFrame     || null ;

var images = [
    {
        "name" : "player",
        "image" : "https://s11.postimg.org/aajryhab7/Edd.png",
        "width" : 60,
        "height" : 60,
        "mWidth" : 60,
        "mHeight" : 60,
        "timing" : 0
    },
    {
        "name" : "obstacle",
        "image" : "https://s4.postimg.org/gofzfav7h/ticket_480.png",
        "width" : 140,
        "height" : 659,
        "mWidth" : 140,
        "mHeight" : 659,
        "timing" : 0
    }
]

var spriter = new Spriter();

spriter.loadSprites(images);

//game vars
let player = { x: 20, y: 400, force: 0, speed: 4, size: 60, colour: "#ff0000" };
let startPos = 1800;
let obstacles = [ {x: startPos, yGap: 300, size:500 }, {x: startPos + 800, yGap: 500, size:400 }, {x: startPos + 1600, yGap: 400, size:300 } ];
var score = 0;
var checkPos = 0;

window.addEventListener('keydown', function(event) { if(event.key == " ") { player.force = 14; } }, false);

//Creating instances of canvas and the canvas' 2d drawing
var c = document.getElementById("canvas");
var ctx = c.getContext("2d");

function mainLoop() {
  drawBackground();
  drawObstacles();
  drawPlayer();
  drawScore();
}

function drawBackground() {
    ctx.fillStyle="#b3ffff";
    ctx.fillRect(0, 0, c.width, c.height);
}

function drawPlayer() {
    var sprite = spriter.getSprite("player");
    ctx.drawImage(sprite.image,sprite.x,sprite.y,sprite.width,sprite.height,200, player.y,sprite.width,sprite.height);
}

function drawObstacles() {
    for (let obstacle of obstacles) {
        var sprite = spriter.getSprite("obstacle");
        ctx.drawImage(sprite.image,sprite.x,sprite.y,sprite.width,sprite.height,obstacle.x, obstacle.yGap - 660,sprite.width,sprite.height);
        ctx.drawImage(sprite.image,sprite.x,sprite.y,sprite.width,sprite.height,obstacle.x, obstacle.yGap + obstacle.size,sprite.width,sprite.height);

    }
}

function drawScore() {
    ctx.fillStyle="#000";
    ctx.font="30px Arial";
    ctx.fillText("Score: " + score, 1300, 1100);
}

//This loops the animation frames for animation
var recursiveAnim = function() {
          mainLoop();
          animFrame(recursiveAnim);
    };


function checkLoss() {
    //if touched the floor
    if (player.y > c.height - 20) {
        loseGame();
    } else {
        //if touching a obstacle
        checkCollision();
    }
}

function movePlayer() {
    if (player.y > 0) {
        if (player.force > 0) {
            //stop player off top of screen
            if (player.y - 30 > 0) {
                player.y -= 14;
            }
            //decrease the up force
            player.force -= 1;
        } else {
            //fake drop physics
            player.y += 6;
        }
        //move obstacles
        for (let obstacle of obstacles) {
            obstacle.x -= player.speed;
        }
    } else {
        //if player outside game
        player.y = 1;
    }
}

function checkCollision() {
    for (let obstacle of obstacles) {
        //if the x is inside
        if (player.x + player.size > obstacle.x - 180 && player.x < obstacle.x - 40) {
            if (player.y + player.size > obstacle.yGap + obstacle.size + 4 || player.y < obstacle.yGap - 4) {
                loseGame();
            }
        }
    }
}

function clearObstacles() {
    for (var i = 0; i < obstacles.length; i++) {
        if (obstacles[i].x < -500)
            obstacles.splice(i, 1);
    }
}

function loseGame() {
    ipcRenderer.send('addScore', score);
    checkPos = 0;
    score = 0;
    window.alert("You've missed your train!");
    obstacles = [ {x: startPos, yGap: 300, size:500 }, {x: startPos + 800, yGap: 500, size:400 }, {x: startPos + 1500, yGap: 400, size:300 } ];
    player.x = 20;
    player.y = 400;
    player.force = 0;
}

function createNewObstacle() {
    var obstacle = {
        x: startPos,
        yGap: Math.floor(Math.random() * 500) + 200,
        size: 300
    }

    obstacles.push(obstacle);
}

function checkScore() {
    if (player.x > obstacles[checkPos].x) {
        score++;
        checkPos++;
        if (score > 1)
            createNewObstacle();
    }
}


function gameEngine() {
    movePlayer();

    checkScore();
    //clearObstacles();

    checkLoss();

    //loops the engine
    setTimeout(function () {
		//Recursively loop
        gameEngine();
	}, 10);
}


function checkLoaded() {
    if (spriter.checkLoaded()) {
        gameEngine();
        animFrame(recursiveAnim);
    } else {
        ctx.fillText("Loading", 300, 300);
        //loops the engine
        setTimeout(function () {
    		//Recursively loop
            checkLoaded();
    	}, 40);
    }
}

checkLoaded();
