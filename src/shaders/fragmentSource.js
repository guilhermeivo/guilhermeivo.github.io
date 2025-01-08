// calcula uma cor para cada pixel da primitiva
export default `#version 300 es

#define USE_BLINN

// definindo a precisão média como alta
precision highp float;

// Passed in from the vertex shader
in vec4 v_color;
in vec2 v_texcoord;
in vec4 v_projectedTexcoord;
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
};

uniform sampler2D diffuseMap;
uniform sampler2D specularMap;
uniform sampler2D normalMap;
uniform sampler2D opacityMap;
uniform sampler2D projectedTexture;

uniform Material u_material;
uniform Light u_lights[NUMBER_LIGHTS];

uniform vec3 u_ambientLight;

uniform vec4 u_id;
uniform float u_bias;
uniform int u_shadow; 

float gamma = 1.15; // gamma correction

out vec4 outColor;

bool blinn = true;

// viewDirection = surfaceToViewDirection
vec3 CalcLight(Light light, vec3 normal, vec3 viewDirection) {
    /// Blinn-Phong
    // aproximacao para iluminacao
    vec3 lightDirection = normalize(light.surfaceToLight - v_fragmentPosition); // lightDirection or surfaceToLightDirection

    float specularLight = 0.0;
    #if defined(USE_BLINN)
        vec3 halfVector = normalize(lightDirection + viewDirection);
        specularLight = clamp(dot(normal, halfVector), 0.0, 1.0);
    #elif
        vec3 reflectDirection = reflect(-lightDirection, normal);
        specularLight = clamp(dot(viewDirection, reflectDirection), 0.0, 1.0);
    #endif
    ///

    float fakeLight = dot(lightDirection, normal) * light.itensity + .5;

    float distance = length(light.surfaceToLight - v_fragmentPosition); 
    float attenuation = light.constant + (light.linear * distance);  // gamma correction

    // SPECULAR
    vec4 specularMapColor = texture(specularMap, v_texcoord);
    vec3 effectiveSpecular = light.specular * u_material.specular * pow(specularLight, u_material.shininess) * 
        light.color * specularMapColor.rgb; // color;

    // DIFFUSE
    vec4 diffuseMapColor = texture(diffuseMap, v_texcoord);
    vec3 effectiveDiffuse = pow(light.diffuse * u_material.diffuse * fakeLight * light.color * diffuseMapColor.rgb, vec3(1.0 / gamma));

    // AMBIENT
    vec3 effectiveAmbient = light.ambient * u_material.ambient * u_ambientLight;

    // SHADOW
    // divide by w to get the correct value.
    vec3 projectedTexcoord = v_projectedTexcoord.xyz / v_projectedTexcoord.w;
    float currentDepth = projectedTexcoord.z + u_bias;

    bool inRange =
        projectedTexcoord.x >= 0.0 &&
        projectedTexcoord.x <= 1.0 &&
        projectedTexcoord.y >= 0.0 &&
        projectedTexcoord.y <= 1.0;

    // the 'r' channel has the depth values
    float projectedDepth = texture(projectedTexture, projectedTexcoord.xy).r;
    float shadowLight = (inRange && projectedDepth <= currentDepth) ? 0.75 : 1.0; 

    if (u_shadow > 0) {
        return (u_material.emissive + effectiveAmbient + effectiveDiffuse + effectiveSpecular) / attenuation;
    } else {
        return shadowLight * (u_material.emissive + effectiveAmbient + effectiveDiffuse + effectiveSpecular) / attenuation; 
    }
}

void main() {
    vec3 normal = normalize(v_normal);
    vec3 surfaceToViewDirection = normalize(v_surfaceToView);

    // OPACITY
    vec4 opacityMapColor = texture(opacityMap, v_texcoord);
    vec4 diffuseMapColor = texture(diffuseMap, v_texcoord);
    float effectiveOpacity = u_material.opacity * opacityMapColor.a * diffuseMapColor.a;

    // color = ambientColor * lightAmbient + diffuseColor * sumOfLightCalculations
    vec3 outputColor = vec3(0.0);
    for(int i = 0; i < NUMBER_LIGHTS; i++)
        outputColor += CalcLight(u_lights[i], normal, surfaceToViewDirection);  

    vec4 texColor = vec4(pow(outputColor.rgb, vec3(1.0 / gamma)), effectiveOpacity);

    if (v_color == vec4(0,0,0,1)) {
        outColor = vec4(texColor.rgb, texColor.a);
    } else {
        outColor = vec4(texColor.rgb * v_color.rgb, texColor.a);
    }
}
`