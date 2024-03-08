import Mesh from "./Mesh.js"
import { modelMatrix } from "./common.js"
import EmptyTexture from "./Textures/EmptyTexture.js"

export default class _Object {
    constructor(scene, mesh, name) {
        this.scene = scene
        this.gl = this.scene.gl

        this.vao = this.gl.createVertexArray()

        this.name = name || `${ Math.floor(Math.random() * Math.pow(10, 5)) }_${ Date.now() }`
        this.mesh = mesh || new Mesh(this.gl)
        
        this.worldMatrix = m4.identity()

        this.isInitialized = false
    }

    init(callback = null) {
        this.gl.bindVertexArray(this.vao)

        if (callback) callback()
        else if (this._init) this._init()
        else {
            const attributes = this.mesh.geometry.attributes
            Object.keys(this.mesh.geometry.attributes).forEach(key => {
                this.scene.shader.setAttribute(key, attributes[key].data, {
                    size: attributes[key].size,
                    type: attributes[key].type, 
                    normalize: attributes[key].normalize, 
                    stride: attributes[key].stride, 
                    offset: attributes[key].offset
                })
            })

            Object.keys(this.mesh.material.samplers).forEach(sampler => {
                if (!this.mesh.material.samplers[sampler]) this.mesh.material.samplers[sampler] = new EmptyTexture(this.gl)
            })
        }

        this.gl.bindVertexArray(null)

        this.isInitialized = true
    }

    update(fps, callback = null) {
        this.reset()
        
        if (callback) callback(fps)
        else if (this._update) this._update(fps)

        // model or world matrix = translation * rotation * scale
        modelMatrix(
            this.worldMatrix,
            this.mesh.location, 
            this.mesh.rotation, 
            this.mesh.scale)
    }

    draw(callback = null) {
        if (!this.isInitialized) return
        
        this.scene.useProgram(this.scene.shader.program)
        this.scene.useVao(this.vao)

        for (let i = 0; i < this.mesh.material.samplers.length; i++) {
            this.gl.activeTexture(this.gl[`TEXTURE${ i }`])
            this.scene.useTexture(this.mesh.material.samplers[i].data, this.mesh.material.samplers[i].target)
            this.scene.shader.setUniform(`u_${ Object.keys(this.mesh.material.samplers)[i] }`, i, this.scene.shader.types.sampler)
        }

        if (callback) callback()
        else if (this._draw) this._draw()
        else {
            this.scene.shader.setUniform('u_projection', this.scene.camera.projectionMatrix, this.scene.shader.types.mat4)
            this.scene.shader.setUniform('u_view', this.scene.camera.viewMatrix, this.scene.shader.types.mat4)
            this.scene.shader.setUniform('u_world', this.worldMatrix, this.scene.shader.types.mat4)
            
            this.scene.shader.setUniform('u_viewWorldPosition', this.scene.camera.location, this.scene.shader.types.vec3)
            this.scene.shader.setUniform('u_lightWorldPosition', this.scene.lamp.position, this.scene.shader.types.vec3)
            this.scene.shader.setUniform('u_lightColor', this.scene.lamp.color, this.scene.shader.types.vec3)
            this.scene.shader.setUniform('u_lightItensity', this.scene.lamp.itensity, this.scene.shader.types.float)
            this.scene.shader.setUniform('u_ambientLight', [ 0, 0, 0 ], this.scene.shader.types.vec3)

            this.scene.shader.setUniform('u_shininess', this.mesh.material.shininess, this.scene.shader.types.float)
            this.scene.shader.setUniform('u_diffuse', this.mesh.material.diffuse, this.scene.shader.types.vec3)
            this.scene.shader.setUniform('u_ambient', this.mesh.material.ambient, this.scene.shader.types.vec3)
            this.scene.shader.setUniform('u_emissive', this.mesh.material.emissive, this.scene.shader.types.vec3)
            this.scene.shader.setUniform('u_specular', this.mesh.material.specular, this.scene.shader.types.vec3)
            this.scene.shader.setUniform('u_opacity', this.mesh.material.opacity, this.scene.shader.types.float)
        
            const primitiveType = this.gl.TRIANGLES
            const offset = 0
            const count = this.mesh.geometry.attributes['a_position'].data.length / 3
            this.gl.drawArrays(primitiveType, offset, count)
        }
    }

    reset() {
        this.worldMatrix.reset()
    }
}