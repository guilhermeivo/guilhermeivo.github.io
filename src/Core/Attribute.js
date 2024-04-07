import { ArrayBuffer, FloatType } from "../constants.js"

export default class Attribute {
    constructor(name, data, config = { }) {
        this.name = name
        this.data = data
        this.size = config.size || 3
        this.type = FloatType
        this.normalize = config.normalize || true
        this.stride = config.stride || 0
        this.offset = config.offset || 0

        this.target = config.target || ArrayBuffer // ARRAY_BUFFER
        this.buffer = null
    }

    bind(gl) {
        this.buffer = gl.createBuffer()

        gl.bindBuffer(this.target, this.buffer)  
        gl.bufferData(this.target, this.data, gl.STATIC_DRAW)
    }

    deleteBuffer(gl) {
        gl.deleteBuffer(this.buffer)
        this.buffer = null
    }
}