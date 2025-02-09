import monkey from "./monkey_data.js"
import Geometry from "../Core/Geometry.js"
import Material from "../Core/Material.js"
import Mesh from "../Objects/Mesh.js"

export default class Monkey extends Mesh {
    constructor(wasm, transformation) {
        const geometry = new Geometry()
        geometry.setAttribute('position', monkey.vertice(), { size: 3 })
        
        // convert color to rgba
        let color = monkey.color()
        for (let i = 3; i < color.length; i+=3) {
            color = [
                ...color.slice(0, i),
                1.0,
                ...color.slice(i)
            ]
            i++
        }
        geometry.setAttribute('color', monkey.color(), { size: 2 })
        geometry.setAttribute('normal', monkey.normal())
        geometry.setAttribute('texcoord', monkey.texture(), { size: 2, normalize: false })
        const material = new Material()
        material.name = 'monkey'

        super(wasm, geometry, material, transformation)
    }
}