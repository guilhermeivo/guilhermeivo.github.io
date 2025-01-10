// calcula uma cor para cada pixel da primitiva
export default `#version 300 es

#define USE_BLINN
#define USE_PCF
#define USE_SHADOW
//#define RENDER_DEPTH_BUFFER

// definindo a precisão média como alta
precision highp float;

// Passed in from the vertex shader
in vec4 v_color;
in vec2 v_texcoord;
in vec4 v_fragmentPositionLightSpace;
in vec3 v_normal;
in vec3 v_fragmentPosition; 

in vec3 v_surfaceToView;

#define NUMBER_LIGHTS 1 
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

float CalcShadow(vec3 normal, vec3 lightDirection) {
    vec3 projectedCoords = v_fragmentPositionLightSpace.xyz / v_fragmentPositionLightSpace.w;
    projectedCoords = projectedCoords * 0.5 + 0.5;

    // fora do frustum
    if (projectedCoords.z > 1.0) return 0.0;
    
    float closestDepth = texture(projectedTexture, projectedCoords.xy).r; 
    float currentDepth = projectedCoords.z;
    
    float bias = max(0.05 * (1.0 - dot(normal, lightDirection)), u_bias);
    
    #if defined(USE_PCF)
        float shadow = 0.0;
        vec2 texelSize = vec2(1.0, 1.0) / vec2(textureSize(projectedTexture, 0));
        for (int x = -1; x <= 1; ++x) {
            for (int y = -1; y <= 1; ++y){
                float pcfDepth = texture(projectedTexture, projectedCoords.xy + vec2(x, y) * texelSize).r; 
                shadow += currentDepth - bias > pcfDepth  ? 0.25 : 0.0;        
            }    
        }
        shadow /= 9.0;
    #else
        float shadow = currentDepth - bias > closestDepth  ? 0.75 : 0.0;
    #endif

    return shadow;
}

// viewDirection = surfaceToViewDirection
vec3 CalcLight(Light light, vec3 normal, vec3 viewDirection) {
    /// Blinn-Phong
    // aproximacao para iluminacao
    vec3 lightDirection = normalize(light.surfaceToLight - v_fragmentPosition); // lightDirection or surfaceToLightDirection

    float specularLight = 0.0;
    #if defined(USE_BLINN)
        vec3 halfVector = normalize(lightDirection + viewDirection);
        specularLight = clamp(dot(normal, halfVector), 0.0, 1.0);
    #else
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
    #if defined(USE_SHADOW)
        float shadowLight = 1.0 - CalcShadow(normal, lightDirection); 
    #else
        float shadowLight = 1.0;
    #endif

    #if defined(RENDER_DEPTH_BUFFER)
        return vec3(shadowLight);
    #endif

    if (u_shadow > 0) {
        return 
            pow(u_material.diffuse * fakeLight * diffuseMapColor.rgb, vec3(1.0 / gamma)) + 
            (u_material.specular * pow(specularLight, u_material.shininess) * specularMapColor.rgb); 
    } else {
        return (effectiveAmbient + shadowLight * (u_material.emissive + effectiveDiffuse + effectiveSpecular)) / attenuation; 
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

    if (v_color.rgb == vec3(0,0,0)) {
        outColor = vec4(texColor.rgb, texColor.a);
    } else {
        outColor = vec4(texColor.rgb * v_color.rgb, texColor.a);
    }
}
`