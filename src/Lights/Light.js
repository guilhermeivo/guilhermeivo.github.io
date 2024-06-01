import Object3 from "../Objects/Object3.js";
import Uniforms from "../Core/Uniforms.js"

export default class Light extends Object3 {
    constructor(configs = { }) {
        super(configs)

        this.type = 'light'

        this.uniforms = new Uniforms()

        this.uniforms.add('color', configs.color || [ 1, 1, 1 ], 'vec3')
        this.uniforms.add('itensity', configs.itensity || [ .5 ], 'float')
        this.uniforms.add('ambient', configs.ambient || [ 0.05, 0.05, 0.05 ], 'vec3')
        this.uniforms.add('diffuse', configs.diffuse || [ 0.8, 0.8, 0.8 ], 'vec3')
        this.uniforms.add('specular', configs.specular || [ 1.0, 1.0, 1.0 ], 'vec3')
        this.uniforms.add('constant', [ 1.0 ], 'float')
        this.uniforms.add('linear', [ 0.002 ], 'float')
    }
}