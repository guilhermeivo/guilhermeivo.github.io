#include <iostream>
#include <vector>
#include <string>

#include "../src/Objects/Scene.h"
#include "../src/Objects/Lights/Light.h"
#include "../src/Objects/Cameras/Camera.h"
#include "../src/Primitives/Plane.h"

Scene* m_scene;
Camera* m_camera;
Light* m_light001;
Plane* m_plane;

void cleanup();

/**
 * Testes unitários do programa
 */
int main() {
    /// SCENE
    m_scene = new Scene();

    /// CAMERA
    m_camera = new Camera();
    m_scene->add(m_camera);

    /// Light
    m_light001 = new Light(ligth::config{}, { 
        .position = vector3<>{6.0_r, 10.0_r, -4.3_r}
    });
    m_scene->addLight(m_light001);

    /// PLANE
    m_plane = new Plane();

    /// ANIMATE

    cleanup();

    return 0;
}

void cleanup() {
    if (m_scene != nullptr) {
        delete m_scene;
        m_scene = nullptr;
    }
    if (m_camera != nullptr) {
        delete m_camera;
        m_camera = nullptr;
    }
    if (m_light001 != nullptr) {
        delete m_light001;
        m_light001 = nullptr;
    }
    if (m_plane != nullptr) {
        delete m_plane;
        m_plane = nullptr;
    }
}
