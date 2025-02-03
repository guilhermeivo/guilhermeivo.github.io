import Attribute from "./Attribute.js"

export default class Geometry {
    constructor() {
        this.attributes = [ ]
        this.indice = null
    }

    setAttribute(name, data, config = {}) {
        const attr = this.attributes.find(attr => name === attr.name)
        if (attr) {
            delete attr.data
            attr.data = data
            return
        }
        this.attributes.push(new Attribute(name, data, config))
    }

    setIndice(indices) {
        this.indice = new Attribute('indice', indices)
    }
}