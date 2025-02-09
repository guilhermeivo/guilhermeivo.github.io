import Geometry from "../Core/Geometry.js"
import Line from "./Line.js"
import Material from "../Core/Material.js"

// TODO: fix axis indices
export default class Axis extends Line {
    constructor(wasm, transformations = { }) {
        const geometry = new Geometry()
        geometry.setAttribute('position', axis.vertice())
        //geometry.setAttribute('color', axis.color(), { type: UnsignedByte })
        //geometry.setAttribute('texcoord', axis.texture(), { size: 2 })
        geometry.setIndice(axis.indices())
        const material = new Material()
        
        super(wasm, geometry, material, transformations)

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
    },

    _vertice: [
        0, 0, 0,
    ], 

    vertice: () => {
        //axis.configuration()
        return new Float32Array(axis._vertice)
    },

    _indices: [
        0
    ],

    indices: () => {
        //axis.configuration()
        return new Uint32Array(axis._indices)
    }
}