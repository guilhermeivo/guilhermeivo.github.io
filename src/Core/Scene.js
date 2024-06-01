import Object3 from "../Objects/Object3.js"

export default class Scene extends Object3 {
    constructor() {
        super()

        this.lights = [ ]
    }

    addLight(light) {
        this.lights.push(light)
    }
}