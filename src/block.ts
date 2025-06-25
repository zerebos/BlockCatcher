import {vec2} from "./utils/vectors";
import Rectangle from "./utils/rectangle";

import {BLOCKS} from "./config";
import type Renderer from "./utils/renderer";


const minSize = 0.1;

/**
 * Block class representing a falling block in the game.
 */
export default class Block extends Rectangle {

    blockData: typeof BLOCKS[0];
    shiftY: number;
    deltaTrans: number;
    buffer: WebGLBuffer;

    /**
     * Creates a new Block instance.
     * @param renderer - The renderer to create the buffer for the block.
     */
    constructor(renderer: Renderer) {
        const blockID = Math.floor((Math.random() * BLOCKS.length));
        const blockData = BLOCKS[blockID];
        const startX = (Math.random() * (1 - (minSize * blockData.size) + 1)) - 1;

        super([
            vec2(startX, 1.01 + (minSize * blockData.size)),
            vec2(startX + (minSize * blockData.size), 1.01 + (minSize * blockData.size)),
            vec2(startX + (minSize * blockData.size), 1.01),
            vec2(startX, 1.01)
        ]);

        this.blockData = blockData;

        this.shiftY = 0;
        this.deltaTrans = 0.010 * this.blockData.speed;
        this.buffer = renderer.createBuffer(this.points);
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
}