import Geometry from "../Core/Geometry.js";
import Mesh from "../Mesh.js";
import Lines from "./Lines.js";
import Material from "../Core/Material.js";

`use strict`

export default class AxisObject extends Lines {
    constructor(gl, transformation = { }) {
        const geometry = new Geometry()
        geometry.setAttribute('position', axis.vertice())
        geometry.setAttribute('color', axis.color(), { type: gl.UNSIGNED_BYTE })
        geometry.setAttribute('texcoord', axis.texture(), { size: 2 })
        geometry.setIndice(axis.indices())
        const material = new Material()
        const mesh = new Mesh(geometry, material, transformation)
        
        super(gl, mesh, 'axis')

        this.debug = true
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
        return new Float32Array(axis._vertice)
    },

    _indices: [
        0
    ],

    indices: () => {
        axis.configuration()
        return new Uint32Array(axis._indices)
    },

    _color: [],

    color: () => {
        axis.configuration()
        return new Uint8Array(axis._color)
    },

    _texture: [],

    texture: () => {
        axis.configuration()
        return new Float32Array(axis._texture)
    }
}