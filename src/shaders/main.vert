attribute vec4 myPosition;

uniform float xshift;
uniform float yshift;
mat3 Mtrans;

void main() {
vec3 vi;
vi[0] = myPosition.x;
vi[1] = myPosition.y;
vi[2] = 1.0;
Mtrans = mat3(1,0,0,
              0,1,0,
              xshift,yshift,1);
    vi = Mtrans * vi;
    gl_PointSize = 1.0;
    gl_Position.x = vi[0];
    gl_Position.y = vi[1];
    gl_Position.z = 0.0;
    gl_Position.w = 1.0;
}