export default class Attribute {
    constructor(data, size, normalized, type) {
        this.data = data
        this.size = size
        this.normalized = normalized
        this.type = type
        this.count = this.data.length / this.size
    }
}