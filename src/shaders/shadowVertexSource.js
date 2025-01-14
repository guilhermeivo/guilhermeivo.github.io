export default `#version 300 es

in vec4 a_position;
in vec2 a_texcoord; 

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;
 
out vec2 v_texcoord;

void main() {
    v_texcoord = a_texcoord;
    gl_Position = u_projection * u_view * u_world * vec4(a_position.xyz, 1.0);
}
`