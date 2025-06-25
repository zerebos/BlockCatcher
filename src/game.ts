import Renderer from "./utils/renderer";
import Player from "./player";
import Block from "./block";
import Keyboard from "./utils/keyboard";
import HUD from "./hud";
import {SCORE_THRESHOLD, MAX_SECONDS, BLOCK_INTERVAL} from "./config";


export default new class Game {

    HUD!: HUD;
    renderer!: Renderer;
    player!: Player;
    blocks!: Block[];
    state: {
        score: number;
        started: boolean;
        timeLeft: number;
        lastFrame: number;
        blockSpawn: number;
        paused: boolean;
    };

    constructor() {
        this.tick = this.tick.bind(this);
        this.startGame = this.startGame.bind(this);
        this.initialize = this.initialize.bind(this);
        this.togglePause = this.togglePause.bind(this);

        this.state = {
            score: 0,
            started: false,
            timeLeft: MAX_SECONDS,
            lastFrame: performance.now(),
            blockSpawn: BLOCK_INTERVAL,
            paused: false,
        };

        document.addEventListener("DOMContentLoaded", this.initialize);
        Keyboard.subscribe(" ", this.startGame);
        Keyboard.trackKeys("ArrowLeft", "ArrowRight");
    }

    initialize() {
        /** @type {HUD} */
        this.HUD = new HUD(MAX_SECONDS);

        /** @type {Renderer} */
        this.renderer = new Renderer(document.getElementById("gl-canvas") as HTMLCanvasElement); // create new renderer

        /** @type {Player} */
        this.player = new Player(this.renderer); // create new player

        /** @type {Block[]} */
        this.blocks = [];

        this.tick(performance.now()); // initial paint
        this.renderer.draw(this.player); // ppaint player initially

        // Set focus to canvas for keyboard accessibility
        const canvas = document.getElementById("gl-canvas") as HTMLCanvasElement;
        canvas?.focus();
    }

    tick(frameStart: number) {

        // Skip game logic if paused
        if (this.state.paused || !this.state.started) {
            this.state.lastFrame = frameStart;
            window.requestAnimationFrame(this.tick);
            return;
        }

        // Process time left
        const timestep = frameStart - this.state.lastFrame;
        this.state.lastFrame = frameStart;
        this.state.timeLeft = Math.max(0, this.state.timeLeft - (timestep / 1000));
        this.HUD.updateTime(this.state.timeLeft);
        if (this.state.timeLeft <= 0) {
            this.endGame();
            window.requestAnimationFrame(this.tick);
            return;
        }

        // Process block spawning
        this.state.blockSpawn = Math.max(0, this.state.blockSpawn - timestep);
        if (this.state.blockSpawn <= 0) {
            this.blocks.push(new Block(this.renderer));
            this.state.blockSpawn = BLOCK_INTERVAL;
        }

        // Process player movement
        const playerDirection = Keyboard.state.ArrowLeft ? -1 : Keyboard.state.ArrowRight ? 1 : 0;
        this.player.step(timestep, !this.state.started ? 0 : playerDirection);

        // Process block gravity and collisions
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
        if (this.state.started) return this.togglePause();
        this.state.timeLeft = MAX_SECONDS;
        this.state.blockSpawn = BLOCK_INTERVAL;
        this.state.paused = false;
        this.state.started = true;
        this.state.score = 0;
        this.HUD.startGame();
    }

    addScore(toAdd: number) {
        this.state.score = this.state.score + toAdd;
        this.HUD.updateScore(this.state.score);
    }

    endGame() {
        if (!this.state.started) return;
        this.state.started = false;
        this.HUD.gameOver(this.state.score >= SCORE_THRESHOLD);
        this.blocks.splice(0, this.blocks.length);
    }

    togglePause() {
        if (!this.state.started) return;
        this.state.paused = !this.state.paused;
        this.HUD.pauseGame(this.state.paused);
    }
};