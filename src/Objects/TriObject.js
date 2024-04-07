import BasicObject from "./BasicObject.js"

`use strict`

export default class TriObject extends BasicObject {
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
                
            this.gl.activeTexture(this.gl.TEXTURE0 + currentSampler.id)
            this.gl.bindTexture(this.gl.TEXTURE_2D, currentSampler.data)
            scene.shader.setUniform(`${ key }`, currentSampler.id, scene.shader.types.sampler)
        })

        if (callback) callback(scene)
        else if (this._draw) this._draw(scene)
        else {
            scene.shader.setUniform('u_projection', scene.camera.projectionMatrix, scene.shader.types.mat4)
            scene.shader.setUniform('u_view', scene.camera.viewMatrix, scene.shader.types.mat4)
            scene.shader.setUniform('u_world', this.worldMatrix, scene.shader.types.mat4)
            
            scene.shader.setUniform('u_viewWorldPosition', scene.camera.mesh.location, scene.shader.types.vec3)

            scene.shader.setUniform('u_material.shininess', this.mesh.material.shininess, scene.shader.types.float)
            scene.shader.setUniform('u_material.diffuse', this.mesh.material.diffuse, scene.shader.types.vec3)
            scene.shader.setUniform('u_material.ambient', this.mesh.material.ambient, scene.shader.types.vec3)
            scene.shader.setUniform('u_material.emissive', this.mesh.material.emissive, scene.shader.types.vec3)
            scene.shader.setUniform('u_material.specular', this.mesh.material.specular, scene.shader.types.vec3)
            scene.shader.setUniform('u_material.opacity', this.mesh.material.opacity, scene.shader.types.float)

            scene.shader.setUniform('u_ambientLight', [ .1, .1, .1 ], scene.shader.types.vec3)

            for (let i = 0; i < scene.lights.length; i++) {
                scene.shader.setUniform(`u_lights[${ i }].surfaceToLight`, scene.lights[i].mesh.location, scene.shader.types.vec3)
                scene.shader.setUniform(`u_lights[${ i }].ambient`, scene.lights[i].ambient, scene.shader.types.vec3)
                scene.shader.setUniform(`u_lights[${ i }].diffuse`, scene.lights[i].diffuse, scene.shader.types.vec3)
                scene.shader.setUniform(`u_lights[${ i }].specular`, scene.lights[i].specular, scene.shader.types.vec3)
                scene.shader.setUniform(`u_lights[${ i }].color`, scene.lights[i].color, scene.shader.types.vec3)
                scene.shader.setUniform(`u_lights[${ i }].itensity`, scene.lights[i].itensity, scene.shader.types.float)
                scene.shader.setUniform(`u_lights[${ i }].constant`, scene.lights[i].constant, scene.shader.types.float)
                scene.shader.setUniform(`u_lights[${ i }].linear`, scene.lights[i].linear, scene.shader.types.float)
            }
        
            const primitiveType = this.gl.TRIANGLES
            const offset = 0
            const count = this.counter / 3
            this.gl.drawArrays(primitiveType, offset, count)
        }
    }
}