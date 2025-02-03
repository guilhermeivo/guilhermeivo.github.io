#include <iostream>
#include <string>
#include <fstream>
#include <chrono>

#if defined(USE_GLM)
    #include <glm/vec3.hpp>
    #include <glm/vec4.hpp>
    #include <glm/mat4x4.hpp>
    #include <glm/ext/matrix_transform.hpp>
    #include <glm/gtc/matrix_inverse.hpp>
    #include <glm/ext/matrix_clip_space.hpp>
    #include <glm/gtx/string_cast.hpp>
#elif defined(USE_DEFAULT)
    #include "../../src/Math/vector3.h"
    #include "../../src/Math/matrix4.h"
    #include "../../src/Math/real_t.h"
#endif

// no GLM utiliza a representacao matematica
// enquanto no DEFAULT usa a representacao OpenGL ES
// resultando em respostas diferentes
int main() {
    std::ofstream version_file("data/version.txt");
    version_file << __cplusplus << std::endl;
    version_file.close();

    auto begin = std::chrono::high_resolution_clock::now();

    #if defined(USE_GLM)
        glm::mat4 projectionMatrix = glm::ortho(-50.0f, 50.0f, -50.0f, 50.0f, 90.0f, 1.0f);

        glm::vec3 position{5.0f, 5.0f, 2.0f};
        glm::vec3 target{1.0f, 5.0f, 1.0f};
        glm::vec3 yAxis{0.0f, 1.0f, 0.0f};
        glm::mat4 cameraMatrix = glm::lookAt(position, target, yAxis);
        glm::mat4 viewMatrix = glm::affineInverse(cameraMatrix);
        glm::mat4 projectionViewMatrix = projectionMatrix * viewMatrix;

        #if defined(__DEBUG__)
            std::cout << glm::to_string(projectionViewMatrix) << "\n";
        #endif

        /* mat4x4(
        (0.020000, 0.000000, 0.000000, 0.000000), 
        (0.000000, 0.020000, 0.000000, 0.000000), 
        (0.000000, 0.000000, 0.022472, 0.000000), 
        (-0.000000, -0.000000, 1.022472, 1.000000)
        ) */
    #elif defined(USE_DEFAULT)
        matrix4 projectionMatrix;
        projectionMatrix.orthographic(-50.0_r, 50.0_r, -50.0_r, 50.0_r, 90.0_r, 1.0_r);

        vector3 position{5.0_r, 5.0_r, 2.0_r};
        vector3 target{1.0_r, 5.0_r, 1.0_r};
        vector3 yAxis{0.0_r, 1.0_r, 0.0_r};
        matrix4 cameraMatrix = opmat4::lookAt(position, target, yAxis);
        matrix4 viewMatrix = opmat4::invert(cameraMatrix);
        matrix4 projectionViewMatrix = projectionMatrix * viewMatrix;

        #if defined(__DEBUG__)
            std::cout << projectionViewMatrix << "\n";
        #endif

        /*
        ⎡  0.020000  0.000000  0.000000  0.000000 ⎤
        |  0.000000  0.020000  0.000000  0.000000 |
        |  0.000000  0.000000  0.022472  0.000000 |
        ⎣ -0.000000 -0.000000  1.022472  1.000000 ⎦
        */
    #endif

    auto end = std::chrono::high_resolution_clock::now();
    std::cout << std::chrono::duration_cast<std::chrono::nanoseconds>(end-begin).count();

    return 0;
}