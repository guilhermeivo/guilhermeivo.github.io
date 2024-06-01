import Uniforms from "./Uniforms.js"

export default class Material {
    constructor(config = {}) {
        this.uniforms = new Uniforms()

        this.uniforms.add('shininess', config.shininess || [ 32 ], 'float')
        this.uniforms.add('ambient', config.ambient || [ 0, 0, 0 ], 'vec3')
        this.uniforms.add('diffuse', config.diffuse || [ 1, 1, 1 ], 'vec3')
        this.uniforms.add('specular', config.specular || [ 1, 1, 1 ], 'vec3')
        this.uniforms.add('emissive', config.emissive || [ 0, 0, 0 ], 'vec3')
        this.uniforms.add('opticalDensity', config.opticalDensity || [ 1.45 ], 'float')
        this.uniforms.add('opacity', config.opacity || [ 1 ], 'float')
        this.uniforms.add('illum', config.illum || [ 2 ], 'float')

        this.samplers = {
            diffuseMap: null,
            specularMap: null,
            normalMap: null,
            opacityMap: null,
        }
    }

    defineSampler(name, value) {
        this.samplers[name] = value
    }
}