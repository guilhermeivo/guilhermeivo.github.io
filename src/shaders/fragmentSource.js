// calcula uma cor para cada pixel da primitiva
export default `#version 300 es

// definindo a precisão média como alta
precision highp float;

// Passed in from the vertex shader
in vec4 v_color;
in vec2 v_texcoord;
in vec3 v_normal;
in vec3 v_fragmentPosition; 

in vec3 v_surfaceToView;

#define NUMBER_LIGHTS 2  
struct Light {
	vec3 surfaceToLight;
	vec3 color;

	vec3 ambient;
	vec3 diffuse;
	vec3 specular;

    float constant;
    float linear;

	float itensity;
};

struct Material {
    float shininess;
    vec3 diffuse;
    vec3 ambient;
    vec3 emissive;
    vec3 specular;
    float opacity;

    sampler2D diffuseMap;
    sampler2D specularMap;
    sampler2D opacityMap;
};

uniform Material u_material;
uniform Light u_lights[NUMBER_LIGHTS];

uniform vec3 u_ambientLight;

float gamma = 1.15;

out vec4 outColor;

vec3 CalcLight(Light light, vec3 normal, vec3 viewDirection) {
    vec3 lightDirection = normalize(light.surfaceToLight - v_fragmentPosition); // lightDirection or surfaceToLightDirection
    vec3 halfVector = normalize(lightDirection + viewDirection);

    float fakeLight = dot(lightDirection, normal) * light.itensity + .5;
    float specularLight = clamp(dot(normal, halfVector), 0.0, 1.0);

    float distance = length(light.surfaceToLight - v_fragmentPosition); 
    float attenuation = (light.constant + light.linear * distance); 

    // SPECULAR
    vec4 specularMapColor = texture(u_material.specularMap, v_texcoord);
    vec3 effectiveSpecular = light.specular * u_material.specular * pow(specularLight, u_material.shininess) * light.color * specularMapColor.rgb;

    // DIFFUSE
    vec4 diffuseMapColor = texture(u_material.diffuseMap, v_texcoord);
    vec3 effectiveDiffuse = pow(light.diffuse * u_material.diffuse * fakeLight * light.color * diffuseMapColor.rgb, vec3(1.0 / gamma));

    // AMBIENT
    vec3 effectiveAmbient = light.ambient * u_material.ambient * u_ambientLight;

    return (u_material.emissive + effectiveAmbient + effectiveDiffuse + effectiveSpecular) / attenuation;
}

void main() {
    vec3 normal = normalize(v_normal);
    vec3 surfaceToViewDirection = normalize(v_surfaceToView);

    // OPACITY
    vec4 opacityMapColor = texture(u_material.opacityMap, v_texcoord);
    vec4 diffuseMapColor = texture(u_material.diffuseMap, v_texcoord);
    float effectiveOpacity = u_material.opacity * opacityMapColor.a * diffuseMapColor.a;

    // color = ambientColor * lightAmbient + diffuseColor * sumOfLightCalculations
    vec3 outputColor = vec3(0.0);
    for(int i = 0; i < NUMBER_LIGHTS; i++)
        outputColor += CalcLight(u_lights[i], normal, surfaceToViewDirection); 

    outColor = vec4(pow(outputColor.rgb, vec3(1.0 / gamma)), effectiveOpacity);
}
`