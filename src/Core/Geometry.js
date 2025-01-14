import { FloatType } from "./constants.js"
import Attribute from "./Attribute.js"

export default class Geometry {
    constructor() {
        this.attributes = [ ]
        this.indice = null
    }

    setAttribute(name, data, config = {}) {
        const attr = this.attributes.find(attr => name === attr.name)
        if (attr) {
            attr.data = data
            return
        }
        this.attributes.push(new Attribute(name, data, {
            size: config.size,
            type: FloatType,
            normalize: config.normalize,
            stride: config.stride,
            offset: config.offset
        }))
    }

    setIndice(indices) {
        this.indice = new Attribute('indice', indices)
    }
}