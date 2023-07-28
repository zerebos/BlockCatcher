import Player from "./player";
import Block from "./block";
import "./styles/index.css";


const SCORE_THRESHOLD = process.env.PROD ? 500 : 1;
const MAX_SECONDS = process.env.PROD ? 60 : 10;

/** @type {Player} */
let player;
const blocks = [];

/** @type {WebGLRenderingContext} */
let gl;

const keyEnum = {UP: 0, DOWN: 1, LEFT: 2, RIGHT: 3};
const keyArray = new Array(4);

let display, scoreDisplay, statusDisplay, playDisplay;

let score = 0;
let gameStarted = false;
let lastFrame = performance.now();
let gameTimer;

export default new class Game {
    constructor() {
        this.render = this.render.bind(this);
        this.spawnBlocks = this.spawnBlocks.bind(this);
        this.keyDown = this.keyDown.bind(this);
        this.keyUp = this.keyUp.bind(this);
        this.startTimer = this.startTimer.bind(this);
        this.startGame = this.startGame.bind(this);
        this.initialize = this.initialize.bind(this);

        document.addEventListener("DOMContentLoaded", this.initialize);
        document.addEventListener("keyup", this.keyUp);
        document.addEventListener("keydown", this.keyDown);
    }

    initialize() {
        display = document.getElementById("time");
        scoreDisplay = document.getElementById("score");
        statusDisplay = document.getElementById("status");
        playDisplay = document.getElementById("play");
        
        /** @type {HTMLCanvasElement} */
        const canvas = document.getElementById("gl-canvas");
        gl = canvas.getContext("webgl");
        if (!gl) alert("WebGL is not available");
        
        gl.viewport(0, 0, 512, 512); // set size of viewport
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // background black
        gl.clear(gl.COLOR_BUFFER_BIT); // allows color
        
        const timestep = lastFrame;
        player = new Player(gl); // create new player
        player.render(false, false, 0);

        this.render(timestep);
    }

    keyDown(event) {
        const keyCode = event.keyCode;
    
        if (keyCode == 32) { // SPACE
            event.preventDefault();
        }
        else if (keyCode == 37) { // LEFT
            event.preventDefault();
            keyArray[keyEnum.LEFT] = true && gameStarted;
        }
        else if (keyCode == 38) { // UP
            event.preventDefault();
            keyArray[keyEnum.UP] = true && gameStarted;
        }
        else if (keyCode == 39) { // RIGHT
            event.preventDefault();
            keyArray[keyEnum.RIGHT] = true && gameStarted;
        }
        else if (keyCode == 40) { // DOWN
            event.preventDefault();
            keyArray[keyEnum.DOWN] = true && gameStarted;
        }
    }

    keyUp(event) {
        const keyCode = event.keyCode;
        if (keyCode == 32) { // SPACE
            event.preventDefault();
            this.startGame();
        }
        else if (keyCode == 37) { // LEFT
            event.preventDefault();
            keyArray[keyEnum.LEFT] = false;
        }
        else if (keyCode == 38) { // UP
            event.preventDefault();
            keyArray[keyEnum.UP] = false;
        }
        else if (keyCode == 39) { // RIGHT
            event.preventDefault();
            keyArray[keyEnum.RIGHT] = false;
        }
        else if (keyCode == 40) { // DOWN
            event.preventDefault();
            keyArray[keyEnum.DOWN] = false;
        }
    }

    render(frameStart) {
        const timestep = frameStart - lastFrame;
        lastFrame = frameStart;
        gl.clear(gl.COLOR_BUFFER_BIT); // allows color
        player.render(keyArray[keyEnum.LEFT], keyArray[keyEnum.RIGHT], timestep);
        for (let i = 0; i < blocks.length; i++) {
            blocks[i].render(timestep);
            if (blocks[i].points[blocks[i].rightBottomMax][1] <= player.points[player.leftTopMax][1] && blocks[i].points[blocks[i].leftTopMax][1] >= player.points[player.rightBottomMax][1]
                && blocks[i].points[blocks[i].rightBottomMax][0] >= player.points[player.leftTopMax][0] && blocks[i].points[blocks[i].leftTopMax][0] <= player.points[player.rightBottomMax][0]) {
                score += blocks[i].blockData.points;
                scoreDisplay.textContent = score;
                blocks.splice(i,1);
                i--;
            }
            else if (blocks[i].points[blocks[i].leftTopMax][1] <= -1.0) {
                blocks.splice(i,1);
                i--;
            }
        }
        // console.log(performance.now())
        window.requestAnimationFrame(this.render);
    }

    startTimer(duration, timeDisplay) {
        let timer = duration, minutes, seconds;
        gameTimer = setInterval(() => {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);
    
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
    
            timeDisplay.textContent = minutes + ":" + seconds;
            
            // console.log(this);
            this.spawnBlocks(timer);
    
            if (--timer < 0) {
                timer = 0;
            }
        }, 1000);
    }

    startGame() {
        if (gameStarted == false) {
            gameStarted = true;
            score = 0;
            scoreDisplay.textContent = score;
            // statusDisplay.textContent = "Playing...";
            // statusDisplay.style.color = "gray";
            statusDisplay.classList.remove("win");
            statusDisplay.classList.remove("loss");
            // playDisplay.textContent = "";
            playDisplay.parentElement.style.opacity = 0;
            this.startTimer(MAX_SECONDS, display);
        }
    }

    spawnBlocks(timer) {
        if (timer != 0) {
            blocks.push(new Block(gl));
        }
        else {
            blocks.splice(0,blocks.length);
            clearInterval(gameTimer);
            display.textContent = "01:00";
            gameStarted = false;
            if (score >= SCORE_THRESHOLD) {
                statusDisplay.textContent = "YOU WON!";
                statusDisplay.classList.add("win");
            }
            else {
                statusDisplay.textContent = "YOU LOST!";
                statusDisplay.classList.add("loss");
            }
            playDisplay.parentElement.style.opacity = "";
            playDisplay.textContent = "Press SPACE to play again!";
        }
    }
};