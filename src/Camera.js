export default class Camera {
    constructor(aspect, transformation = {}, config = {}) {
        this.location = transformation.location || [ 0, 0, 0 ] // viewWorldPosition
        this.rotation = transformation.rotation || [ 0, 0, 0 ]
        this.scale = transformation.scale || [ 1, 1, 1 ]
        
        this.aspect = aspect

        this.zNear = config.zNear || 0
        this.zFar = config.zFar || 1
        this.fieldOfViewRadians = config.fieldOfViewRadians || Math.degreeToRadians(60)

        this.orthographic = config.orthographic || false
        this.orthographicUnits = config.orthographicUnits || 1

        this.target = [ 0, 0, 0 ]
        this.up = [0, 1, 0]

        this.projectionMatrix = new Matrix4()
        this.cameraMatrix = new Matrix4()
        this.viewMatrix = new Matrix4()
        this.projectionViewMatrix = new Matrix4()

        this.type = 'camera'

        this.init()
    }

    init() {
        this.reset()
        
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
        this.cameraMatrix = m4.lookAt(this.location, this.target, this.up)

        // Make a view matrix from the camera matrix
        this.viewMatrix = m4.inverse(this.cameraMatrix)

        // move the projection space to view space (the space in front of the camera)
        // perspective or projection matrix * view matrix
        m4.multiply(this.projectionViewMatrix, this.projectionMatrix, this.viewMatrix)
    }

    reset() {
        this.projectionViewMatrix.reset()
    }
}