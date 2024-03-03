`use strict`

// https://webgl2fundamentals.org/

import Shader from './Shader.js'
import vertexSource from './shaders/vertexSource.js'
import fragmentSource from './shaders/fragmentSource.js'
import Scene from './Scene.js'

import './components/overlayDebug/index.js'
import Geometry from './Geometry.js'
import Material from './Material.js'
import Mesh from './Mesh.js'
import monkey from './primitives/monkey.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import CameraObject from './objects/CameraObject.js'
import FrustumObject from './objects/FrustumObject.js'
import LampObject from './objects/LampObject.js'
import { loadObj } from './common.js'

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
                value: '1'
            }
        }, {
            label: 'y',
            type: 'range',
            configs: { 
                min: '1',
                max: '750',
                value: '1'
            }
        }, {
            label: 'z',
            type: 'range',
            configs: { 
                min: '-750',
                max: '750',
                value: '600'
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
        }, /*{
            label: 'Save',
            type: 'button', 
            configs: {
                value: 'Save'
            },
            event: (arg) => {
                canvas.toBlob((blob) => {
                    saveblob(blob, `screencapture-${ canvas.width }x${ canvas.height }.png`)
                })
            }
        }*/
    ])

    const fpsElement = document.querySelector('#textFPS')

    // SCENE
    const shader = new Shader(gl, vertexSource, fragmentSource)
    const scene = new Scene(gl, [ shader ])

    /// CAMERA
    const camera = new Camera((canvas.width / 2) / canvas.height, {
        location: [ 0, 0, 600 ]
    }, {
        zNear: 30,
        zFar: 1500,
        fieldOfViewRadians: Math.degreeToRadians(45),
        orthographic: false,
        orthographicUnits: 150
    })
    const debugCamera = new Camera((canvas.width / 2) / canvas.height, {
        location: [ 600, 400, 1200 ]
    }, {
        zNear: 30,
        zFar: 3500
    }) 

    /// RENDERER
    const renderer = new Renderer(gl)

    /// MONKEY
    const geometry = new Geometry(gl)
    geometry.setAttribute('position', monkey.vertice)
    geometry.setAttribute('color', monkey.normal)
    geometry.setAttribute('normal', monkey.normal)
    geometry.setAttribute('texcoord', monkey.normal, { size: 2 })
    const material = new Material()
    const monkeyMesh = new Mesh(geometry, material)
    monkeyMesh.scale.set([ 50, 50, 50 ])
    // scene.addMesh(monkeyMesh)

    const collection = loadObj(scene, './src/primitives/', 'windmill.obj')
        scene.addCollection(collection)

    /// CAMERA
    const cameraObject = new CameraObject(scene)
    cameraObject.modelMatrix = camera.cameraMatrix
    scene.addObject(cameraObject)

    const frustumObject = new FrustumObject(scene)
    frustumObject.modelMatrix = m4.inverse(camera.projectionViewMatrix)
    scene.addObject(frustumObject)

    /// LAMP
    const lampObject = new LampObject(scene)
    lampObject.mesh.location = scene.lamp.position
    lampObject.projectionMatrix = camera.projectionMatrix
    lampObject.viewMatrix = camera.viewMatrix
    scene.addObject(lampObject)

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

            renderer.renderScissor(scene, camera, debugCamera, fps)
        } else {
            renderer.render(scene, camera, fps)
        }

        monkeyMesh.rotation[1] += rotationSpeed / fps
        
        window.requestAnimationFrame(animate)
    }
    animate(0)
})