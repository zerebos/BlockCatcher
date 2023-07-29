import vertexShaderSource from "../shaders/main.vert";
import fragmentShaderSource from "../shaders/main.frag";


export default class Renderer {
    constructor(webgl) {
        this.webgl = webgl;

        this.vertexShader = this.webgl.createShader(this.webgl.VERTEX_SHADER);
        this.webgl.shaderSource(this.vertexShader, vertexShaderSource);
        this.webgl.compileShader(this.vertexShader);
        
        this.fragShader = this.webgl.createShader(this.webgl.FRAGMENT_SHADER);
        this.webgl.shaderSource(this.fragShader, fragmentShaderSource);
        this.webgl.compileShader(this.fragShader);
        
        this.shaderProgram = this.webgl.createProgram();
        this.webgl.attachShader(this.shaderProgram, this.vertexShader);
        this.webgl.attachShader(this.shaderProgram, this.fragShader);
        this.webgl.linkProgram(this.shaderProgram);

        this.webgl.useProgram(this.shaderProgram);

        // Bind locations
        this.positionLocation = this.webgl.getAttribLocation(this.shaderProgram, "myPosition");
        
        this.xshiftLocation = this.webgl.getUniformLocation(this.shaderProgram, "xshift");
        this.yshiftLocation = this.webgl.getUniformLocation(this.shaderProgram, "yshift");

        this.colorLocation = this.webgl.getUniformLocation(this.shaderProgram, "u_color");
    }

    draw(obj) {
        this.webgl.useProgram(this.shaderProgram);
        this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, obj.buffer);
        this.webgl.vertexAttribPointer(this.positionLocation, 2, this.webgl.FLOAT, false, 0, 0);
        this.webgl.enableVertexAttribArray(this.positionLocation);

        this.webgl.uniform1f(this.xshiftLocation, obj.uniforms.xshift);
        this.webgl.uniform1f(this.yshiftLocation, obj.uniforms.yshift);
        this.webgl.uniform4f(this.colorLocation, ...obj.uniforms.color, 1);

        this.webgl.drawArrays(this.webgl.TRIANGLE_FAN, 0, obj.points.length);
    }
}