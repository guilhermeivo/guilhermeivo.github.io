`use strict`

import Scene from './Core/Scene.js'

import './components/overlayDebug/index.js'
import Light from './Lights/Light.js'
import Axis from './Objects/Axis.js'
import Camera from './Cameras/Camera.js'

import Vector3 from './Math/Vector3.js'
import GLRenderer from './GLRenderer.js'

import GLInfo from './GLInfo.js'
import Plane from './Primitives/Plane.js'
import Monkey from './Primitives/Monkey.js'
import DebugCamera from './Cameras/DebugCamera.js'
import LightHelper from './Helpers/LightHelper.js'

(() => {
    
    /// RENDERER
    const glRenderer = new GLRenderer()
    
    glRenderer.setSize(window.innerWidth, window.innerHeight) // change resolution image (1x, 2x)
    document.body.appendChild(glRenderer.gl.canvas)

    /// SCENE
    const scene = new Scene()

    /// CAMERA
    const debugCamera = new DebugCamera()
    debugCamera.target = new Vector3(0, 15/2-2, 0)
    scene.add(debugCamera)

    /// Light
    const light001 = new Light({ 
        position: new Vector3(5, 7, 4.3)
    })
    scene.addLight(light001)
    scene.add(new LightHelper(light001))

    const light002 = new Light({
        position: new Vector3(-5, 10, 5)
    })
    scene.addLight(light002)
    scene.add(new LightHelper(light002))

    scene.add(new Plane(glRenderer.gl))
    scene.add(new Monkey({
        position: new Vector3(0, 15/2, 0),
        scale: new Vector3(3, 3, 3)
    }))

    window['DEBUG_MODE'] = true

    const overlayDebug = document.querySelector('overlay-debug')
    overlayDebug.addAllContents([
        {
            label: 'FPS',
            type: 'text',
            configs: { 
                value: '',
                readonly: 'readonly'
            }
        }, {
            label: 'Renderer',
            type: 'text',
            configs: { 
                value: GLInfo.getRenderer(glRenderer.gl),
                readonly: 'readonly'
            }
        }, {
            label: 'Vendor',
            type: 'text',
            configs: { 
                value: GLInfo.getVendor(glRenderer.gl),
                readonly: 'readonly'
            }
        }, {
            label: 'Camera_zNear',
            type: 'range',
            configs: { 
                value: 1,
            }
        }, {
            label: 'Camera_zFar',
            type: 'range',
            configs: { 
                value: 2000,
                max: 2500
            }
        }, {
            label: 'Camera_X',
            type: 'range',
            configs: { 
                value: 2.75,
                max: 50,
                min: -50
            }
        }, {
            label: 'Camera_Y',
            type: 'range',
            configs: { 
                value: 8,
                max: 50,
                min: -50
            }
        }, {
            label: 'Camera_Z',
            type: 'range',
            configs: { 
                value: 25,
                max: 50,
                min: -50
            }
        }, {
            label: 'Camera_Orthographic',
            type: 'checkbox'
        }, {
            label: 'Camera_Units',
            type: 'range',
            configs: { 
                value: 250,
                max: 1000,
                min: -1000
            }
        }, {
            label: 'Camera_View',
            type: 'range',
            configs: { 
                value: Math.degreeToRadians(60)
            }
        }
    ])

    const fpsElement = document.querySelector('#textFPS')
    if (window['DEBUG_MODE']) overlayDebug.toggle()

    /// ANIMATE
    let lastTimeFps = 0
    let lastTimeFpsView = 0
    function animate(timeStamp) {
        let deltaTime = timeStamp - lastTimeFps
        lastTimeFps = timeStamp
        
        let fps = 1000 / deltaTime

        if (timeStamp - lastTimeFpsView >= 1000) { // time to update the FPS view
            lastTimeFpsView = timeStamp
            fpsElement.value = fps.toFixed(2)
        }
        
        glRenderer.render(scene, debugCamera, fps, false, true)
        window.requestAnimationFrame(animate)
    }
    animate(0)
})()