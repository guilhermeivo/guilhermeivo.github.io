#include <iostream>
#include <cstdlib>

#include "../../src/wasm.h"
#include "../../src/Math/vector3.h"
#include "../../src/Math/matrix4.h"
#include "../../src/Math/real_t.h"

EXPORT("some_func")
matrix4<> some_func() {
    matrix4 projectionMatrix;
    projectionMatrix.orthographic(-50.0_r, 50.0_r, -50.0_r, 50.0_r, 90.0_r, 1.0_r);

    vector3 position{5.0_r, 5.0_r, 2.0_r};
    vector3 target{1.0_r, 5.0_r, 1.0_r};
    vector3 yAxis{0.0_r, 1.0_r, 0.0_r};
    matrix4 cameraMatrix = opmat4::lookAt(position, target, yAxis);
    matrix4 viewMatrix = opmat4::invert(cameraMatrix);
    matrix4 projectionViewMatrix = projectionMatrix * viewMatrix;

    return projectionViewMatrix;
}

int main() {
    return 0;
}
