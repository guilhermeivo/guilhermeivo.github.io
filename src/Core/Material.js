`use strict`

const DEFAULT_CONFIG_MATERIAL = {
    shininess:  [ 32 ],
    ambient: [ 0, 0, 0 ],
    diffuse: [ 1, 1, 1 ],
    specular: [ 1, 1, 1 ],
    emissive: [ 0, 0, 0 ],
    opticalDensity: [ 1.45 ],
    opacity: [ 1 ],
    illum: [ 2 ]
}

export default class Material {
    constructor(config = {}) {
        this.shininess = config.shininess || DEFAULT_CONFIG_MATERIAL.shininess
        this.ambient = config.ambient || DEFAULT_CONFIG_MATERIAL.ambient
        this.diffuse = config.diffuse || DEFAULT_CONFIG_MATERIAL.diffuse
        this.specular = config.specular || DEFAULT_CONFIG_MATERIAL.specular
        this.emissive = config.emissive || DEFAULT_CONFIG_MATERIAL.emissive
        this.opticalDensity = config.opticalDensity || DEFAULT_CONFIG_MATERIAL.opticalDensity
        this.opacity = config.opacity || DEFAULT_CONFIG_MATERIAL.opacity
        this.illum = config.illum || DEFAULT_CONFIG_MATERIAL.illum
        this.name = config.name || ''

        this.samplers = {
            diffuseMap: null,
            specularMap: null,
            normalMap: null,
            opacityMap: null,
        }
    }

    defineUniform(name, value) {
        this.uniforms[name] = value
    }

    defineSampler(name, value) {
        this.samplers[name] = value
    }
}