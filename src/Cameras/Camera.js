import Vector3 from "../Math/Vector3.js";
import Matrix4 from "../Math/Matrix4.js";
import Object3 from "../Objects/Object3.js";

export default class Camera extends Object3 {
    constructor(transformation = {}, config = {}) {
        super(transformation)

        this.type = 'camera'

        this.aspect = 1

        this.zNear = config.zNear || 0
        this.zFar = config.zFar || 1
        this.fieldOfViewRadians = config.fieldOfViewRadians || Math.degreeToRadians(60)

        this.orthographic = config.orthographic || false
        this.orthographicUnits = config.orthographicUnits || 1

        this.parent = null

        this.target = new Vector3(0, 0, 0)
        this.up = new Vector3(0, 1, 0)

        this.projectionMatrix = new Matrix4()
        this.cameraMatrix = new Matrix4()
        this.viewMatrix = new Matrix4()
        this.projectionViewMatrix = new Matrix4()
    }

    _onBeforeRender() {
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
        this.cameraMatrix.lookAt(
            !this.parent ? this.position.elements : this.parent.position.elements,
            this.target.elements, 
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

