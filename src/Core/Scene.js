import Object3 from "../Objects/Object3.js"

export default class Scene extends Object3 {
    constructor() {
        super()

        this.lights = [ ]

        this.ids = 1
    }

    add(object) {
        if (object === this) return

        this.children.push(object)

        this.setId(object)
    }

    setId(object) {
        if (object.type == 'collection') {
            object.children.forEach(element => {
                this.setId(element)
            })
        }

        object.id = this.ids
        this.ids++
    }

    getById(objects, id) {
        return new Promise(resolve => {
            objects.forEach(object => {
                if (object.id == id) resolve(object)
            })
        })
    }

    addLight(light) {
        this.lights.push(light)
    }
}