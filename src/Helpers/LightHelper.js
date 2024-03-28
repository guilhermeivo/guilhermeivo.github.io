import _Object from "../_Object.js";

export default class LightHelper extends _Object {
    constructor(lightElement) {
        super(lightElement.gl, lightElement.mesh, 'light')
        lightElement.mesh.geometry.setAttribute('position', light.vertice())
        lightElement.mesh.geometry.setAttribute('color', light.color())
        lightElement.mesh.geometry.setAttribute('texcoord', light.texture(), { size: 2 })
        lightElement.mesh.geometry.setIndice(light.indices())

        this.debug = true
        this.light = lightElement
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
        scene.shader.setUniform('u_world', this.light.worldMatrix, scene.shader.types.mat4)

        const primitiveType = this.gl.LINES
        const offset = 0
        const indexType = this.gl.UNSIGNED_INT
        this.gl.drawElements(primitiveType, light.indices().length, indexType, offset)
    }
}

const light = {
    isConfigured: false,

    configuration: () => {
        if (light.isConfigured) return

        light.isConfigured = true

        let numSegments = 12
        let indexIndice = 0
        for (let i = 0; i < numSegments; ++i) {
            const u = i / numSegments
            const angle = u * Math.PI * 2
            const x = Math.cos(angle)
            const y = Math.sin(angle)
            light._vertice.push(x, y, 0)
            
            
            light._indices.push(indexIndice, (indexIndice + 1) % numSegments)
            indexIndice++
        }

        numSegments*=2
        for (let i = 0; i < numSegments; ++i) {
            const u = i / numSegments
            const angle = u * Math.PI * 2
            const x = Math.cos(angle)
            const y = Math.sin(angle)
            light._vertice.push(x * 5, y * 5, 0)
            light._indices.push(indexIndice)
            indexIndice++
        }

        numSegments*=1.5
        for (let i = 0; i < numSegments; ++i) {
            const u = i / numSegments
            const angle = u * Math.PI * 2
            const x = Math.cos(angle)
            const y = Math.sin(angle)
            light._vertice.push(x * 6, y * 6, 0)
            light._indices.push(indexIndice)
            indexIndice++
        }

        light._vertice.forEach((v, ndx) => {
            light._vertice[ndx] *= 2
        })

        for (let i = 0; i < light._vertice.length / 3; i++) {
            for (let j = 0; j < 4; j++) {
                light._color.push(1)
            }
            for (let j = 0; j < 2; j++) {
                light._texture.push(1)
            }
        }
    },

    _vertice: [], 

    vertice: () => {
        light.configuration()
        return light._vertice
    },

    _indices: [],

    indices: () => {
        light.configuration()
        return light._indices
    },

    _color: [],

    color: () => {
        light.configuration()
        return light._color
    },

    _texture: [],

    texture: () => {
        light.configuration()
        return light._texture
    }
}