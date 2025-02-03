import Light from "./Light.js";

export default class DebugLight extends Light {
    constructor(wasm, configs = { }) {
        super(wasm, configs)

        this.debug = true
    }

    _onBeforeRender() {
        this.position[0] = Number(window[`${ this.prefix }_X`])
        this.position[1] = Number(window[`${ this.prefix }_Y`])
        this.position[2] = Number(window[`${ this.prefix }_Z`])
    }
}