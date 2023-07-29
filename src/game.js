import Renderer from "./utils/renderer";
import Player from "./player";
import Block from "./block";
import Keyboard from "./utils/keyboard";
import {SCORE_THRESHOLD, MAX_SECONDS} from "./config";
import "./styles/index.css";


/** @type {Player} */
let player;
const blocks = [];



let display, scoreDisplay, statusDisplay, playDisplay;

let score = 0;
let gameStarted = false;
let lastFrame = performance.now();
let gameTimer;

export default new class Game {
    constructor() {
        this.tick = this.tick.bind(this);
        this.spawnBlocks = this.spawnBlocks.bind(this);
        this.startTimer = this.startTimer.bind(this);
        this.startGame = this.startGame.bind(this);
        this.initialize = this.initialize.bind(this);

        document.addEventListener("DOMContentLoaded", this.initialize);
        Keyboard.subscribe(" ", this.startGame);
        Keyboard.trackKeys("ArrowLeft", "ArrowRight");
    }

    initialize() {
        display = document.getElementById("time");
        scoreDisplay = document.getElementById("score");
        statusDisplay = document.getElementById("status");
        playDisplay = document.getElementById("play");
        
        /** @type {HTMLCanvasElement} */
        const canvas = document.getElementById("gl-canvas");

        /** @type {WebGLRenderingContext} */
        this.gl = canvas.getContext("webgl");
        if (!this.gl) alert("WebGL is not available");

        this.renderer = new Renderer(this.gl);
        
        this.gl.viewport(0, 0, 512, 512); // set size of viewport
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0); // background black
        this.gl.clear(this.gl.COLOR_BUFFER_BIT); // allows color
        
        const timestep = lastFrame;
        player = new Player(this.gl); // create new player

        this.tick(timestep);
    }

    tick(frameStart) {
        // Tick the game
        const timestep = frameStart - lastFrame;
        lastFrame = frameStart;
        const playerDirection = Keyboard.state.ArrowLeft ? -1 : Keyboard.state.ArrowRight ? 1 : 0;
        player.step(timestep, !gameStarted ? 0 : playerDirection);
        
        for (let i = 0; i < blocks.length; i++) {
            blocks[i].step(timestep);
            
            if (player.collides(blocks[i])) {
                score += blocks[i].blockData.points;
                scoreDisplay.textContent = score;
                blocks.splice(i, 1);
                i--;
            }
            else if (blocks[i].y <= -1.0) {
                blocks.splice(i, 1);
                i--;
            }
        }

        // Redraw everything
        this.gl.clear(this.gl.COLOR_BUFFER_BIT); // allows color
        this.renderer.draw(player);
        for (let i = 0; i < blocks.length; i++) this.renderer.draw(blocks[i]);
        
        // Call for next tick
        window.requestAnimationFrame(this.tick);
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
            blocks.push(new Block(this.gl));
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