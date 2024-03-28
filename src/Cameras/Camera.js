import CameraMesh from "./CameraMesh.js";
import BasicObject from "../Objects/BasicObject.js";

export default class Camera extends BasicObject {
    constructor(gl, aspect, transformation = {}, config = {}) {
        const mesh = new CameraMesh(transformation)
        super(gl, mesh, 'camera')

        this.type = 'camera'

        this.aspect = aspect

        this.zNear = config.zNear || 0
        this.zFar = config.zFar || 1
        this.fieldOfViewRadians = config.fieldOfViewRadians || Math.degreeToRadians(60)

        this.orthographic = config.orthographic || false
        this.orthographicUnits = config.orthographicUnits || 1

        this.parent = this

        this.target = new Vector3([ 0, 0, 0 ])
        this.up = new Vector3([0, 1, 0])

        this.projectionMatrix = new Matrix4()
        this.cameraMatrix = new Matrix4()
        this.viewMatrix = new Matrix4()
        this.projectionViewMatrix = new Matrix4()
    }

    init(scene) { }

    update() {
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
        let location = !!this.parent.mesh
            ? this.parent.mesh.location 
            : this.parent.location
        let target = !!this.target.mesh 
            ? this.target.mesh.location 
            : this.target
        this.cameraMatrix = m4.lookAt(location, target, this.up)

        // Make a view matrix from the camera matrix
        this.viewMatrix = m4.inverse(this.cameraMatrix)

        // move the projection space to view space (the space in front of the camera)
        // perspective or projection matrix * view matrix
        m4.multiply(this.projectionViewMatrix, this.projectionMatrix, this.viewMatrix)

        this.modelMatrix = this.cameraMatrix
    }
}

