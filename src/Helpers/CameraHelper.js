import _Object from "../_Object.js";

export default class CameraHelper extends _Object {
    constructor(cameraElement) {
        super(cameraElement.gl, cameraElement.mesh, 'camera')
        cameraElement.mesh.geometry.setAttribute('position', camera.vertice())
        cameraElement.mesh.geometry.setAttribute('color', camera.color())
        cameraElement.mesh.geometry.setAttribute('texcoord', camera.texture(), { size: 2 })
        cameraElement.mesh.geometry.setIndice(camera.indices())

        this.debug = true
        this.camera = cameraElement
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

    update() { }

    _draw(scene) {
        scene.shader.setUniform('u_projection', scene.camera.projectionMatrix, scene.shader.types.mat4)
        scene.shader.setUniform('u_view', scene.camera.viewMatrix, scene.shader.types.mat4)
        scene.shader.setUniform('u_world', this.camera.modelMatrix, scene.shader.types.mat4)

        const primitiveType = this.gl.LINES
        const offset = 0
        const indexType = this.gl.UNSIGNED_INT
        this.gl.drawElements(primitiveType, camera.indices().length, indexType, offset)
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
            for (let j = 0; j < 4; j++) {
                camera._color.push(1)
            }
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
        return camera._vertice
    },

    _indices: [
        0, 1, 1, 3, 3, 2, 2, 0,
        4, 5, 5, 7, 7, 6, 6, 4,
        0, 4, 1, 5, 3, 7, 2, 6,
    ],

    indices: () => {
        camera.configuration()
        return camera._indices
    },

    _color: [],

    color: () => {
        camera.configuration()
        return camera._color
    },

    _texture: [],

    texture: () => {
        camera.configuration()
        return camera._texture
    }
}