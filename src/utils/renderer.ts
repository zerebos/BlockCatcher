import vertexShaderSource from "../shaders/main.vert" with {type: "text"};
import fragmentShaderSource from "../shaders/main.frag" with {type: "text"};
import {BG_COLOR} from "../config";
import type {Vec, Vec2} from "../types";

/**
 * Interface for objects that can be rendered.
 * It includes the points that define the shape, a WebGL buffer for the points,
 * and uniforms for rendering properties like position shift and color.
 */
interface Renderable {
    points: Vec2[];
    buffer: WebGLBuffer;
    uniforms: {
        xshift: number;
        yshift: number;
        color: number[];
    };
}

export default class Renderer {
    webgl: WebGLRenderingContext;
    vertexShader: WebGLShader;
    fragShader: WebGLShader;
    shaderProgram: WebGLProgram;
    positionLocation: number;
    xshiftLocation: WebGLUniformLocation;
    yshiftLocation: WebGLUniformLocation;
    colorLocation: WebGLUniformLocation;

    constructor(canvas: HTMLCanvasElement) {
        /** @type {WebGLRenderingContext} */
        this.webgl = canvas.getContext("webgl")!;
        // if (!this.webgl) return alert("WebGL is not available");

        this.webgl.viewport(0, 0, 512, 512); // set size of viewport
        this.webgl.clearColor(BG_COLOR[0], BG_COLOR[1], BG_COLOR[2], 1.0); // background black
        this.webgl.clear(this.webgl.COLOR_BUFFER_BIT); // allows color

        this.vertexShader = this.webgl.createShader(this.webgl.VERTEX_SHADER)!;
        this.webgl.shaderSource(this.vertexShader, vertexShaderSource);
        this.webgl.compileShader(this.vertexShader);

        this.fragShader = this.webgl.createShader(this.webgl.FRAGMENT_SHADER)!;
        this.webgl.shaderSource(this.fragShader, fragmentShaderSource);
        this.webgl.compileShader(this.fragShader);

        this.shaderProgram = this.webgl.createProgram();
        this.webgl.attachShader(this.shaderProgram, this.vertexShader);
        this.webgl.attachShader(this.shaderProgram, this.fragShader);
        this.webgl.linkProgram(this.shaderProgram);

        this.webgl.useProgram(this.shaderProgram);

        // Bind locations
        this.positionLocation = this.webgl.getAttribLocation(this.shaderProgram, "myPosition");

        this.xshiftLocation = this.webgl.getUniformLocation(this.shaderProgram, "xshift")!;
        this.yshiftLocation = this.webgl.getUniformLocation(this.shaderProgram, "yshift")!;

        this.colorLocation = this.webgl.getUniformLocation(this.shaderProgram, "u_color")!;
    }

    createBuffer(points: Vec[]) {
        const buffer = this.webgl.createBuffer();
        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, buffer);
        this.webgl.bufferData(this.webgl.ARRAY_BUFFER, Float32Array.from(points.flat()), this.webgl.STATIC_DRAW);
        return buffer;
    }

    clearColorBuffer() {
        this.webgl.clear(this.webgl.COLOR_BUFFER_BIT);
    }
    /**
     * Draws a Renderable object using the WebGL context.
     * It binds the buffer, sets the attributes and uniforms, and draws the object.
     * @param {Renderable} obj - The object to be rendered.
     */
    draw<T extends Renderable>(obj: T) {
        this.webgl.useProgram(this.shaderProgram);
        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, obj.buffer);
        this.webgl.vertexAttribPointer(this.positionLocation, 2, this.webgl.FLOAT, false, 0, 0);
        this.webgl.enableVertexAttribArray(this.positionLocation);

        this.webgl.uniform1f(this.xshiftLocation, obj.uniforms.xshift);
        this.webgl.uniform1f(this.yshiftLocation, obj.uniforms.yshift);
        this.webgl.uniform4f(this.colorLocation, obj.uniforms.color[0], obj.uniforms.color[1], obj.uniforms.color[2], 1);

        this.webgl.drawArrays(this.webgl.TRIANGLE_FAN, 0, obj.points.length);
    }
}