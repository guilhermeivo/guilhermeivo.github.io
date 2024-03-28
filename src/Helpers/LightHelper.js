import Lines from "../Objects/Lines.js";

export default class LightHelper extends Lines {
    constructor(lightElement) {
        super(lightElement.gl, lightElement.mesh, 'light')
        lightElement.mesh.geometry.setAttribute('position', light.vertice())
        lightElement.mesh.geometry.setAttribute('color', light.color(), { type: lightElement.gl.UNSIGNED_BYTE })
        lightElement.mesh.geometry.setAttribute('texcoord', light.texture(), { size: 2 })
        lightElement.mesh.geometry.setIndice(light.indices())

        this.debug = true
        this.light = lightElement
    }

    update() { 
        this.worldMatrix = this.light.worldMatrix
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
        return  new Float32Array(light._vertice)
    },

    _indices: [],

    indices: () => {
        light.configuration()
        return new Uint32Array(light._indices)
    },

    _color: [],

    color: () => {
        light.configuration()
        return  new Uint8Array(light._color)
    },

    _texture: [],

    texture: () => {
        light.configuration()
        return new Float32Array(light._texture)
    }
}