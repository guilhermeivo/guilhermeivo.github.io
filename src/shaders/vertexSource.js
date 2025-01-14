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

uniform mat4 u_lightSpaceMatrix;

out vec3 v_normal;
out vec4 v_color;
out vec3 v_surfaceToView;
out vec2 v_texcoord;
out vec4 v_fragmentPositionLightSpace;
out vec3 v_fragmentPosition; // or worldPosition

void main() {
	v_fragmentPosition = vec3(u_world * vec4(a_position.xyz, 1.0));

	v_normal = mat3(u_world) * a_normal;
	v_texcoord = a_texcoord;

    v_color = a_color;
    
	vec3 surfaceWorldPosition = v_fragmentPosition;
	v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;

	v_fragmentPositionLightSpace = u_lightSpaceMatrix * vec4(v_fragmentPosition, 1.0); // for planar projection

	gl_Position = u_projection * u_view * vec4(v_fragmentPosition, 1.0);
}
`