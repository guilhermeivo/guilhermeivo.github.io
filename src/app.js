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
import LightObject from './Helpers/LightObject.js'
import { loadObj } from './common.js'
import Light from './Light.js'
import AxisObject from './Helpers/AxisObject.js'
import ThirdCamera from './Cameras/ThirdCamera.js'

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
    console.log(performanceKeys)

    function extractValue(reg, str) {
        const matches = str.match(reg)
        return matches && matches[0]
    }
    
    const paramVendor = gl.getParameter(gl.VENDOR)
    const paramRenderer = gl.getParameter(gl.RENDERER)
    
    const card = extractValue(/((NVIDIA|AMD|Intel)[^\d]*[^\s]+)/, paramRenderer)
    
    const tokens = card.split(' ')
    tokens.shift()
    
    const manufacturer = extractValue(/(NVIDIA|AMD|Intel)/g, card)
    const cardVersion = tokens.pop()
    const brand = tokens.join(' ')
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

    /// AXIS
    const axisObject = new AxisObject(scene,)
    axisObject.mesh.location = [ 0, 0, 0 ]
    axisObject.mesh.scale = [ 50, 50, 50 ]
    scene.addObject(axisObject)
    
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
    camera.target = axisObject
    const thirdCamera = new ThirdCamera(axisObject, (canvas.width / 2) / canvas.height, {
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
    scene.addCamera(camera)
    scene.addCamera(debugCamera)

    /// LIGHT
    scene.addLight(new Light({
        location: [ 150, 0, 0 ],
        color: [ .9, 0, 0 ]
    }))
    scene.addLight(new Light({
        location: [ -150, 0, 0 ],
        color: [ 0, 0, .9 ]
    }))

    /// RENDERER
    const renderer = new Renderer(gl)

    /// MONKEY
    loadObj(scene, '../resources/monkey/', 'monkey.obj')
        .then(collection => {
            scene.addCollection(collection)
            const monkey = collection.objects[0]
            monkey.rotationSpeed = .2
            monkey.parent = axisObject
            monkey._update = (state, fps) => {
                axisObject.mesh.rotation[1] += state.rotationSpeed / fps
            }
        })

    /// CAMERA
    const cameraObject001 = new CameraObject(scene, camera)
    scene.addObject(cameraObject001)

    const frustumObject001 = new FrustumObject(scene)
    frustumObject001.modelMatrix = m4.inverse(camera.projectionViewMatrix)
    scene.addObject(frustumObject001)

    /// CAMERA
    const cameraObject002 = new CameraObject(scene, thirdCamera)
    scene.addObject(cameraObject002)

    /// Light
    const lightObject001 = new LightObject(scene)
    lightObject001.mesh.location = scene.lights[0].location
    lightObject001.projectionMatrix = camera.projectionMatrix
    lightObject001.viewMatrix = camera.viewMatrix
    scene.addObject(lightObject001)

    const lightObject002 = new LightObject(scene)
    lightObject002.mesh.location = scene.lights[1].location
    lightObject002.projectionMatrix = camera.projectionMatrix
    lightObject002.viewMatrix = camera.viewMatrix
    scene.addObject(lightObject002)

    if (DEBUG_MODE) overlayDebug.toggle()

    let lastTimeFps = 0
    let lastTimeSecond = 0
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

                // TODO: transform in object class
                camera.update()
                thirdCamera.update()
            }

            renderer.renderScissor(scene, [ camera, debugCamera ], fps)
        } else {
            renderer.render(scene, camera, fps)
        }
        
        window.requestAnimationFrame(animate)
    }
    animate(0)
})