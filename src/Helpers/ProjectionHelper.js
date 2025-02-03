import Geometry from "../Core/Geometry.js"
import Material from "../Core/Material.js"
import Line from "../Objects/Line.js"

export default class ProjectionHelper extends Line {
    constructor(wasm) {
        const geometry = new Geometry()
        geometry.setAttribute('position', projection.vertice(), { size: 3 })
        geometry.setIndice(projection.indices())
        const material = new Material()

        super(wasm, geometry, material)
        
        this.debug = true
    }

    onBeforeRender() {
        //this.worldMatrix = this.mat
    }
}

const projection = {
    vertice: () => {
        return new Float32Array([
            -1, -1, -1,
            1, -1, -1,
           -1,  1, -1,
            1,  1, -1,
           -1, -1,  1,
            1, -1,  1,
           -1,  1,  1,
            1,  1,  1,
        ])
    },

    indices: () => {
        return new Uint32Array([
            0, 1,
            1, 3,
            3, 2,
            2, 0,
         
            4, 5,
            5, 7,
            7, 6,
            6, 4,
         
            0, 4,
            1, 5,
            3, 7,
            2, 6,
        ])
    }
}