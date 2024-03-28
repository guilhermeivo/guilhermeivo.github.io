import Geometry from "../Core/Geometry.js";
import Material from "../Core/Material.js";
import Mesh from "../Mesh.js";
import _Object from "../_Object.js";

export default class AxisObject extends _Object {
    constructor(gl) {
        const geometry = new Geometry()
        geometry.setAttribute('position', axis.vertice())
        geometry.setAttribute('color', axis.color())
        geometry.setAttribute('texcoord', axis.texture(), { size: 2 })
        geometry.setIndice(axis.indices())
        const material = new Material()
        const mesh = new Mesh(geometry, material)
        super(gl, mesh, 'axis')

        this.type = 'axis'
    }

    _init(scene) {
        scene.shader.setAttribute('a_position', [
            new Float32Array(this.mesh.geometry.attributes['a_position'].data),
            { data: new Uint32Array(this.mesh.geometry.indice), target: this.gl.ELEMENT_ARRAY_BUFFER },
        ])

        scene.shader.setAttribute('a_color', new Uint8Array(this.mesh.geometry.attributes['a_color'].data), {
            type: this.gl.UNSIGNED_BYTE
        })

        scene.shader.setAttribute('a_texcoord', new Float32Array(this.mesh.geometry.attributes['a_texcoord'].data), {
            size: 2
        })
    }

    _draw(scene) {
        scene.shader.setUniform('u_projection', scene.camera.projectionMatrix, scene.shader.types.mat4)
        scene.shader.setUniform('u_view', scene.camera.viewMatrix, scene.shader.types.mat4)
        scene.shader.setUniform('u_world', this.worldMatrix, scene.shader.types.mat4)

        const primitiveType = this.gl.LINES
        const offset = 0
        const indexType = this.gl.UNSIGNED_INT
        this.gl.drawElements(primitiveType, axis.indices().length, indexType, offset)
    }
}

const axis = {
    isConfigured: false,

    configuration: () => {
        if (axis.isConfigured) return

        axis.isConfigured = true

        let index = [ 0, 0, -1 ]
        for (let i = 0; i < index.length; i++) {
            for (let j = 0; j < index.length; j++) {
                axis._vertice.push(index[(i + j) > index.length - 1 ? (i + j) - index.length : (i + j)])
                axis._indices.push(i + j)
                axis._indices.push(0)
            }
        }
        index = [ 0, 0, 1 ]
        for (let i = 0; i < index.length; i++) {
            for (let j = 0; j < index.length; j++) {
                axis._vertice.push(index[(i + j) > index.length - 1 ? (i + j) - index.length : (i + j)])
                axis._indices.push(i + j + index.length)
                axis._indices.push(0)
            }
        }

        axis._vertice.forEach((v, ndx) => {
            axis._vertice[ndx] *= 2.5
        })

        for (let i = 0; i < axis._vertice.length / 3; i++) {
            for (let j = 0; j < 4; j++) {
                axis._color.push(1)
            }
            for (let j = 0; j < 2; j++) {
                axis._texture.push(1)
            }
        }
    
    },

    _vertice: [
        0, 0, 0,
    ], 

    vertice: () => {
        axis.configuration()
        return axis._vertice
    },

    _indices: [
        0
    ],

    indices: () => {
        axis.configuration()
        return axis._indices
    },

    _color: [],

    color: () => {
        axis.configuration()
        return axis._color
    },

    _texture: [],

    texture: () => {
        axis.configuration()
        return axis._texture
    }
}