import Renderer from "./utils/renderer";
import Player from "./entities/player";
import Block from "./entities/block";
import ObjectPool from "./utils/object-pool";
import Keyboard from "./utils/keyboard";
import DOMManager from "./utils/dom-manager";
import AudioManager from "./audio";
import {SCORE_THRESHOLD, MAX_SECONDS, BLOCK_INTERVAL} from "./config";


export default new class Game {

    domManager!: DOMManager;
    audioManager!: AudioManager;
    renderer!: Renderer;
    player!: Player;
    blocks!: Block[];
    blockPool!: ObjectPool<Block>;
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
        // Initialize DOM manager first
        this.domManager = new DOMManager();
        if (!this.domManager.initialize()) {
            throw new Error("Failed to initialize DOM elements");
        }

        // Initialize audio manager
        this.audioManager = new AudioManager();
        this.domManager.updateAudioButton(this.audioManager.isEnabled());
        this.domManager.addAudioToggleListener(() => {
            this.audioManager.toggleMute((enabled) => {
                this.domManager.updateAudioButton(enabled);
            });
        });

        // Initialize game UI
        this.domManager.initializeGameUI(MAX_SECONDS);

        /** @type {Renderer} */
        this.renderer = new Renderer(this.domManager.getCanvas());

        /** @type {Player} */
        this.player = new Player(this.renderer); // create new player

        /** @type {Block[]} */
        this.blocks = [];

        /** @type {ObjectPool<Block>} */
        this.blockPool = new ObjectPool(() => new Block(this.renderer), 20, 50);

        this.tick(performance.now()); // initial paint
        this.renderer.drawWithStroke(this.player); // paint player initially

        // Set focus to canvas for keyboard accessibility
        this.domManager.focusCanvas();
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
        this.domManager.updateTime(this.state.timeLeft);
        if (this.state.timeLeft <= 0) {
            this.endGame();
            window.requestAnimationFrame(this.tick);
            return;
        }

        // Process block spawning
        this.state.blockSpawn = Math.max(0, this.state.blockSpawn - timestep);
        if (this.state.blockSpawn <= 0) {
            const newBlock = this.blockPool.acquire();
            if (newBlock) {
                this.blocks.push(newBlock);
            }
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
                this.blockPool.release(this.blocks[i]);
                this.blocks.splice(i, 1);
                i--;
            }
            else if (this.blocks[i].y <= -1.0) {
                this.blockPool.release(this.blocks[i]);
                this.blocks.splice(i, 1);
                i--;
            }
        }

        // Redraw everything
        this.renderer.clearColorBuffer();
        this.renderer.drawWithStroke(this.player);
        for (let i = 0; i < this.blocks.length; i++) this.renderer.drawWithStroke(this.blocks[i]);

        // Call for next tick
        window.requestAnimationFrame(this.tick);
    }

    startGame() {
        if (this.state.started) return this.togglePause();

        // Resume audio context on user interaction
        this.audioManager.resumeAudio();

        this.state.timeLeft = MAX_SECONDS;
        this.state.blockSpawn = BLOCK_INTERVAL;
        this.state.paused = false;
        this.state.started = true;
        this.state.score = 0;
        this.domManager.startGameUI(MAX_SECONDS);

        // Play game start sound
        this.audioManager.playGameStart();
    }

    addScore(toAdd: number) {
        this.state.score = this.state.score + toAdd;
        this.domManager.updateScore(this.state.score);

        // Play block catch sound with pitch based on points
        this.audioManager.playBlockCatch(toAdd);
    }

    endGame() {
        if (!this.state.started) return;
        this.state.started = false;
        const won = this.state.score >= SCORE_THRESHOLD;
        this.domManager.endGameUI(won);

        // Play appropriate ending sound
        if (won) {
            this.audioManager.playVictory();
        }
        else {
            this.audioManager.playGameOver();
        }

        // Return all active blocks to the pool
        for (const block of this.blocks) {
            this.blockPool.release(block);
        }
        this.blocks.splice(0, this.blocks.length);
    }

    togglePause() {
        if (!this.state.started) return;
        this.state.paused = !this.state.paused;
        this.domManager.togglePauseUI(this.state.paused);
    }
};