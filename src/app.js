`use strict`

// https://webgl2fundamentals.org/

import Program from './Program.js'
import vertexSource from './shaders/vertexSource.js'
import fragmentSource from './shaders/fragmentSource.js'
import Scene from './Scene.js'

import './components/overlayDebug/index.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import CameraObject from './Helpers/CameraObject.js'
import FrustumObject from './Helpers/FrustumObject.js'
import LampObject from './Helpers/LampObject.js'
import { loadObj } from './common.js'
import Lamp from './Lamp.js'

window.addEventListener('load', () => {
    const DEBUG_MODE = true

    const canvas = document.querySelector('#canvas')
    const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true }) // WebGLRenderingContext

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.')
        return
    }

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
            label: 'x',
            type: 'range',
            configs: { 
                min: '1',
                max: '750',
                value: '0'
            }
        }, {
            label: 'y',
            type: 'range',
            configs: { 
                min: '1',
                max: '750',
                value: '0'
            }
        }, {
            label: 'z',
            type: 'range',
            configs: { 
                min: '-750',
                max: '750',
                value: '300'
            }
        }, {
            label: 'orthographic',
            type: 'checkbox',
        }, {
            label: 'units',
            type: 'range',
            configs: { 
                min: '0',
                max: '500',
                value: '150'
            }
        }
    ])

    const fpsElement = document.querySelector('#textFPS')

    // SCENE
    const shader = new Program(gl, vertexSource, fragmentSource)
    const scene = new Scene(gl, [ shader ])

    /// CAMERA
    const camera = new Camera((canvas.width / 2) / canvas.height, {
        location: [ 0, 0, 600 ]
    }, {
        zNear: 30,
        zFar: 1000,
        fieldOfViewRadians: Math.degreeToRadians(45),
        orthographic: false,
        orthographicUnits: 150
    })
    const debugCamera = new Camera((canvas.width / 2) / canvas.height, {
        location: [ 200, 400, 800 ]
    }, {
        zNear: 30,
        zFar: 2000
    }) 

    /// LIGHT
    const lamp = new Lamp({
        position: [ 100, 100, 100 ]
    })

    /// RENDERER
    const renderer = new Renderer(gl)

    /// MONKEY
    const collection = loadObj(scene, '../resources/monkey/', 'monkey.obj')
    scene.addCollection(collection)

    /// CAMERA
    const cameraObject = new CameraObject(scene)
    cameraObject.modelMatrix = camera.cameraMatrix
    scene.addObject(cameraObject)

    const frustumObject = new FrustumObject(scene)
    frustumObject.modelMatrix = m4.inverse(camera.projectionViewMatrix)
    scene.addObject(frustumObject)

    /// LAMP
    const lampObject001 = new LampObject(scene)
    lampObject001.mesh.location = scene.lamps[0].position
    lampObject001.projectionMatrix = camera.projectionMatrix
    lampObject001.viewMatrix = camera.viewMatrix
    scene.addObject(lampObject001)

    const lampObject002 = new LampObject(scene)
    lampObject002.mesh.location = scene.lamps[1].position
    lampObject002.projectionMatrix = camera.projectionMatrix
    lampObject002.viewMatrix = camera.viewMatrix
    scene.addObject(lampObject002)

    if (DEBUG_MODE) overlayDebug.toggle()

    let lastTimeFps = 0
    let lastTimeSecond = 0
    const rotationSpeed = .6
    function animate(timeStamp) {
        let deltaTime = timeStamp - lastTimeFps
        lastTimeFps = timeStamp
        
        let fps = 1000 / deltaTime

        if (DEBUG_MODE) {
            if (timeStamp - lastTimeSecond >= 1000) {
                lastTimeSecond = timeStamp
                fpsElement.value = fps.toFixed(2)
            }

            if (camera.location != Number(window.DEBUG_X) || 
                camera.location[1] != Number(window.DEBUG_Y) || 
                camera.location[2] != Number(window.DEBUG_Z) ||
                camera.orthographic != window.DEBUG_ORTHOGRAPHIC ||
                camera.orthographicUnits != Number(window.DEBUG_UNITS)) {
                camera.location[0] = Number(window.DEBUG_X)
                camera.location[1] = Number(window.DEBUG_Y)
                camera.location[2] = Number(window.DEBUG_Z)
                camera.orthographic = window.DEBUG_ORTHOGRAPHIC
                camera.orthographicUnits = Number(window.DEBUG_UNITS)
                camera.init()
    
                cameraObject.modelMatrix = camera.cameraMatrix
                frustumObject.modelMatrix = m4.inverse(camera.projectionViewMatrix) 
            }

            renderer.renderScissor(scene, [ camera, debugCamera ], [ lamp ], fps)
        } else {
            renderer.render(scene, camera, [ lamp ], fps)
        }

        if (collection.objects[0]) collection.objects[0].mesh.rotation[1] += rotationSpeed / fps
        
        window.requestAnimationFrame(animate)
    }
    animate(0)
})