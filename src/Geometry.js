export default class Geometry {
    constructor(gl) {
        this.gl = gl
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
                type: config.type || this.gl.FLOAT,
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