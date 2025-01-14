import Camera from "./Camera.js";

export default class DebugCamera extends Camera {
    constructor(transformation = {}, config = {}) {
        super(transformation, config)

        this.type = 'camera'
        this.prefix = 'DEBUG_CAMERA'

        this.aspect = 1

        window[`${ this.prefix }_VIEW`] = this.fieldOfViewRadians
    }

    _onBeforeRender() {
        this.zNear = Number(window[`${ this.prefix }_ZNEAR`])
        this.zFar = Number(window[`${ this.prefix }_ZFAR`])

        this.position.elements[0] = Number(window[`${ this.prefix }_X`])
        this.position.elements[1] = Number(window[`${ this.prefix }_Y`])
        this.position.elements[2] = Number(window[`${ this.prefix }_Z`])

        this.orthographic = window[`${ this.prefix }_ORTHOGRAPHIC`]
        this.orthographicUnits = Number(window[`${ this.prefix }_UNITS`])

        this.fieldOfViewRadians = window[`${ this.prefix }_VIEW`]

        this.projectionViewMatrix.identity()

        // perspective or projection matrix
        this.orthographic 
        ? this.projectionMatrix.orthographic(
            -this.orthographicUnits * this.aspect,  // left
            this.orthographicUnits * this.aspect,   // right
            -this.orthographicUnits,           // bottom
            this.orthographicUnits,            // top
            this.zNear,
            this.zFar)
        : this.projectionMatrix.perspective(this.fieldOfViewRadians, this.aspect, this.zNear, this.zFar)

        // camera matrix
        let target = !this.parent ? this.target.elements : this.parent.position.elements
        
        this.cameraMatrix.lookAt(
            !this.parent ? this.position.elements : this.parent.position.elements, 
            target, 
            this.up.elements)


        // Make a view matrix from the camera matrix
        this.viewMatrix.invert(this.cameraMatrix)

        // move the projection space to view space (the space in front of the camera)
        // perspective or projection matrix * view matrix
        this.projectionViewMatrix.multiply(this.projectionMatrix)
        this.projectionViewMatrix.multiply(this.viewMatrix)

        this.modelMatrix = this.cameraMatrix
    }
}