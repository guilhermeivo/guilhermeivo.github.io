import Vector3 from './Vector3.js'

export default class Object3 {
    constructor() {
        this.parent = null
        this.children = []

        this.position = new Vector3()
        this.rotation = new Vector3()
        this.scale = new Vector3(1, 1, 1)
    }

    add(object) {
        if (object === this) return
    }
}