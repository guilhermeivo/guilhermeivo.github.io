import { FloatType } from "./constants.js"

export default class Attribute {
    /**
     * @param {{
     *  size:int;
     *  normalize:boolean;
     *  stride:int;
     *  offset:int;
     *  type:int;
     * }} config 
     */
    constructor(name, data, config = { }) {
        this.name = name
        this.data = data
        this.size = config.size || 3
        this.type = config.type || FloatType
        this.normalize = config.normalize || true
        this.stride = config.stride || 0
        this.offset = config.offset || 0
    }

    update(data) {
        delete this.data
        this.data = data
    }
}