import Object3 from "./Object3.js"

export default class Mesh extends Object3 {
    constructor(geometry, material) {
        super()
        
        this.geometry = geometry
        this.material = material
    }
}