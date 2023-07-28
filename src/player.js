import {vec2} from "./utils/vectors";
import vertexShaderSource from "./shaders/main.vert";
import fragmentShaderSource from "./shaders/main.frag";


const PLAYER_COLOR = [0, 1, 0];


export default class Player {
    constructor(webgl) {
        this.webgl = webgl;
        this.points = [vec2(-0.15, -0.925), vec2(0.15, -0.925), vec2(0.15, -0.975), vec2(-0.15, -0.975)];
        this.leftTopMax = 0;
        this.rightBottomMax = 2;
        this.shiftX = 0;
        this.shiftY = 0;
        this.deltaTrans = 0.03;
        this.buffer = this.webgl.createBuffer();
        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.buffer);
        this.webgl.bufferData(this.webgl.ARRAY_BUFFER, Float32Array.from(this.points.flat()), this.webgl.STATIC_DRAW);
        this.velocity = 0;
        
        this.attachShaders();
    }

    attachShaders() {
        const vertexShader = this.webgl.createShader(this.webgl.VERTEX_SHADER);
        this.webgl.shaderSource(vertexShader, vertexShaderSource);
        this.webgl.compileShader(vertexShader);
        
        const fragShader = this.webgl.createShader(this.webgl.FRAGMENT_SHADER);
        this.webgl.shaderSource(fragShader, fragmentShaderSource);
        this.webgl.compileShader(fragShader);
        
        this.shaderProgram = this.webgl.createProgram();
        this.webgl.attachShader(this.shaderProgram, vertexShader);
        this.webgl.attachShader(this.shaderProgram, fragShader);
        this.webgl.linkProgram(this.shaderProgram);
    }

    attachVariables() {
        const myPosition = this.webgl.getAttribLocation(this.shaderProgram, "myPosition");
        this.webgl.vertexAttribPointer(myPosition, 2, this.webgl.FLOAT, false, 0, 0);
        this.webgl.enableVertexAttribArray(myPosition);
        
        this.xshiftLoc = this.webgl.getUniformLocation(this.shaderProgram, "xshift");
        this.webgl.uniform1f(this.xshiftLoc,this.shiftX);
        this.yshiftLoc = this.webgl.getUniformLocation(this.shaderProgram, "yshift");

        this.colorLocation = this.webgl.getUniformLocation(this.shaderProgram, "u_color");
        this.webgl.uniform4f(this.colorLocation, ...PLAYER_COLOR, 1);
    }

    moveX(forward, timestep) {
        let change = forward ? this.deltaTrans : -this.deltaTrans;
        change *= timestep / 25;
        if (this.points[this.leftTopMax][0] + change >= -1.01 && this.points[this.rightBottomMax][0] + change < 1.01) {
            this.shiftX += change;
            for (let i = 0; i < this.points.length; i++) {
                this.points[i][0] = this.points[i][0] + change;
            }
        }
    }

    render(left, right, timestep) {
        this.webgl.useProgram(this.shaderProgram);
        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, this.buffer);
        if (left) this.moveX(false, timestep);
        if (right) this.moveX(true, timestep);
        this.attachVariables();
        this.webgl.drawArrays(this.webgl.TRIANGLE_FAN, 0, this.points.length);
    }
}