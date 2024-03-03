// calcula uma cor para cada pixel da primitiva
export default `#version 300 es

// definindo a precisão média como alta
precision highp float;

// Passed in from the vertex shader
in vec4 v_color;
in vec2 v_texcoord;
in vec3 v_normal;

in vec3 v_surfaceToLight;
in vec3 v_lightColor;
in float v_lightItensity;
in vec3 v_surfaceToView;

uniform float u_shininess;
uniform vec3 u_diffuse;
uniform vec3 u_ambient;
uniform vec3 u_emissive;
uniform vec3 u_specular;
uniform float u_opacity;

uniform vec3 u_ambientLight;

uniform sampler2D u_texture;
uniform sampler2D u_diffuseMap;
uniform sampler2D u_specularMap;

out vec4 outColor;

void main() {
    vec3 normal = normalize(v_normal);

    vec3 surfaceToLightDirection = normalize(v_surfaceToLight); // lightDirection
    vec3 surfaceToViewDirection = normalize(v_surfaceToView);
    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

    float light = dot(surfaceToLightDirection, normal) * v_lightItensity + .5;
    float specularLight = clamp(dot(normal, halfVector), 0.0, 1.0);
    vec3 specular;

    vec4 specularMapColor = texture(u_specularMap, v_texcoord);
    vec3 effectiveSpecular = u_specular * specularMapColor.rgb;

    if (light > 0.0) {
        specular = effectiveSpecular * pow(specularLight, u_shininess);
    }

    vec4 diffuseMapColor = texture(u_diffuseMap, v_texcoord);
    vec3 effectiveDiffuse = u_diffuse * diffuseMapColor.rgb * v_color.rgb;
    float effectiveOpacity = u_opacity * diffuseMapColor.a * v_color.a;

    // color = ambientColor * lightAmbient + diffuseColor * sumOfLightCalculations
    outColor = texture(u_texture, v_texcoord) * vec4(
        u_emissive +
        u_ambient * u_ambientLight +
        effectiveDiffuse * light * v_lightColor +
        specular,
        effectiveOpacity);
}
`