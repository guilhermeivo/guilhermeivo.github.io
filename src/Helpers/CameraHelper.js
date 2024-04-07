import Lines from "../Objects/Lines.js";

`use strict`

export default class CameraHelper extends Lines {
    constructor(cameraElement) {
        super(cameraElement.gl, cameraElement.mesh, 'camera')
        cameraElement.mesh.geometry.setAttribute('position', camera.vertice())
        cameraElement.mesh.geometry.setAttribute('color', camera.color(), { type: cameraElement.gl.UNSIGNED_BYTE })
        cameraElement.mesh.geometry.setAttribute('texcoord', camera.texture(), { size: 2 })
        cameraElement.mesh.geometry.setIndice(camera.indices())

        this.debug = true
        this.camera = cameraElement
    }

    update() {
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
            camera._vertice[ndx] *= 20
        })
        for (let i = 0; i < camera._vertice.length / 3; i++) {
            camera._color.push(1, 1, 1, 1)
            for (let j = 0; j < 2; j++) {
                camera._texture.push(1)
            }
        }
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
    },

    _color: [],

    color: () => {
        camera.configuration()
        return new Uint8Array(camera._color)
    },

    _texture: [],

    texture: () => {
        camera.configuration()
        return new Float32Array(camera._texture)
    }
}