import { ObjectType, Object3 } from "./Object3.js"

export default class Mesh extends Object3 {
    constructor(wasm, geometry, material, transformations = {}) {
        super(wasm, transformations)

        this.geometry = geometry
        this.material = material

        this.type = ObjectType.MESH
    }
}