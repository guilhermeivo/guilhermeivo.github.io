`use strict`

import vertexSource from './shaders/vertexSource.js'
import fragmentSource from './shaders/fragmentSource.js'
import Scene from './Scene.js'

import './components/overlayDebug/index.js'
import FrustumHelper from './Helpers/FrustumHelper.js'
import Light from './Lights/Light.js'
import { loadObj } from './Loader.js'
import Axis from './Objects/Axis.js'
import DebugCamera from './Cameras/DebugCamera.js'
import Camera from './Cameras/Camera.js'
import CameraHelper from './Helpers/CameraHelper.js'
import LightHelper from './Helpers/LightHelper.js'

import monkey from '../resources/monkey/monkey.js'
import Material from './Core/Material.js'
import Geometry from './Core/Geometry.js'
import Mesh from './Mesh.js'
import Vector3 from './Math/Vector3.js'
import GLRenderer from './GLRenderer.js'

(() => {
    const DEBUG_MODE = false
    
    const glRenderer = new GLRenderer(vertexSource, fragmentSource)
    glRenderer.setSize(window.innerWidth, window.innerHeight) // change resolution image
    document.body.appendChild(glRenderer.gl.canvas)

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

    const paramVendor = glRenderer.gl.getParameter(glRenderer.gl.VENDOR)
    const paramRenderer = glRenderer.gl.getParameter(glRenderer.gl.RENDERER)
    
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
    const scene = new Scene()

    /// AXIS
    const axis = new Axis({
        position: new Vector3(0, 55, 0),
        scale: new Vector3(50, 50, 50)
    })
    //scene.add(axis)

    /// CAMERA
    const camera = new Camera({
        position: new Vector3(100, 100, 250)
    }, {
        zNear: 1,
        zFar: 1000,
        fieldOfViewRadians: Math.degreeToRadians(45),
        orthographic: false,
        orthographicUnits: 50
    })
    camera.target = axis.position
    scene.add(camera)
    //scene.add(new CameraHelper(camera))
    //scene.add(new FrustumHelper(camera))

    const debugCamera = new Camera({
        position: new Vector3(200, 800, 800)
    }, {
        zNear: 30,
        zFar: 2000
    })
    scene.add(debugCamera)

    /// RENDERER

    /// MONKEY
    loadObj(glRenderer.gl, '../resources/arcade/', 'arcade.obj')
        .then(collection => {
            scene.add(collection)
        })

    setTimeout(async () => {
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        
        let steps = 100
        for (let i = steps; i >= 0; i--) {
            const t = i / 100
            const curve = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
            camera.position.set(((100 - 60) * curve) + 60, ((100 - 75) * curve) + 75, 250 * curve)
            await sleep(5)
        }

        loadScreen()
    }, 1000)

    let scrollY = 0

    const canvasScreen = document.createElement('canvas')
    const width = 1000
    const height = 750
    const screenMarginWidth = 180
    const screenMarginHeight = 150
    canvasScreen.width = width
    canvasScreen.height = height
    const ctx = canvasScreen.getContext("2d")

    const screenImage = new Image()
    screenImage.src = '../resources/arcade/screen_blank.png'

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${ (width - screenMarginWidth * 2) }" min-height="${ height - screenMarginHeight * 2 }">
    <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" width="100%" height="100%">${ document.querySelector('#screen').innerHTML }</div>
    </foreignObject>
    </svg>`
    
    const svgBlob = new Blob( [svg], { type: 'image/svg+xml;charset=utf-8' } );
    const svgObjectUrl = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.src = svgObjectUrl

    const loadScreen = () => {
        const screen = scene.children.filter(object => object.type == 'collection')[0]
            .children.filter(object => object.material.name == 'Screen')[0]

        ctx.fillRect(0, 0, width, height);
        ctx.scale(1, -1)
        ctx.drawImage(img, screenMarginWidth, screenMarginHeight - scrollY, width - screenMarginWidth * 2, (height - screenMarginHeight * 2) * -1 - screenMarginHeight * 2 - scrollY)
        ctx.scale(1, -1)
        ctx.drawImage(screenImage, 0, 0)
        const newScreenImage = new Image()
        newScreenImage.onload = () => {
            screen.material.samplers.diffuseMap.setImageTexture(glRenderer.gl, newScreenImage)
        }
        newScreenImage.src = canvasScreen.toDataURL("image/png")
    }

    document.addEventListener('keydown', function(event) {
        const key = event.key;
        const scrollLenght = 50

        switch (key) {
            case "ArrowUp":
                scrollY-=scrollLenght
                break;
            case "ArrowDown":
                scrollY+=scrollLenght
                break;
        }

        const max = height - screenMarginHeight * 2

        if (scrollY < 0) scrollY = 0
        else if (scrollY >= document.querySelector('#screen>div').scrollHeight - max) scrollY = document.querySelector('#screen>div').scrollHeight - max

        loadScreen()
    })

    /// Light
    const light001 = new Light({ 
        position: new Vector3(125, 125, -125)
    })
    scene.addLight(light001)
    //scene.add(new LightHelper(light001))

    const light002 = new Light({
        position: new Vector3(-125, 150, 125)
    })
    scene.addLight(light002)
    //scene.add(new LightHelper(light002))

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

            glRenderer.renderScissor(scene, [ camera, debugCamera ], fps)
        } else {
            glRenderer.render(scene, camera, fps)
        }
        
        window.requestAnimationFrame(animate)
    }
    animate(0)
})()