import { FloatType } from "../constants.js"

export default class Attribute {
    constructor(name, data, config = { }) {
        this.name = name
        this.data = data
        this.size = config.size || 3
        this.type = FloatType
        this.normalize = config.normalize || true
        this.stride = config.stride || 0
        this.offset = config.offset || 0
    }
}