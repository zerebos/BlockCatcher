import Renderer from "./utils/renderer";
import Player from "./player";
import Block from "./block";
import Keyboard from "./utils/keyboard";
import HUD from "./hud";
import {SCORE_THRESHOLD, MAX_SECONDS} from "./config";
import "./styles/index.css";


export default new class Game {
    constructor() {
        this.tick = this.tick.bind(this);
        this.processTimer = this.processTimer.bind(this);
        this.startTimer = this.startTimer.bind(this);
        this.startGame = this.startGame.bind(this);
        this.initialize = this.initialize.bind(this);

        this.state = {
            score: 0,
            started: false,
            timeLeft: MAX_SECONDS,
            lastFrame: performance.now(),
        };

        document.addEventListener("DOMContentLoaded", this.initialize);
        Keyboard.subscribe(" ", this.startGame);
        Keyboard.trackKeys("ArrowLeft", "ArrowRight");
    }

    initialize() {
        /** @type {HUD} */
        this.HUD = new HUD(MAX_SECONDS);

        /** @type {Renderer} */
        this.renderer = new Renderer(document.getElementById("gl-canvas"));

        /** @type {Player} */
        this.player = new Player(this.renderer); // create new player

        /** @type {Block[]} */
        this.blocks = [];

        this.tick(performance.now()); // initial paint
    }

    tick(frameStart) {
        // Tick the game
        const timestep = frameStart - this.state.lastFrame;
        this.state.lastFrame = frameStart;
        const playerDirection = Keyboard.state.ArrowLeft ? -1 : Keyboard.state.ArrowRight ? 1 : 0;
        this.player.step(timestep, !this.state.started ? 0 : playerDirection);
        
        for (let i = 0; i < this.blocks.length; i++) {
            this.blocks[i].step(timestep);
            
            if (this.player.collides(this.blocks[i])) {
                this.addScore(this.blocks[i].blockData.points);
                this.blocks.splice(i, 1);
                i--;
            }
            else if (this.blocks[i].y <= -1.0) {
                this.blocks.splice(i, 1);
                i--;
            }
        }

        // Redraw everything
        this.renderer.clearColorBuffer();
        this.renderer.draw(this.player);
        for (let i = 0; i < this.blocks.length; i++) this.renderer.draw(this.blocks[i]);
        
        // Call for next tick
        window.requestAnimationFrame(this.tick);
    }

    startGame() {
        if (this.state.started) return;
        this.state.started = true;
        this.state.score = 0;
        this.HUD.startGame();
        this.startTimer();
    }

    addScore(toAdd) {
        this.state.score = this.state.score + toAdd;
        this.HUD.updateScore(this.state.score);
    }

    endGame() {
        if (!this.state.started) return;
        this.state.started = false;
        clearInterval(this.timer);
        this.HUD.gameOver(this.state.score >= SCORE_THRESHOLD);
        this.blocks.splice(0, this.blocks.length);
    }

    startTimer() {
        this.state.timeLeft = MAX_SECONDS;
        this.timer = setInterval(() => {
            if (--this.state.timeLeft < 0) this.state.timeLeft = 0;
            this.HUD.updateTime(this.state.timeLeft);
            this.processTimer(this.state.timeLeft);
        }, 1000);
    }

    processTimer(timeRemaining) {
        if (!timeRemaining) return this.endGame();
        this.blocks.push(new Block(this.renderer));
    }
};