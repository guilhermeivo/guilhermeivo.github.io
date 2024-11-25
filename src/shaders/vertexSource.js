// calcula as posições dos vértices de tipos primitivos
export default `#version 300 es

// um atributo é um input (in) para um vertex shader
// ele receberá dados de um buffer
in vec4 a_position;
in vec4 a_color;
in vec3 a_normal;
in vec2 a_texcoord;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world; // or model matrix

uniform vec3 u_viewWorldPosition;

uniform mat4 u_textureMatrix;

out vec3 v_normal;
out vec4 v_color;
out vec3 v_surfaceToView;
out vec2 v_texcoord;
out vec4 v_projectedTexcoord;
out vec3 v_fragmentPosition;  

void main() {
	vec4 worldPosition = u_world * a_position;
	gl_Position = u_projection * u_view * worldPosition;

    v_color = a_color;
    v_texcoord = a_texcoord;

	vec3 surfaceWorldPosition = worldPosition.xyz;
	v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;
	v_fragmentPosition = vec3(u_world * vec4(a_position.xyz, 1.0));
	v_normal = mat3(u_world) * a_normal;

	v_projectedTexcoord = u_textureMatrix * worldPosition; // for planar projection
}
`