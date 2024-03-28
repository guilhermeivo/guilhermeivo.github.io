import Mesh from "./Mesh.js"
import { modelMatrix } from "./common.js"
import EmptyTexture from "./Textures/EmptyTexture.js"
import Geometry from "./Core/Geometry.js"
import Material from "./Core/Material.js"

export default class _Object {
    constructor(gl, mesh, name) {
        this.gl = gl

        this.vao = this.gl.createVertexArray()

        this.name = name || `${ Math.floor(Math.random() * Math.pow(10, 5)) }_${ Date.now() }`
        this.mesh = mesh || new Mesh(new Geometry(), new Material())

        this.parent = this
        
        this.worldMatrix = m4.identity()

        this.type = 'object'
        this.debug = false

        this.isInitialized = false
    }

    init(scene, callback = null) {
        // vbo & ebo
        this.gl.bindVertexArray(this.vao)

        if (callback) callback(scene)
        else if (this._init) this._init(scene)
        else {
            const attributes = this.mesh.geometry.attributes
            Object.keys(this.mesh.geometry.attributes).forEach(key => {
                scene.shader.setAttribute(key, attributes[key].data, {
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
        
        if (callback) callback(this, fps)
        else if (this._update) this._update(this, fps)

        // model or world matrix = translation * rotation * scale
        modelMatrix(
            this.worldMatrix,
            this.parent.mesh.location, 
            this.parent.mesh.rotation, 
            this.parent.mesh.scale)
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
            const count = this.mesh.geometry.attributes['a_position'].data.length / 3
            this.gl.drawArrays(primitiveType, offset, count)
        }
    }

    reset() {
        this.worldMatrix.reset()
    }
}