import { Uniform } from "./Uniform.js"

export default class Uniforms {
    constructor() {
        this.list = []
    }

    add(location, value, type) {
        this.list.push(new Uniform(location, value, type))
    }
}