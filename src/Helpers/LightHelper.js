import Geometry from "../Core/Geometry.js";
import Material from "../Core/Material.js";
import Lines from "../Objects/Lines.js";
import { UnsignedByte } from "../Core/constants.js";

export default class LightHelper extends Lines {
    constructor(lightElement) {
        const geometry = new Geometry()
        geometry.setAttribute('position', light.vertice())
        //geometry.setAttribute('color', light.color(), { type: UnsignedByte })
        //geometry.setAttribute('texcoord', light.texture(), { size: 2 })
        geometry.setIndice(light.indices())
        const material = new Material()

        super(geometry, material)

        this.parent = lightElement
        this.debug = true
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
    }
}