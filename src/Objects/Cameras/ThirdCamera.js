import Camera from "./Camera.js";

export default class ThirdCamera extends Camera {
    constructor(wasm, target, config = {}) {
        super(wasm, { }, config)
        this.parent = target
    }

    _onBeforeRender() {
// TODO:
/*
void _onBeforeRender(float fps) {
    this->projectionViewMatrix.identity();

    // perspective or projection matrix
    this->orthographic
        ? this->projectionMatrix.orthographic(
            -this->orthographicUnits * this->aspect, // left
            this->orthographicUnits * this->aspect,  // right
            -this->orthographicUnits,                // bottom
            this->orthographicUnits,                 // top
            this->zNear,
            this->zFar)
        : this->projectionMatrix.perspective(this->fieldOfViewRadians, this->aspect, this->zNear, this->zFar);

    // camera matrix
    if (this->parent == nullptr) return;

    matrix4<> tmp;
    tmp.rotate(this->parent->rotation);
    tmp.translate(vector3<>{
        this->parent->position.x,
        this->parent->position.y + 100,
        this->parent->position.z - 200,
        });
        
    this->cameraMatrix = opmat4::lookAt<real_t>(
        vector3<>{ tmp.elements[12], tmp.elements[13], tmp.elements[14] }, 
        this->parent->position, 
        this->up);

    // Make a view matrix from the camera matrix
    this->viewMatrix = opmat4::invert<real_t>(this->cameraMatrix);

    // move the projection space to view space (the space in front of the camera)
    // perspective or projection matrix * view matrix
    this->projectionViewMatrix = this->projectionMatrix * this->viewMatrix;

    this->modelMatrix = this->cameraMatrix;
}
*/
    }
}