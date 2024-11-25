import monkey from "../../resources/monkey/monkey.js"
import { UnsignedByte } from "../Core/constants.js"
import Geometry from "../Core/Geometry.js"
import Material from "../Core/Material.js"
import Mesh from "../Core/Mesh.js"
import Vector3 from "../Math/Vector3.js"
import Object3 from "../Objects/Object3.js"

export default class Monkey extends Mesh {
    constructor() {
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
        geometry.setAttribute('color', monkey.color(), { size: 2, type: UnsignedByte })
        geometry.setAttribute('normal', monkey.normal())
        geometry.setAttribute('texcoord', monkey.texture(), { size: 2, normalize: false })
        const material = new Material()

        super(geometry, material, {
            position: new Vector3(2, 3, 4)
        })
    }
}