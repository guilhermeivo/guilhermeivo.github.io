export default `#version 300 es
in vec4 a_position;
in vec3 a_normal;
in vec2 a_texcoord;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

out vec3 v_normal;
out vec2 v_texcoord;  

void main() {
	vec4 worldPosition = u_world * a_position;
	gl_Position = u_projection * u_view * worldPosition;

    v_texcoord = a_texcoord;
	v_normal = mat3(u_world) * a_normal;
}
`