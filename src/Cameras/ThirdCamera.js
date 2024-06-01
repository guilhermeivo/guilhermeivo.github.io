import Matrix4 from "../Math/Matrix4.js";
import Camera from "./Camera.js";

// TODO: remake
export default class ThirdCamera extends Camera {
    constructor(target, config = {}) {
        super({ }, config)
        this.parent = target
        this.target = target

        this.tempLocation = new Matrix4()

        this._onBeforeRender()
    }

    _onBeforeRender() {
        this.projectionViewMatrix.identity()
        
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
        if (!this.parent.mesh) return

        m4.identity(this.tempLocation)
	
        m4.xRotate(this.tempLocation, this.tempLocation, this.parent.mesh.rotation[0])
        m4.yRotate(this.tempLocation, this.tempLocation, this.parent.mesh.rotation[1])
        m4.yRotate(this.tempLocation, this.tempLocation, this.parent.mesh.rotation[2])
        m4.translate(
            this.tempLocation, this.tempLocation, 
            this.parent.mesh.location[0], 
            this.parent.mesh.location[1] + 100, 
            this.parent.mesh.location[2] - 200)
        this.cameraMatrix = m4.lookAt(
            this.tempLocation.translation, this.parent.mesh.location, this.up
        )

        // Make a view matrix from the camera matrix
        this.viewMatrix = m4.inverse(this.cameraMatrix)

        // move the projection space to view space (the space in front of the camera)
        // perspective or projection matrix * view matrix
        m4.multiply(this.projectionViewMatrix, this.projectionMatrix, this.viewMatrix)

        this.modelMatrix = this.cameraMatrix
    }
}