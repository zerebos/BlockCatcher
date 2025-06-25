import {vec2} from "./utils/vectors";
import Rectangle from "./utils/rectangle";

import {PLAYER_COLOR} from "./config";
import type Renderer from "./utils/renderer";


/**
 * Player class representing the player in the game.
 * It extends the Rectangle class to represent the player's shape and movement.
 */
export default class Player extends Rectangle {

    velocity = 0;
    shiftX = 0;
    deltaTrans = 0.03;
    buffer: WebGLBuffer;

    constructor(renderer: Renderer) {
        super([
            vec2(-0.15, -0.925),
            vec2(0.15, -0.925),
            vec2(0.15, -0.975),
            vec2(-0.15, -0.975)
        ]);

        this.buffer = renderer.createBuffer(this.points);
    }

    get uniforms() {
        return {
            xshift: this.shiftX,
            yshift: 0,
            color: PLAYER_COLOR,
        };
    }

    step(timestep: number, direction: 1 | -1 | 0) {
        let change = direction * this.deltaTrans;
        change *= timestep / 25;
        if (this.topLeft[0] + change >= -1.01 && this.bottomRight[0] + change < 1.01) {
            this.shiftX += change;
            for (let i = 0; i < this.points.length; i++) {
                this.points[i][0] = this.points[i][0] + change;
            }
        }
    }
}