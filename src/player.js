import {vec2} from "./utils/vectors";
import Rectangle from "./utils/rectangle";

import {PLAYER_COLOR} from "./config";


export default class Player extends Rectangle {
    constructor(webgl) {
        super([
            vec2(-0.15, -0.925),
            vec2(0.15, -0.925),
            vec2(0.15, -0.975),
            vec2(-0.15, -0.975)
        ]);

        this.velocity = 0;
        this.shiftX = 0;
        this.deltaTrans = 0.03;
        this.buffer = webgl.createBuffer();
        webgl.bindBuffer(webgl.ARRAY_BUFFER, this.buffer);
        webgl.bufferData(webgl.ARRAY_BUFFER, Float32Array.from(this.points.flat()), webgl.STATIC_DRAW);
    }

    get uniforms() {
        return {
            xshift: this.shiftX,
            yshift: 0,
            color: PLAYER_COLOR,
        };
    }

    step(timestep, direction) {
        let change = direction * this.deltaTrans;
        change *= timestep / 25;
        if (this.x + change >= -1.01 && this.bottomRight[0] + change < 1.01) {
            this.shiftX += change;
            for (let i = 0; i < this.points.length; i++) {
                this.points[i][0] = this.points[i][0] + change;
            }
        }
    }
}