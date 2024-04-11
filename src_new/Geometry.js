export default class Geometry {
    constructor() {
        this.indice = null
        this.attributes = { }
    }

    setAttribute(name, attribute) {
        this.attributes[name] = attribute
    }

    setIndice(indices) {
        this.indice = new Attribute('indice', indices)
    }
}