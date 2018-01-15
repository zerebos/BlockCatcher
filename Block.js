/*

Created by:
Zack Rauen

*/

var BlockVShaderID = "vertexShader";

var BlockData = {
	red: {
		color: "red",
		speed: 1,
		size: 2.5,
		points: 1
	},
	blue: {
		color: "blue",
		speed: 2,
		size: 1.5,
		points: 5
	},
	white: {
		color: "white",
		speed: 3,
		size: 1,
		points: 25
	},
	key: function(n) {
        return this[Object.keys(this)[n-1]];
    }
};

var minSize = 0.1;

var Block = function (gl) {
	this.gl = gl;
	this.blockID = Math.floor((Math.random() * 3) + 1);
	this.blockData = BlockData.key(this.blockID);
	this.startx = (Math.random() * (1-(minSize*this.blockData.size)+1))-1;
	this.points = [vec2(this.startx,1.01+(minSize*this.blockData.size)),vec2(this.startx+(minSize*this.blockData.size),1.01+(minSize*this.blockData.size)),vec2(this.startx+(minSize*this.blockData.size),1.01),vec2(this.startx,1.01)];
	this.leftTopMax = 0;
	this.rightBottomMax = 2;
	this.shiftX = 0;
	this.shiftY = 0;
	this.deltaTrans = 0.010*this.blockData.speed;
	this.buffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );
	gl.bufferData( gl.ARRAY_BUFFER,	flatten(this.points), gl.STATIC_DRAW );
	
	this.attachShaders();
}

Block.prototype.attachShaders = function() {
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, document.getElementById(BlockVShaderID).text);
    gl.compileShader(vertexShader);
	
	var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragShader, document.getElementById(this.blockData.color).text );
	gl.compileShader(fragShader);
	
	this.shaderProgram = gl.createProgram();
	this.gl.attachShader(this.shaderProgram, vertexShader);
    this.gl.attachShader(this.shaderProgram, fragShader);
	this.gl.linkProgram(this.shaderProgram);
}

Block.prototype.attachVariables = function() {
	var myPosition = this.gl.getAttribLocation(this.shaderProgram, "myPosition");
	this.gl.vertexAttribPointer( myPosition, 2, this.gl.FLOAT, false, 0, 0 );
	this.gl.enableVertexAttribArray( myPosition );
	
	this.xshiftLoc = this.gl.getUniformLocation(this.shaderProgram,"xshift");
	this.yshiftLoc = this.gl.getUniformLocation(this.shaderProgram,"yshift");
}

Block.prototype.moveX = function(forward) {
	var change = forward ? this.deltaTrans : -this.deltaTrans;
	if (this.points[this.leftTopMax][0] + change >= -1.01 && this.points[this.rightBottomMax][0] + change < 1.01) {
		this.shiftX += change;
		for (var i=0; i<this.points.length;i++) {
		this.points[i][0] = this.points[i][0]+change;
		}
	}
}

Block.prototype.moveY = function(forward, timediff) {
	var change = forward ? this.deltaTrans : -this.deltaTrans;
	change *= timediff/25;
	//console.log(change);
	this.shiftY += change;
	for (var i=0; i<this.points.length;i++) {
		this.points[i][1] = this.points[i][1]+change;
	}
}

Block.prototype.render = function(timediff) {
	gl.useProgram(this.shaderProgram);
	gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );
	this.attachVariables();
	this.moveY(false, timediff);
	this.gl.uniform1f(this.yshiftLoc,this.shiftY);
	this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.points.length);
	//window.requestAnimFrame(this.render);
}