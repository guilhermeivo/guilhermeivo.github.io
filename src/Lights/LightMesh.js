import Geometry from "../Core/Geometry.js"
import Material from "../Core/Material.js"
import Mesh from "../Mesh.js"

export default class LightMesh extends Mesh {
    constructor(transformation) {
        const geometry = new Geometry()
        const material = new Material()
        super(geometry, material, transformation)
    }
}