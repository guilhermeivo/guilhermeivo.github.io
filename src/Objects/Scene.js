import { ObjectType, Object3 } from "./Object3.js"

export default class Scene extends Object3 {
    constructor(wasm) {
        super(wasm)

        this.lights = [ ]

        this.ids = 1
    }

    add(object) {
        if (object === this) return

        this.children.push(object)

        this.setId(object)
    }

    setId(object) {
        if (object.type == ObjectType.COLLECTION) {
            object.children.forEach(element => {
                this.setId(element)
            })
        }

        object.id = this.ids
        this.ids++
    }

    getById(objects, id) {
        return new Promise((resolve, reject) => {
            objects.forEach(object => {
                if (object.id == id) resolve(object)
            })
            reject()
        })
    }

    addLight(light) {
        this.lights.push(light)
    }
}