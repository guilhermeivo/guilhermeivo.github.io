import BasicObject from "./BasicObject.js"

`use strict`

export default class Lines extends BasicObject {
    constructor(gl, mesh, name) {
        super(gl, mesh, name)
    }

    draw(scene, callback = null) {
        if (!this.isInitialized) return
        
        scene.activeShaders(0)
        scene.useProgram(scene.shader.program)
        scene.useVao(this.vao)

        Object.keys(this.mesh.material.samplers).forEach((key, index) => {
            const currentSampler = this.mesh.material.samplers[key]
            //currentSampler.bind(this.gl, index)
            //scene.shader.setUniform(`${ key }`, index, scene.shader.types.sampler)
        })

        if (callback) callback(scene)
        else if (this._draw) this._draw(scene)
        else {
            scene.shader.setUniform('u_projection', scene.camera.projectionMatrix, scene.shader.types.mat4)
            scene.shader.setUniform('u_view', scene.camera.viewMatrix, scene.shader.types.mat4)
            scene.shader.setUniform('u_world', this.worldMatrix, scene.shader.types.mat4)

            scene.shader.setUniform('u_material.opacity', this.mesh.material.opacity, scene.shader.types.float)
    
            const primitiveType = this.gl.LINES
            const offset = 0
            const indexType = this.gl.UNSIGNED_INT
            this.gl.drawElements(primitiveType, this.mesh.geometry.indice.data.length, indexType, offset)
        }
    }
}