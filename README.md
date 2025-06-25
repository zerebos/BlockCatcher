# BlockCatcher
This is a WebGL game in which you must catch as many blocks as possible until time runs out. 250 points is considered a win.

## Demo:

You can play a demo of the game at http://zerebos.github.io/BlockCatcher/

## Controls:

	Move Player Bar Left/Right - Left/Right Arrow Keys
	Start Game - SPACE

	Red Blocks - 1 points
	Blue Blocks - 5 points
	White Blocks - 25 points

Playing this game is really simple, you play as the green bar at the bottom of the screen. The objective
is to catch blocks with the player bar before they fall off the screen using the left and right arrowkeys. To start press the
spacebar, youll notice you have a total of 60 seconds to gain as many points as possible before the game ends. There are 3
types of blocks youll encounter; a red block worth 1 point, a blue block worth 5 points, and a white block worth 25 points.
The red blocks are big and slow, the blue blocks are medium sized and traval at a moderate pace, while the white blocks are
small and move quickly. To win this game, you have to accumulate at least 250 points before the time runs out. Once the game
is over you have the ability to restart by repressing the spacebar.

## Description of implementation:

To create this game we used classes to implement our player bar as well as the blocks. This allowed us to
keep track of their vertices' position as well as color, speed, size, and point value. After the game is started, a timer
counts down from 1 minute and a block is generated every second that passes. Interation between the player bar and block
is determined when the lower 2 vertices of a block are below the the y value of the player bar's top vertices and within
the x values of the player bar. if interaction is successful, the points will be added to the score and the block will be
deleted. Even without interaction, the blocks will continue to fall below the canvas before they get deleted at a certain
height. Movement of the blocks and player bar is controlled by a translation matrix within the vertex shader and each block
type has its own fragment shader.
