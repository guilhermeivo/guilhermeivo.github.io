import Geometry from "../Core/Geometry.js";
import Material from "../Core/Material.js";
import Mesh from "../Mesh.js";
import Object from "../_Object.js";

export default class LampObject extends Object {
    constructor(scene) {
        const geometry = new Geometry()
        geometry.setAttribute('position', lamp.vertice())
        geometry.setAttribute('color', lamp.color())
        geometry.setAttribute('texcoord', lamp.texture(), { size: 2 })
        geometry.setIndice(lamp.indices())
        const material = new Material()
        const mesh = new Mesh(geometry, material)
        super(scene, mesh, 'lamp')

        this.type = 'lamp'

        this.init()
    }

    _init() {
        // vbo & ebo
        this.scene.shader.setAttribute('a_position', [
            new Float32Array(this.mesh.geometry.attributes['a_position'].data),
            { data: new Uint32Array(this.mesh.geometry.indice), target: this.gl.ELEMENT_ARRAY_BUFFER },
        ])

        this.scene.shader.setAttribute('a_color', new Uint8Array(this.mesh.geometry.attributes['a_color'].data), {
            type: this.gl.UNSIGNED_BYTE
        })

        this.scene.shader.setAttribute('a_texcoord', new Float32Array(this.mesh.geometry.attributes['a_texcoord'].data), {
            size: 2
        })
    }

    _draw() {
        this.scene.shader.setUniform('u_projection', this.projectionMatrix, this.scene.shader.types.mat4)
        this.scene.shader.setUniform('u_view', this.viewMatrix, this.scene.shader.types.mat4)
        this.scene.shader.setUniform('u_world', this.worldMatrix, this.scene.shader.types.mat4)

        const primitiveType = this.gl.LINES
        const offset = 0
        const indexType = this.gl.UNSIGNED_INT
        this.gl.drawElements(primitiveType, lamp.indices().length, indexType, offset)
    }
}

const lamp = {
    isConfigured: false,

    configuration: () => {
        if (lamp.isConfigured) return

        lamp.isConfigured = true

        let numSegments = 12
        let indexIndice = 0
        for (let i = 0; i < numSegments; ++i) {
            const u = i / numSegments
            const angle = u * Math.PI * 2
            const x = Math.cos(angle)
            const y = Math.sin(angle)
            lamp._vertice.push(x, y, 0)
            
            
            lamp._indices.push(indexIndice, (indexIndice + 1) % numSegments)
            indexIndice++
        }

        numSegments*=2
        for (let i = 0; i < numSegments; ++i) {
            const u = i / numSegments
            const angle = u * Math.PI * 2
            const x = Math.cos(angle)
            const y = Math.sin(angle)
            lamp._vertice.push(x * 5, y * 5, 0)
            lamp._indices.push(indexIndice)
            indexIndice++
        }

        numSegments*=1.5
        for (let i = 0; i < numSegments; ++i) {
            const u = i / numSegments
            const angle = u * Math.PI * 2
            const x = Math.cos(angle)
            const y = Math.sin(angle)
            lamp._vertice.push(x * 6, y * 6, 0)
            lamp._indices.push(indexIndice)
            indexIndice++
        }

        lamp._vertice.forEach((v, ndx) => {
            lamp._vertice[ndx] *= 2
        })

        for (let i = 0; i < lamp._vertice.length / 3; i++) {
            for (let j = 0; j < 4; j++) {
                lamp._color.push(1)
            }
            for (let j = 0; j < 2; j++) {
                lamp._texture.push(1)
            }
        }
    },

    _vertice: [], 

    vertice: () => {
        lamp.configuration()
        return lamp._vertice
    },

    _indices: [],

    indices: () => {
        lamp.configuration()
        return lamp._indices
    },

    _color: [],

    color: () => {
        lamp.configuration()
        return lamp._color
    },

    _texture: [],

    texture: () => {
        lamp.configuration()
        return lamp._texture
    }
}