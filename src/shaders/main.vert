attribute vec4 myPosition;

uniform float xshift;
uniform float yshift;

void main() {
    // Direct position calculation - more efficient than matrix multiplication
    gl_Position = vec4(myPosition.x + xshift, myPosition.y + yshift, 0.0, 1.0);
    gl_PointSize = 1.0;
}