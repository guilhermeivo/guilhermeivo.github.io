import Uniforms from "./Uniforms.js"
import { UniformType } from "./Uniform.js"

export default class Material {
    /**
     * @param {{
     *  shininess:float[];
     *  ambient:float[];
     *  diffuse:float[];
     *  specular:float[];
     *  emissive:float[];
     *  opticalDensity:float[];
     *  opacity:float[];
     *  illum:float[];
     * }} config 
     */
    constructor(config = {}) {
        this.name = null
        this.uniforms = new Uniforms()

        this.uniforms.add('shininess', config.shininess || [ 32.0 ], UniformType.FLOAT)
        this.uniforms.add('ambient', config.ambient || [ 0.0, 0.0, 0.0 ], UniformType.VEC3)
        this.uniforms.add('diffuse', config.diffuse || [ 1.0, 1.0, 1.0 ], UniformType.VEC3)
        this.uniforms.add('specular', config.specular || [ 1.0, 1.0, 1.0 ], UniformType.VEC3)
        this.uniforms.add('emissive', config.emissive || [ 0.0, 0.0, 0.0 ], UniformType.VEC3)
        this.uniforms.add('opticalDensity', config.opticalDensity || [ 1.45 ], UniformType.FLOAT)
        this.uniforms.add('opacity', config.opacity || [ 1.0 ], UniformType.FLOAT)
        this.uniforms.add('illum', config.illum || [ 2.0 ], UniformType.FLOAT)

        this.samplers = {
            diffuseMap: null,  // 0
            specularMap: null, // 1
            normalMap: null,   // 2
            opacityMap: null,  // 3
        }
    }

    defineSampler(name, value) {
        this.samplers[name] = value
    }
}