import BasicObject from "./BasicObject.js"

export default class Lines extends BasicObject {
    constructor(gl, mesh, name) {
        super(gl, mesh, name)
    }

    draw(scene, callback = null) {
        if (!this.isInitialized) return
        
        scene.activeShaders(0)
        scene.useProgram(scene.shader.program)
        scene.useVao(this.vao)

        for (let i = 0; i < this.mesh.material.samplers.length; i++) {
            this.gl.activeTexture(this.gl[`TEXTURE${ i }`])
            scene.useTexture(this.mesh.material.samplers[i].data, this.mesh.material.samplers[i].target)
            scene.shader.setUniform(`u_material.${ Object.keys(this.mesh.material.samplers)[i] }`, i, scene.shader.types.sampler)
        }

        if (callback) callback(scene)
        else if (this._draw) this._draw(scene)
        else {
            scene.shader.setUniform('u_projection', scene.camera.projectionMatrix, scene.shader.types.mat4)
            scene.shader.setUniform('u_view', scene.camera.viewMatrix, scene.shader.types.mat4)
            scene.shader.setUniform('u_world', this.worldMatrix, scene.shader.types.mat4)
    
            const primitiveType = this.gl.LINES
            const offset = 0
            const indexType = this.gl.UNSIGNED_INT
            this.gl.drawElements(primitiveType, this.mesh.geometry.indice.length, indexType, offset)
        }
    }
}