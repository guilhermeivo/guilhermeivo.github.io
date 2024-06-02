import Geometry from "../Core/Geometry.js";
import Material from "../Core/Material.js";
import Lines from "../Objects/Lines.js";
import { UnsignedByte } from "../Core/constants.js";

export default class FrustumHelper extends Lines {
    constructor(cameraElement) {
        const geometry = new Geometry()
        geometry.setAttribute('position', frustum.vertice())
        geometry.setAttribute('color', frustum.color(), { type: UnsignedByte })
        geometry.setAttribute('texcoord', frustum.texture(), { size: 2 })
        geometry.setIndice(frustum.indices())
        const material = new Material()

        super(geometry, material)
        
        this.camera = cameraElement
        this.debug = true
    }

    onBeforeRender() {
        this.worldMatrix.invert(this.camera.projectionViewMatrix)
    }
}

const frustum = {
    isConfigured: false,

    configuration: () => {
        if (frustum.isConfigured) return

        frustum.isConfigured = true

        for (let i = 0; i < frustum._vertice.length / 4; i++) {
            for (let j = 0; j < 3; j++) {
                frustum._color.push(1)
            }
            for (let j = 0; j < 2; j++) {
                frustum._texture.push(1)
            }
        }
    },

    _vertice: [
        -1, -1, -1,  // cube vertices
        1, -1, -1,
        -1,  1, -1,
        1,  1, -1,
        -1, -1,  1,
        1, -1,  1,
        -1,  1,  1,
        1,  1,  1,
    ], 

    vertice: () => {
        frustum.configuration()
        return new Float32Array(frustum._vertice)
    },

    _indices: [
        0, 1, 1, 3, 3, 2, 2, 0, // cube indices
        4, 5, 5, 7, 7, 6, 6, 4,
        0, 4, 1, 5, 3, 7, 2, 6,
    ],

    indices: () => {
        frustum.configuration()
        return new Uint32Array(frustum._indices)
    },

    _color: [],

    color: () => {
        frustum.configuration()
        return new Uint8Array(frustum._color)
    },

    _texture: [],

    texture: () => {
        frustum.configuration()
        return new Float32Array(frustum._texture)
    }
}