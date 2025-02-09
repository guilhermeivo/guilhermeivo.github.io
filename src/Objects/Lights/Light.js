import { ObjectType, Object3 } from "../Object3.js"
import Uniforms from "../../Core/Uniforms.js"
import { UniformType } from "../../Core/Uniform.js"

export default class Light extends Object3 {
    /**
     * 
     * @param {{
     *  color:float[];
     *  itensity:float[];
     *  ambient:float[];
     *  diffuse:float[];
     *  specular:float[];
     *  constant:float[];
     *  linear:float[];
     * }} configs
     */
    constructor(wasm, configs = { }) {
        super(wasm, configs)

        this.type = ObjectType.LIGHT

        this.uniforms = new Uniforms()

        this.uniforms.add('color', configs.color || [ 1.0, 1.0, 1.0 ], UniformType.VEC3)
        this.uniforms.add('itensity', configs.itensity || [ 0.5 ], UniformType.FLOAT)
        this.uniforms.add('ambient', configs.ambient || [ 0.05, 0.05, 0.05 ], UniformType.VEC3)
        this.uniforms.add('diffuse', configs.diffuse || [ 0.8, 0.8, 0.8 ], UniformType.VEC3)
        this.uniforms.add('specular', configs.specular || [ 1.0, 1.0, 1.0 ], UniformType.VEC3)
        this.uniforms.add('constant', configs.constant || [ 1.0 ], UniformType.FLOAT)
        this.uniforms.add('linear', configs.linear || [ 0.002 ], UniformType.FLOAT)
    }
}