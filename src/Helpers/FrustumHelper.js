import Geometry from "../Core/Geometry.js";
import Material from "../Core/Material.js";
import Line from "../Objects/Line.js";

export default class FrustumHelper extends Line {
    constructor(wasm, cameraElement) {
        const geometry = new Geometry()
        geometry.setAttribute('position', frustum.vertice())
        //geometry.setAttribute('color', frustum.color(), { type: UnsignedByte })
        //geometry.setAttribute('texcoord', frustum.texture(), { size: 2 })
        geometry.setIndice(frustum.indices())
        const material = new Material()

        super(wasm, geometry, material)
        
        this.camera = cameraElement
        this.debug = true
    }

    onBeforeRender() {
        // TODO:
        //this.worldMatrix.invert(this.camera.projectionViewMatrix)
    }
}

const frustum = {
    isConfigured: false,

    configuration: () => {
        if (frustum.isConfigured) return

        frustum.isConfigured = true
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
    }
}