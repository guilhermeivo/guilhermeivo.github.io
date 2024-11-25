`use strict`

import vertexSource from './shaders/vertexSource.js'
import fragmentSource from './shaders/fragmentSource.js'

import pickingVertexSource from './shaders/pickingVertexSource.js'
import pickingFragmentSource from './shaders/pickingFragmentSource.js'

import Scene from './Core/Scene.js'

import './components/overlayDebug/index.js'
import FrustumHelper from './Helpers/FrustumHelper.js'
import Light from './Lights/Light.js'
import { loadObj } from './Loader.js'
import Axis from './Objects/Axis.js'
import Camera from './Cameras/Camera.js'
import CameraHelper from './Helpers/CameraHelper.js'
import LightHelper from './Helpers/LightHelper.js'

import Vector3 from './Math/Vector3.js'
import GLRenderer from './GLRenderer.js'

import Screen from './Arcade/Screen.js'
import Button from './Arcade/Button.js'
import GLInfo from './GLInfo.js'
import GLTexture from './Textures/GLTexture.js'
import Object3 from './Objects/Object3.js'
import Plane from './Primitives/Plane.js'
import Monkey from './Primitives/Monkey.js'
import DebugCamera from './Cameras/DebugCamera.js'

(() => {
    
    /// RENDERER
    const glRenderer = new GLRenderer()
    const programId = glRenderer.createProgram(vertexSource, fragmentSource)
    const programPickingId = glRenderer.createProgram(pickingVertexSource, pickingFragmentSource) // to check mouse over in canvas
    
    glRenderer.setSize(window.innerWidth, window.innerHeight) // change resolution image (1x, 2x)
    document.body.appendChild(glRenderer.gl.canvas)

    /// SCENE
    const scene = new Scene()

    /// AXIS
    const axis = new Axis({
        position: new Vector3(0, 57, 0),
        scale: new Vector3(50, 50, 50)
    })
    scene.add(axis)

    /// CAMERA
    const camera = new Camera({
        position: new Vector3(100, 100, 250)
    }, {
        zNear: 1,
        zFar: 500,
        fieldOfViewRadians: Math.degreeToRadians(45)
    })
    camera.target = axis.position
    scene.add(camera)
    scene.add(new CameraHelper(camera))
    scene.add(new FrustumHelper(camera))

    const debugCamera = new DebugCamera()
    scene.add(debugCamera)

    /// Light
    const light001 = new Light({ 
        position: new Vector3(125, 125, -125)
    })
    scene.addLight(light001)
    scene.add(new LightHelper(light001))

    const light002 = new Light({
        position: new Vector3(-125, 150, 125)
    })
    scene.addLight(light002)
    scene.add(new LightHelper(light002))

    scene.add(new Plane(glRenderer.gl))
    scene.add(new Monkey())

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
                max: 10,
                min: -10
            }
        }, {
            label: 'Camera_Y',
            type: 'range',
            configs: { 
                value: 5,
                max: 10,
                min: -10
            }
        }, {
            label: 'Camera_Z',
            type: 'range',
            configs: { 
                value: 10,
                max: 10,
                min: -10
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

        if (window['DEBUG_MODE']) {
            if (!overlayDebug.state.isOpen) {
                glRenderer.isInitialized = false
                overlayDebug.toggle()
            }

            if (timeStamp - lastTimeFpsView >= 1000) { // time to update the FPS view
                lastTimeFpsView = timeStamp
                fpsElement.value = fps.toFixed(2)
            }
        } else {
            if (overlayDebug.state.isOpen) {
                glRenderer.isInitialized = false
                overlayDebug.toggle()
            }
        }

        glRenderer.setProgram(programPickingId)
        glRenderer.render(scene, debugCamera, fps)

        glRenderer.render(scene, debugCamera, fps, programId)
        
        window.requestAnimationFrame(animate)
    }
    animate(0)
})()