#include <iostream>

#include "wasm.h"
#include "./Math/vector3.h"
#include "./Math/matrix4.h"

EXPORT("cleanup")
void cleanup();

EXPORT("worldMatrix")
void worldMatrix(matrix4<real_t>& worldMatrix, const vector3<real_t>& position, const vector3<real_t>& rotation, const vector3<real_t>& scale) {
    worldMatrix.identity();

    // model or world matrix = translation * rotation * scale
    worldMatrix = worldMatrix.translate(position) * worldMatrix.rotate(rotation) * worldMatrix.scale(scale);

    return;
}

EXPORT("lightSpaceMatrix")
void lightSpaceMatrix(
    matrix4<real_t>& lightSpaceMatrix, 
    matrix4<real_t>& lightProjectionMatrix, 
    matrix4<real_t>& lightWorldMatrix,
    const vector3<real_t>& position,
    const vector3<real_t>& target,
    const vector3<real_t>& up,
    const real_t projWidth,
    const real_t projHeight,
    const real_t zNear,
    const real_t zFar,
    const real_t fieldOfViewRadians,
    const bool perspective) {

    lightSpaceMatrix.identity();

    // calc lights matrix4
    !perspective
        ? lightProjectionMatrix.orthographic(
            -projWidth / 2,  // left
            projWidth / 2,   // right
            -projHeight / 2, // bottom
            projHeight / 2,  // top
            zNear,
            zFar)
        : lightProjectionMatrix.perspective(fieldOfViewRadians, (real_t) projWidth / projHeight, zNear, zFar);

    lightWorldMatrix = opmat4::lookAt<real_t>(position, target, up);

    lightWorldMatrix = opmat4::invert<real_t>(lightWorldMatrix);

    // calc lightSpaceMatrix
    lightSpaceMatrix = lightProjectionMatrix * lightWorldMatrix;

    return;
}

EXPORT("cameraMatrix")
void cameraMatrix(
    matrix4<real_t>& projectionViewMatrix, 
    matrix4<real_t>& projectionMatrix, 
    matrix4<real_t>& cameraMatrix,
    matrix4<real_t>& viewMatrix,
    matrix4<real_t>& modelMatrix,
    const vector3<real_t>& position,
    const vector3<real_t>& target,
    const vector3<real_t>& up,
    const real_t orthographicUnits,
    const real_t aspect,
    const real_t zNear,
    const real_t zFar,
    const real_t fieldOfViewRadians,
    const bool orthographic) {

    projectionViewMatrix.identity();

    // perspective or projection matrix
    orthographic
        ? projectionMatrix.orthographic(
            -orthographicUnits * aspect, // left
            orthographicUnits * aspect,  // right
            -orthographicUnits,                // bottom
            orthographicUnits,                 // top
            zNear,
            zFar)
        : projectionMatrix.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    // camera matrix
    cameraMatrix = opmat4::lookAt<real_t>(position, target, up);

    // Make a view matrix from the camera matrix
    viewMatrix = opmat4::invert<real_t>(cameraMatrix);

    // move the projection space to view space (the space in front of the camera)
    // perspective or projection matrix * view matrix
    projectionViewMatrix = projectionMatrix * viewMatrix;

    modelMatrix = cameraMatrix;

    return;
}

int main() {
    #ifdef USE_WASM
        // The linker synthesizes this to call constructors
        __wasm_call_ctors();
    #endif
    
    #ifndef USE_WASM
        cleanup();
    #endif

    return 0;
}

void cleanup() {
    
}
