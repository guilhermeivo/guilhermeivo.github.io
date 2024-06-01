`use strict`

import vertexSource from './shaders/vertexSource.js'
import fragmentSource from './shaders/fragmentSource.js'
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
        }
    ])

    const fpsElement = document.querySelector('#textFPS')

    // SCENE
    const scene = new Scene()

    /// AXIS
    const axis = new Axis({
        position: new Vector3(0, 60, 0),
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

    const screenArcade = new Screen(
        '../resources/arcade/screen_blank.png',
        1000, 750,
        180, 150
    )
    const buttonRotateRight = new Button()
    const buttonRotateLeft = new Button()
    const buttonFire = new Button()
    const buttonThrust = new Button()
    const buttonHyperSpace = new Button()

    /// ARCADE
    loadObj(glRenderer.gl, '../resources/arcade/', 'arcade.obj')
        .then(async collection => {
            scene.add(collection)
            screenArcade.open()
            loadScreen()

            buttonRotateRight.init(collection.children.filter(object => object.name == 'Button.RotateRight')[0])
            buttonRotateLeft.init(collection.children.filter(object => object.name == 'Button.RotateLeft')[0])
            buttonFire.init(collection.children.filter(object => object.name == 'Button.Fire')[0])
            buttonThrust.init(collection.children.filter(object => object.name == 'Button.Thrust')[0])
            buttonHyperSpace.init(collection.children.filter(object => object.name == 'Button.HyperSpace')[0])

            // animation
            let steps = 100
            for (let i = steps; i >= 0; i--) {
                const t = i / steps
                const curve = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
                // ((initialPosition - finalPosition) * curve) + finalPosition
                camera.position.set(((100 - 60) * curve) + 60, ((100 - 75) * curve) + 75, 250 * curve)
                await new Promise(resolve => setTimeout(resolve, 5))
            }
        })

    /// SCREEN
    const loadScreen = async () => {
        await screenArcade.update(document.querySelector('#screen'))

        const screen = scene.children.filter(object => object.type == 'collection')[0]
            .children.filter(object => object.name == 'Screen')[0]

        screenArcade.draw()
            .then(image => {
                screen.material.samplers.diffuseMap.setImageTexture(glRenderer.gl, image)
            })
    }

    document.addEventListener('keydown', event => {
        switch (event.key) {
            case 'Escape':
                buttonHyperSpace.down()
                screenArcade.close()
                break
            case 'Tab':
                buttonThrust.down()
                break
            case 'Enter':
                if ('card' in document.activeElement.dataset) {
                    console.log(document.activeElement.tabIndex)
                }
                buttonFire.down()
                break
            case 'ArrowUp':
                buttonRotateLeft.down()
                screenArcade.scrollUp()
                break
            case 'ArrowDown':
                buttonRotateRight.down()
                screenArcade.scrollDown(document.querySelector('#screen>div').scrollHeight)
                break
            default:
                return
        }
        setTimeout(loadScreen, 10)
    })

    document.addEventListener('keyup', event => {
        switch (event.key) {
            case 'Escape':
                buttonHyperSpace.up()
                break
            case 'Tab':
                buttonThrust.up()
                break
            case 'Enter':
                buttonFire.up()
                break
            case 'ArrowUp':
                buttonRotateLeft.up()
                break
            case 'ArrowDown':
                buttonRotateRight.up()
                break
        }
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