/*

Created by:
Zack Rauen

*/
var player;
var blocks = [];
var gl;

var display,scoreDisplay,statusDisplay,playDisplay;

var score = 0, scoreThreshold = 250;
var SetTime = 60;
var gameStarted = false;

function initializeGame() {

	display = document.getElementById("time");
	scoreDisplay = document.getElementById("score");
	statusDisplay = document.getElementById("status");
	playDisplay = document.getElementById("play");
	
    var canvas=document.getElementById("gl-canvas");
    gl=WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert( "WebGL is not available" ); }
    
    gl.viewport(0, 0, 512, 512); // set size of viewport
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // background black
    gl.clear(gl.COLOR_BUFFER_BIT); // allows color
	
	
	player = new Player(gl); // create new player
	player.render();

	render();
}

function handleKey(event) {
	var keyCode = event.keyCode;
	if (keyCode == 32) { // SPACE
		startGame();
	}
	else if (keyCode == 37) { // LEFT
		player.moveX(false);
	}
	else if (keyCode == 38) { // UP
		player.moveY(true);
	}
	else if (keyCode == 39) { // RIGHT
		player.moveX(true);
	}
	else if (keyCode == 40) { // DOWN
		player.moveY(false);
	}
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT); // allows color
	player.render();
	for (var i=0;i<blocks.length;i++) {
		blocks[i].render();
		if (blocks[i].points[blocks[i].rightBottomMax][1] <= player.points[player.leftTopMax][1] && blocks[i].points[blocks[i].leftTopMax][1] >= player.points[player.rightBottomMax][1] &&
			blocks[i].points[blocks[i].rightBottomMax][0] >= player.points[player.leftTopMax][0] && blocks[i].points[blocks[i].leftTopMax][0] <= player.points[player.rightBottomMax][0]) {
			score += blocks[i].blockData.points;
			scoreDisplay.textContent = score;
			blocks.splice(i,1);
		}
		else if (blocks[i].points[blocks[i].leftTopMax][1] <= -1.0) {
			blocks.splice(i,1);
		}
	}
	window.requestAnimFrame(render);
}
var gameTimer;
function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    gameTimer = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;
		
		SpawnBlocks(timer);

        if (--timer < 0) {
            timer = 0;
        }
    }, 1000);
}

function startGame() {
	if (gameStarted == false) {
		gameStarted = true;
		score = 0;
		scoreDisplay.textContent = score;
		statusDisplay.textContent = "Playing...";
		statusDisplay.style.color = "gray";
		playDisplay.textContent = "";
		startTimer(SetTime, display);
	}
}

function SpawnBlocks(timer) {
	if (timer != 0) {
		blocks.push(new Block(gl));
	}
	else {
		blocks.splice(0,blocks.length);
		clearInterval(gameTimer);
		display.textContent = "01:00";
		gameStarted = false;
		if (score >= scoreThreshold) {
			statusDisplay.textContent = "YOU WON!";
			statusDisplay.style.color = "green";
		}
		else {
			statusDisplay.textContent = "YOU LOST!";
			statusDisplay.style.color = "red";
		}
		playDisplay.textContent = "Press SPACE to play again!";
	}
}