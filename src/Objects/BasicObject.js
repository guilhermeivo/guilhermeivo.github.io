import Mesh from "../Mesh.js"
import EmptyTexture from "../Textures/EmptyTexture.js"
import Geometry from "../Core/Geometry.js"
import Material from "../Core/Material.js"

export default class BasicObject {
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
                if (key === 'a_position' && this.mesh.geometry.indice) {
                    scene.shader.setAttribute(key, [
                        this.mesh.geometry.attributes[key].data,
                        { data: this.mesh.geometry.indice, target: this.gl.ELEMENT_ARRAY_BUFFER },
                    ])
                } else {
                    scene.shader.setAttribute(key, attributes[key].data, {
                        size: attributes[key].size,
                        type: attributes[key].type, 
                        normalize: attributes[key].normalize, 
                        stride: attributes[key].stride, 
                        offset: attributes[key].offset
                    })
                }
            })

            Object.keys(this.mesh.material.samplers).forEach(sampler => {
                if (!this.mesh.material.samplers[sampler]) {
                    this.mesh.material.samplers[sampler] = new EmptyTexture(this.gl)
                }
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
        m4.modelMatrix(
            this.worldMatrix,
            this.parent.mesh.location, 
            this.parent.mesh.rotation, 
            this.parent.mesh.scale)
    }

    draw(scene, callback = null) { }

    reset() {
        this.worldMatrix.reset()
    }
}