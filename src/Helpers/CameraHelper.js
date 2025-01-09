import Geometry from "../Core/Geometry.js";
import Material from "../Core/Material.js";
import Lines from "../Objects/Lines.js";
import { UnsignedByte } from "../Core/constants.js";

export default class CameraHelper extends Lines {
    constructor(cameraElement) {
        const geometry = new Geometry()
        geometry.setAttribute('position', camera.vertice())
        //geometry.setAttribute('color', camera.color(), { type: UnsignedByte })
        //geometry.setAttribute('texcoord', camera.texture(), { size: 2 })
        geometry.setIndice(camera.indices())
        const material = new Material()

        super(geometry, material)
        
        this.camera = cameraElement
        this.debug = true
    }

    onBeforeRender() {
        this.worldMatrix = this.camera.modelMatrix
    }
}

const camera = {
    isConfigured: false,

    configuration: () => {
        if (camera.isConfigured) return

        camera.isConfigured = true

        const numSegments = 6
        const coneBaseIndex = camera._vertice.length / 3
        const coneTipIndex =  coneBaseIndex - 1
        for (let i = 0; i < numSegments; ++i) {
            const u = i / numSegments
            const angle = u * Math.PI * 2
            const x = Math.cos(angle)
            const y = Math.sin(angle)
            camera._vertice.push(x, y, 0)
            // line from tip to edge
            camera._indices.push(coneTipIndex, coneBaseIndex + i)
            // line from point on edge to next point on edge
            camera._indices.push(coneBaseIndex + i, coneBaseIndex + (i + 1) % numSegments)
        }
        camera._vertice.forEach((v, ndx) => {
            camera._vertice[ndx] *= 1
        })
    },

    _vertice: [
        -1, -1,  1, 
        1, -1,  1,
       -1,  1,  1,
        1,  1,  1,
       -1, -1,  3,
        1, -1,  3,
       -1,  1,  3,
        1,  1,  3,
        0,  0,  1, 
    ], 

    vertice: () => {
        camera.configuration()
        return new Float32Array(camera._vertice)
    },

    _indices: [
        0, 1, 1, 3, 3, 2, 2, 0,
        4, 5, 5, 7, 7, 6, 6, 4,
        0, 4, 1, 5, 3, 7, 2, 6,
    ],

    indices: () => {
        camera.configuration()
        return new Uint32Array(camera._indices)
    }
}