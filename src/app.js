`use strict`

// https://webgl2fundamentals.org/

import Program from './Program.js'
import vertexSource from './shaders/vertexSource.js'
import fragmentSource from './shaders/fragmentSource.js'
import Scene from './Scene.js'

import './components/overlayDebug/index.js'
import Renderer from './Renderer.js'
import FrustumHelper from './Helpers/FrustumHelper.js'
import Light from './Lights/Light.js'
import { loadObj } from './Loader.js'
import Axis from './Objects/Axis.js'
import ThirdCamera from './Cameras/ThirdCamera.js'
import DebugCamera from './Cameras/DebugCamera.js'
import Camera from './Cameras/Camera.js'
import CameraHelper from './Helpers/CameraHelper.js'
import LightHelper from './Helpers/LightHelper.js'

window.addEventListener('load', () => {
    const DEBUG_MODE = true

    const canvas = document.querySelector('#canvas')
    const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, powerPreference: "high-performance" }) // WebGLRenderingContext

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.')
        return
    }

    const performance = window.performance
    const performanceKeys = [];
    for (var value in performance) {
        performanceKeys.push(value)
    }
    // console.log(performanceKeys)

    function extractValue(reg, str) {
        const matches = str.match(reg)
        return matches && matches[0]
    }

    const paramVendor = gl.getParameter(gl.VENDOR)
    const paramRenderer = gl.getParameter(gl.RENDERER)
    
    const card = extractValue(/((NVIDIA|AMD|Intel)[^\d]*[^\s]+)/, paramRenderer)
    
    // const tokens = card.split(' ')
    // tokens.shift()
    
    // const manufacturer = extractValue(/(NVIDIA|AMD|Intel)/g, card)
    const manufacturer = 'AMD'
    // const cardVersion = tokens.pop()
    // const brand = tokens.join(' ')
    const integrated = manufacturer === 'Intel'

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
                value: card,
                readonly: 'readonly'
            }
        }, {
            label: 'Vendor',
            type: 'text',
            configs: { 
                value: paramVendor,
                readonly: 'readonly'
            }
        },{
            label: 'camera_x',
            type: 'range',
            configs: { 
                min: '-750',
                max: '750',
                value: '250'
            }
        }, {
            label: 'camera_y',
            type: 'range',
            configs: { 
                min: '-750',
                max: '750',
                value: '100'
            }
        }, {
            label: 'camera_z',
            type: 'range',
            configs: { 
                min: '-750',
                max: '750',
                value: '100'
            }
        }, {
            label: 'camera_orthographic',
            type: 'checkbox',
            configs: {
                checked: 'checked'
            }
        }, {
            label: 'camera_units',
            type: 'range',
            configs: { 
                min: '0',
                max: '500',
                value: '65'
            }
        }
    ])

    const fpsElement = document.querySelector('#textFPS')

    // SCENE
    const shader = new Program(gl, vertexSource, fragmentSource)
    const scene = new Scene(gl, [ shader ])

    /// AXIS
    const axis = new Axis(gl, {
        location: new Vector3([ 0, 40, 0 ]),
        scale: new Vector3([ 50, 50, 50 ])
    })
    scene.add(axis)

    /// CAMERA
    const camera = new DebugCamera(gl, (canvas.width / 2) / canvas.height, { }, {
        zNear: 30,
        zFar: 1000,
        fieldOfViewRadians: Math.degreeToRadians(45),
        orthographic: false,
        orthographicUnits: 50
    })
    camera.target = axis
    scene.add(camera)
    scene.add(new CameraHelper(camera))
    scene.add(new FrustumHelper(camera))

    const debugCamera = new Camera(gl, (canvas.width / 2) / canvas.height, {
        location: new Vector3([ 200, 400, 800 ])
    }, {
        zNear: 30,
        zFar: 2000
    })
    scene.add(debugCamera)

    /// RENDERER
    const renderer = new Renderer(gl)

    /// MONKEY
    loadObj(scene, '../resources/arcade/', 'arcade.obj')
        .then(collection => {
            scene.add(collection)
        })

    /// Light
    const light001 = new Light(gl, { 
        location: new Vector3([ 125, 125, -125 ])
    })
    scene.add(light001)
    scene.add(new LightHelper(light001))

    const light002 = new Light(gl, {
        location: new Vector3([ -125, 150, 125 ])
    })
    scene.add(light002)
    scene.add(new LightHelper(light002))

    if (DEBUG_MODE) overlayDebug.toggle()

    let lastTimeFps = 0
    let lastTimeSecond = 0
    function animate(timeStamp) {
        let deltaTime = timeStamp - lastTimeFps
        lastTimeFps = timeStamp
        
        let fps = 1000 / deltaTime

        if (DEBUG_MODE) {
            if (timeStamp - lastTimeSecond >= 5000) {
                lastTimeSecond = timeStamp
                fpsElement.value = fps.toFixed(2)
            }

            renderer.renderScissor(scene, [ camera, debugCamera ], fps)
        } else {
            renderer.render(scene, camera, fps)
        }
        
        window.scene = scene
        window.requestAnimationFrame(animate)
    }
    animate(0)
})