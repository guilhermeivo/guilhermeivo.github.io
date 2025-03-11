import Camera from "./Camera.js";

export default class DebugCamera extends Camera {
    constructor(wasm, transformation = {}, config = {}) {
        super(wasm, transformation, config)

        this.debug = true
        this.prefix = 'DEBUG'
    }

    _onBeforeRender() {
        this.zNear = Number(window[`${ this.prefix }_CAMERA_ZNEAR`])
        this.zFar = Number(window[`${ this.prefix }_CAMERA_ZFAR`])

        this.wasm.update(this.position, [ 
            Number(window[`${ this.prefix }_CAMERA_X`]), 
            Number(window[`${ this.prefix }_CAMERA_Y`]), 
            Number(window[`${ this.prefix }_CAMERA_Z`]) 
        ])

        this.orthographic = window[`${ this.prefix }_CAMERA_ORTHOGRAPHIC`]
        this.orthographicUnits = Number(window[`${ this.prefix }_CAMERA_UNITS`])

        this.fieldOfViewRadians = window[`${ this.prefix }_CAMERA_VIEW`]

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