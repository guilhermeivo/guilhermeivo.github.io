import { FloatType } from "../constants.js"

export default class Geometry {
    constructor() {
        this.attributes = { }
        this.indice = null
    }

    setAttribute(name, data, config = {}) {
        this.attributes = {
            ...this.attributes,
            [`a_${ name }`]: {
                name: name,
                data: data,
                size: config.size || 3,
                type: FloatType,
                normalize: config.normalize || true,
                stride: config.stride || 0,
                offset: config.offset || 0
            }
        }
    }

    setIndice(indices) {
        this.indice = indices
    }
}