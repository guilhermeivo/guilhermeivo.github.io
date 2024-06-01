import Object3 from "./Object3.js"

export default class Lines extends Object3 {
    constructor(geometry, material, transformation = {}) {
        super(transformation)

        this.geometry = geometry
        this.material = material

        this.type = 'line'
    }
}