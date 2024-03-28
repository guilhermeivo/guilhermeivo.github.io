import Light from "./Light.js";

export default class DebugLight extends Light {
    constructor(scene, configs = { }) {
        super(scene, configs)

        this.type = 'light'
        this.prefix = 'DEBUG_LIGHT'
    }

    init(scene) { }

    _update() {
        this.mesh.location[0] = Number(window[`${ this.prefix }_X`])
        this.mesh.location[1] = Number(window[`${ this.prefix }_Y`])
        this.mesh.location[2] = Number(window[`${ this.prefix }_Z`])
    }

    draw(scene) { }
}