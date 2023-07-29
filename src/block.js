import {vec2} from "./utils/vectors";
import Rectangle from "./utils/rectangle";

import {BLOCKS} from "./config";


const minSize = 0.1;
export default class Block extends Rectangle {
    constructor(webgl) {
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
        this.buffer = webgl.createBuffer();
        webgl.bindBuffer(webgl.ARRAY_BUFFER, this.buffer);
        webgl.bufferData(webgl.ARRAY_BUFFER, Float32Array.from(this.points.flat()), webgl.STATIC_DRAW);
    }

    get uniforms() {
        return {
            xshift: 0,
            yshift: this.shiftY,
            color: this.blockData.color,
        };
    }

    step(timediff, upward = false) {
        let change = upward ? this.deltaTrans : -this.deltaTrans;
        change *= timediff / 25;
        this.shiftY += change;
        for (let i = 0; i < this.points.length; i++) {
            this.points[i][1] = this.points[i][1] + change;
        }
    }
}