import Camera from "./Camera.js";

export default class DebugCamera extends Camera {
    constructor(wasm, transformation = {}, config = {}) {
        super(wasm, transformation, config)

        this.debug = true

        window[`${ this.prefix }_VIEW`] = this.fieldOfViewRadians
    }

    _onBeforeRender() {
        this.zNear = Number(window[`${ this.prefix }_ZNEAR`])
        this.zFar = Number(window[`${ this.prefix }_ZFAR`])

        // TODO:
        //this.position.elements[0] = Number(window[`${ this.prefix }_X`])
        //this.position.elements[1] = Number(window[`${ this.prefix }_Y`])
        //this.position.elements[2] = Number(window[`${ this.prefix }_Z`])

        this.orthographic = window[`${ this.prefix }_ORTHOGRAPHIC`]
        this.orthographicUnits = Number(window[`${ this.prefix }_UNITS`])

        this.fieldOfViewRadians = window[`${ this.prefix }_VIEW`]

        const position = !this.parent ? this.position : this.parent.position
        const target = !this.parent ? this.target : this.parent.position

        this.wasm.exports.cameraMatrix(
            this.projectionViewMatrix.byteOffset, 
            this.projectionMatrix.byteOffset, 
            this.cameraMatrix.byteOffset, 
            this.viewMatrix.byteOffset,
            this.worldMatrix.byteOffset,
            position.byteOffset,
            target.byteOffset,
            this.up.byteOffset,
            this.orthographicUnits,
            this.aspect,
            this.zNear,
            this.zFar,
            this.fieldOfViewRadians,
            this.orthographic)
    }
}