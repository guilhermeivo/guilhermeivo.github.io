import Camera from "./Camera.js";

`use strict`

export default class DebugCamera extends Camera {
    constructor(gl, aspect, transformation = {}, config = {}) {
        super(gl, aspect, transformation, config)

        this.type = 'camera'
        this.prefix = 'DEBUG_CAMERA'
    }

    update() {
        this.mesh.location[0] = Number(window[`${ this.prefix }_X`])
        this.mesh.location[1] = Number(window[`${ this.prefix }_Y`])
        this.mesh.location[2] = Number(window[`${ this.prefix }_Z`])
        this.orthographic = window[`${ this.prefix }_ORTHOGRAPHIC`]
        this.orthographicUnits = Number(window[`${ this.prefix }_UNITS`])

        this.projectionViewMatrix.reset()
        
        // perspective or projection matrix
        this.projectionMatrix = this.orthographic 
        ? m4.orthographic(
            -this.orthographicUnits * this.aspect,  // left
            this.orthographicUnits * this.aspect,   // right
            -this.orthographicUnits,           // bottom
            this.orthographicUnits,            // top
            this.zNear,
            this.zFar)
        : m4.perspective(this.fieldOfViewRadians, this.aspect, this.zNear, this.zFar)

        // camera matrix
        let location = !!this.parent.mesh ? this.parent.mesh.location : this.parent.location
        this.cameraMatrix = m4.lookAt(
            location, 
            !!this.target.mesh ? this.target.mesh.location : this.target, this.up)

        // Make a view matrix from the camera matrix
        this.viewMatrix = m4.inverse(this.cameraMatrix)

        // move the projection space to view space (the space in front of the camera)
        // perspective or projection matrix * view matrix
        m4.multiply(this.projectionViewMatrix, this.projectionMatrix, this.viewMatrix)

        this.modelMatrix = this.cameraMatrix
    }
}