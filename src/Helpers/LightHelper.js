import Geometry from "../Core/Geometry.js";
import Material from "../Core/Material.js";
import Line from "../Objects/Line.js";

export default class LightHelper extends Line {
    constructor(wasm, lightElement, transformation) {
        const geometry = new Geometry()
        geometry.setAttribute('position', light.vertice(lightElement))
        //geometry.setAttribute('color', light.color(), { type: UnsignedByte })
        //geometry.setAttribute('texcoord', light.texture(), { size: 2 })
        geometry.setIndice(light.indices(lightElement))
        const material = new Material()

        super(wasm, geometry, material, transformation)

        this.parent = lightElement
        this.debug = true
    }
}

const light = {
    isConfigured: false,

    configuration: (lightElement) => {
        if (light.isConfigured) return

        light.isConfigured = true

        let numSegments = 12
        let indexIndice = 0
        for (let i = 0; i < numSegments; ++i) {
            const u = i / numSegments
            const angle = u * Math.PI * 2
            const x = Math.cos(angle)
            const y = Math.sin(angle)
            light._vertice.push(x * 0.05, y * 0.05, 0)
            
            
            light._indices.push(indexIndice, (indexIndice + 1) % numSegments)
            indexIndice++
        }

        numSegments*=2
        for (let i = 0; i < numSegments; ++i) {
            const u = i / numSegments
            const angle = u * Math.PI * 2
            const x = Math.cos(angle)
            const y = Math.sin(angle)
            light._vertice.push(x * 0.1, y * 0.1, 0)
            light._indices.push(indexIndice)
            indexIndice++
        }

        const lightItensity = lightElement.uniforms.list.find(item => item.location == "itensity").value[0]
        const itensity = lightItensity < 0.5 ? 0.5 : lightItensity
        numSegments*=1.5
        for (let i = 0; i < numSegments; ++i) {
            const u = i / numSegments
            const angle = u * Math.PI * 2
            const x = Math.cos(angle)
            const y = Math.sin(angle)
            light._vertice.push(x * itensity, y * itensity, 0)
            light._indices.push(indexIndice)
            indexIndice++
        }

        light._vertice.forEach((v, ndx) => {
            light._vertice[ndx] *= 2
        })
    },

    _vertice: [], 

    vertice: (lightElement) => {
        light.configuration(lightElement)
        return  new Float32Array(light._vertice)
    },

    _indices: [],

    indices: (lightElement) => {
        light.configuration(lightElement)
        return new Uint32Array(light._indices)
    }
}