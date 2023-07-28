/*

Created by:
Zack Rauen

*/

const BlockVShaderID = "vertexShader";

const BlockData = {
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
        return this[Object.keys(this)[n - 1]];
    }
};

const minSize = 0.1;

class Block {
	constructor(webgl) {
		this.webgl = webgl;
		this.blockID = Math.floor((Math.random() * 3) + 1);
		this.blockData = BlockData.key(this.blockID);
		this.startx = (Math.random() * (1 - (minSize * this.blockData.size) + 1)) - 1;
		this.points = [vec2(this.startx, 1.01 + (minSize * this.blockData.size)), vec2(this.startx + (minSize * this.blockData.size), 1.01 + (minSize * this.blockData.size)), vec2(this.startx + (minSize * this.blockData.size),1.01), vec2(this.startx, 1.01)];
		this.leftTopMax = 0;
		this.rightBottomMax = 2;
		this.shiftX = 0;
		this.shiftY = 0;
		this.deltaTrans = 0.010 * this.blockData.speed;
		this.buffer = this.webgl.createBuffer();
		this.webgl.bindBuffer( this.webgl.ARRAY_BUFFER, this.buffer );
		this.webgl.bufferData( this.webgl.ARRAY_BUFFER,	flatten(this.points), this.webgl.STATIC_DRAW );
		
		this.attachShaders();
	}

	attachShaders() {
		var vertexShader = this.webgl.createShader(this.webgl.VERTEX_SHADER);
		this.webgl.shaderSource(vertexShader, document.getElementById(BlockVShaderID).text);
		this.webgl.compileShader(vertexShader);
		
		var fragShader = this.webgl.createShader(this.webgl.FRAGMENT_SHADER);
		this.webgl.shaderSource(fragShader, document.getElementById(this.blockData.color).text );
		this.webgl.compileShader(fragShader);
		
		this.shaderProgram = this.webgl.createProgram();
		this.webgl.attachShader(this.shaderProgram, vertexShader);
		this.webgl.attachShader(this.shaderProgram, fragShader);
		this.webgl.linkProgram(this.shaderProgram);
	}

	attachVariables() {
		var myPosition = this.webgl.getAttribLocation(this.shaderProgram, "myPosition");
		this.webgl.vertexAttribPointer( myPosition, 2, this.webgl.FLOAT, false, 0, 0 );
		this.webgl.enableVertexAttribArray( myPosition );
		
		this.xshiftLoc = this.webgl.getUniformLocation(this.shaderProgram,"xshift");
		this.yshiftLoc = this.webgl.getUniformLocation(this.shaderProgram,"yshift");
	}

	moveX(forward) {
		var change = forward ? this.deltaTrans : -this.deltaTrans;
		if (this.points[this.leftTopMax][0] + change >= -1.01 && this.points[this.rightBottomMax][0] + change < 1.01) {
			this.shiftX += change;
			for (var i = 0; i < this.points.length;i++) {
			this.points[i][0] = this.points[i][0] + change;
			}
		}
	}

	moveY(forward, timediff) {
		var change = forward ? this.deltaTrans : -this.deltaTrans;
		change *= timediff / 25;
		//console.log(change);
		this.shiftY += change;
		for (var i = 0; i < this.points.length;i++) {
			this.points[i][1] = this.points[i][1] + change;
		}
	}

	render(timediff) {
		this.webgl.useProgram(this.shaderProgram);
		this.webgl.bindBuffer( this.webgl.ARRAY_BUFFER, this.buffer );
		this.attachVariables();
		this.moveY(false, timediff);
		this.webgl.uniform1f(this.yshiftLoc,this.shiftY);
		this.webgl.drawArrays(this.webgl.TRIANGLE_FAN, 0, this.points.length);
		//window.requestAnimFrame(this.render);
	}
}