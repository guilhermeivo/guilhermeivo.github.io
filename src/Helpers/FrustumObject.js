import Geometry from "../Core/Geometry.js";
import Material from "../Core/Material.js";
import Mesh from "../Mesh.js";
import Object from "../_Object.js";

export default class FrustumObject extends Object {
    constructor(scene) {
        const geometry = new Geometry()
        geometry.setAttribute('position', frustum.vertice())
        geometry.setAttribute('color', frustum.color())
        geometry.setAttribute('texcoord', frustum.texture(), { size: 2 })
        geometry.setIndice(frustum.indices())
        const material = new Material()
        const mesh = new Mesh(geometry, material)
        super(scene, mesh, 'frustum')

        this.type = 'camera'

        this.init()
    }

    _init() {
        // vbo & ebo
        this.scene.shader.setAttribute('a_position', [
            this.mesh.geometry.attributes['a_position'].data,
            { data: this.mesh.geometry.indice, target: this.gl.ELEMENT_ARRAY_BUFFER },
        ])

        this.scene.shader.setAttribute('a_color', this.mesh.geometry.attributes['a_color'].data, {
            type: this.gl.UNSIGNED_BYTE
        })

        this.scene.shader.setAttribute('a_texcoord', this.mesh.geometry.attributes['a_texcoord'].data, {
            size: 2
        })
    }

    _draw() {
        this.scene.shader.setUniform('u_projection', this.scene.camera.projectionMatrix, this.scene.shader.types.mat4)
        this.scene.shader.setUniform('u_view', this.scene.camera.viewMatrix, this.scene.shader.types.mat4)
        this.scene.shader.setUniform('u_world', this.modelMatrix, this.scene.shader.types.mat4)

        const primitiveType = this.gl.LINES
        const offset = 0
        const indexType = this.gl.UNSIGNED_INT
        this.gl.drawElements(primitiveType, this.mesh.geometry.indice.length, indexType, offset)
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