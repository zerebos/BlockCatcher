import {vec2} from "./utils/vectors";
import Rectangle from "./utils/rectangle";
import {type Poolable} from "./utils/object-pool";

import {BLOCKS} from "./config";
import type Renderer from "./utils/renderer";


const minSize = 0.1;

/**
 * Block class representing a falling block in the game.
 */
export default class Block extends Rectangle implements Poolable {

    blockData: typeof BLOCKS[0];
    shiftY: number;
    deltaTrans: number;
    buffer: WebGLBuffer;
    private active: boolean = false;
    private renderer: Renderer;

    /**
     * Creates a new Block instance.
     * @param renderer - The renderer to create the buffer for the block.
     */
    constructor(renderer: Renderer) {
        // Initialize with default values - will be set properly in reset()
        super([
            vec2(0, 0),
            vec2(0, 0),
            vec2(0, 0),
            vec2(0, 0)
        ]);

        this.renderer = renderer;
        this.blockData = BLOCKS[0]; // Default, will be overridden in reset()
        this.shiftY = 0;
        this.deltaTrans = 0;
        this.buffer = renderer.createBuffer(this.points);
        this.active = false;

        // Initialize the block to a valid, usable state
        this.reset();
    }

    get uniforms() {
        return {
            xshift: 0,
            yshift: this.shiftY,
            color: this.blockData.color,
        };
    }

    step(timediff: number, upward = false) {
        let change = upward ? this.deltaTrans : -this.deltaTrans;
        change *= timediff / 25;
        this.shiftY += change;
        for (let i = 0; i < this.points.length; i++) {
            this.points[i][1] = this.points[i][1] + change;
        }
    }

    /**
     * Reset the block to initial state for reuse (Poolable interface)
     */
    reset(): void {
        // Generate new random block properties
        const blockID = Math.floor((Math.random() * BLOCKS.length));
        this.blockData = BLOCKS[blockID];
        const startX = (Math.random() * (1 - (minSize * this.blockData.size) + 1)) - 1;

        // Reset position
        this.points = [
            vec2(startX, 1.01 + (minSize * this.blockData.size)),
            vec2(startX + (minSize * this.blockData.size), 1.01 + (minSize * this.blockData.size)),
            vec2(startX + (minSize * this.blockData.size), 1.01),
            vec2(startX, 1.01)
        ];

        // Reset movement properties
        this.shiftY = 0;
        this.deltaTrans = 0.010 * this.blockData.speed;
        this.active = true;

        // Update the existing WebGL buffer with new data
        this.renderer.webgl.bindBuffer(this.renderer.webgl.ARRAY_BUFFER, this.buffer);
        this.renderer.webgl.bufferData(
            this.renderer.webgl.ARRAY_BUFFER,
            Float32Array.from(this.points.flat()),
            this.renderer.webgl.STATIC_DRAW
        );
    }

    /**
     * Check if the block is currently active (Poolable interface)
     */
    isActive(): boolean {
        return this.active;
    }

    /**
     * Prepare the block for return to pool (Poolable interface)
     */
    prepareForPool(): void {
        this.active = false;
        // Don't call reset here - that's for when we take it from the pool
    }
}