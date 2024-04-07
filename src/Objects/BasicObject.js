import Mesh from "../Mesh.js"
import EmptyTexture from "../Textures/EmptyTexture.js"
import Geometry from "../Core/Geometry.js"
import Material from "../Core/Material.js"
import Texture from "../Textures/Texture.js"

`use strict`

export default class BasicObject {
    constructor(gl, mesh, name) {
        this.gl = gl

        this.vao = this.gl.createVertexArray()

        this.name = name || `${ Math.floor(Math.random() * Math.pow(10, 5)) }_${ Date.now() }`
        this.mesh = mesh || new Mesh(new Geometry(), new Material())

        this.parent = null
        
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
            Object.keys(attributes).forEach(key => {

                if (key === 'a_position' && this.mesh.geometry.indice) {
                    scene.shader.setAttribute(key, 
                        attributes[key],
                        this.mesh.geometry.indice)
                } else {
                    scene.shader.setAttribute(key, attributes[key])
                }
            })

            Object.keys(this.mesh.material.samplers).forEach((key, index) => {
                if (!this.mesh.material.samplers[key]) {
                    this.mesh.material.samplers[key] = new Texture(this.gl)
                    this.mesh.material.samplers[key].id = index
                    this.mesh.material.samplers[key].setEmptyTexture(this.gl)
                }
            })

            Object.keys(this.mesh.material.samplers).forEach((key, index) => {
                const currentSampler = this.mesh.material.samplers[key]
                
                this.gl.activeTexture(this.gl.TEXTURE0 + currentSampler.id)
                this.gl.bindTexture(this.gl.TEXTURE_2D, currentSampler.data)
                scene.shader.setUniform(`${ key }`, currentSampler.id, scene.shader.types.sampler)
            })
        }

        this.gl.bindVertexArray(null)

        this.isInitialized = true

        this.counter = this.mesh.geometry.attributes['a_position'].data.length

        Object.keys(this.mesh.geometry.attributes).forEach(key => {
            const currentAttribute = this.mesh.geometry.attributes[key]
            currentAttribute.data = null
            currentAttribute.deleteBuffer(this.gl)
        })
    }

    update(fps, callback = null) {
        this.reset()
        
        if (callback) callback(this, fps)
        else if (this._update) this._update(this, fps)

        const usedValues = [
            !this.parent ? this.mesh.location : this.parent.mesh.location,
            !this.parent ? this.mesh.rotation : this.parent.mesh.rotation,
            !this.parent ? this.mesh.scale : this.parent.mesh.scale,
        ]

        // model or world matrix = translation * rotation * scale
        m4.modelMatrix(
            this.worldMatrix,
            usedValues[0], 
            usedValues[1], 
            usedValues[2])
    }

    draw(scene, callback = null) { }

    reset() {
        this.worldMatrix.reset()
    }
}