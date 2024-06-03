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

(() => {
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return
    }

    window['DEBUG_MODE'] = false

    document.querySelector('.shortcuts').style.display = 'block'
    
    const glRenderer = new GLRenderer()
    const programId = glRenderer.createProgram(vertexSource, fragmentSource)
    const programPickingId = glRenderer.createProgram(pickingVertexSource, pickingFragmentSource)
    
    glRenderer.setSize(window.innerWidth, window.innerHeight) // change resolution image
    document.body.appendChild(glRenderer.gl.canvas)

    function extractValue(reg, str) {
        const matches = str.match(reg)
        return matches && matches[0]
    }

    const paramVendor = glRenderer.gl.getParameter(glRenderer.gl.VENDOR)
    const paramRenderer = glRenderer.gl.getParameter(glRenderer.gl.RENDERER)
    
    const card = extractValue(/((NVIDIA|AMD|Intel)[^\d]*[^\s]+)/, paramRenderer)

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

    let isSimpleMode = false
    const switchMode = () => {
        if (!isSimpleMode) {
            isSimpleMode = true
            document.querySelector('#screen').classList.add('simplified')
            document.querySelector('.shortcuts').style.display = 'none'
            document.querySelector('#canvas').style.display = 'none'
        } else {
            isSimpleMode = false
            document.querySelector('#screen').classList.remove('simplified')
            document.querySelector('.shortcuts').style.display = 'block'
            document.querySelector('#canvas').style.display = 'block'

            animate(0)
        }
    }

    const screenArcade = new Screen(
        '../resources/arcade/screen_blank.png',
        1000, 750,
        180, 150
    )
    let actualFocus = 0
    const cards = document.querySelector("#cards")
    const buttonRotateRight = new Button(() => { 
        if (!screenArcade.opened) return
        
        screenArcade.scrollDown(document.querySelector('#screen>div').scrollHeight) 
    })
    const buttonRotateLeft = new Button(() => { 
        if (!screenArcade.opened) return

        screenArcade.scrollUp() 
    })
    const buttonFire = new Button(() => {
        if (!screenArcade.opened) return

        let focusElement = actualFocus - 1
        if (focusElement < 0) focusElement = cards.children.length - 1
        cards.children[focusElement].click()
    })
    const buttonThrust = new Button(() => {
        if (!screenArcade.opened) return

        cards.children[actualFocus].focus()
        actualFocus++
        if (actualFocus >= cards.children.length) actualFocus = 0
    })
    const buttonHyperSpace = new Button(() => { 
        if (screenArcade.opened) screenArcade.close() 
        else screenArcade.open() 
    })

    // SCENE
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

    const debugCamera = new Camera({
        position: new Vector3(200, 800, 800)
    }, {
        zNear: 30,
        zFar: 2000
    })
    scene.add(debugCamera)

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
                camera.position.set(((100 - 37) * curve) + 37, ((100 - 60) * curve) + 60, 250 * curve)
                await new Promise(resolve => setTimeout(resolve, 5))
            }
        })

    /// SCREEN
    const loadScreen = () => {
        screenArcade.update(document.querySelector('#screen'), document.querySelector('#screen>div').scrollHeight).then(() => {
            const screen = scene.children.filter(object => object.type == 'collection')[0]
                .children.filter(object => object.name == 'Screen')[0]

            screenArcade.draw()
                .then(image => {
                    screen.material.samplers.diffuseMap.setImageTexture(glRenderer.gl, image)
                })
        })
    }

    // EVENTS
    document.addEventListener('keydown', event => {
        switch (event.key) {
            case 'Escape':
                buttonHyperSpace.click()
                break
            case 'Tab':
                event.preventDefault()
                buttonThrust.click()
                break
            case 'Enter':
                event.preventDefault()
                buttonFire.click()
                break
            case 'ArrowUp':
                buttonRotateLeft.click()
                break
            case 'ArrowDown':
                buttonRotateRight.click()
                break
            case 'c':
            case 'C':
                switchMode()
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

    let mouseX = -1
    let mouseY = -1

    glRenderer.gl.canvas.addEventListener('mousemove', event => {
        const rect = glRenderer.gl.canvas.getBoundingClientRect()
        mouseX = event.clientX - rect.left
        mouseY = event.clientY - rect.top
    })

    let currentObjectOver = null

    const getMouseOver = () => {
        if (!scene.children.filter(object => object.type == 'collection').length) return

        const pixelX = mouseX * glRenderer.gl.canvas.width / glRenderer.gl.canvas.clientWidth
        const pixelY = glRenderer.gl.canvas.height - mouseY * glRenderer.gl.canvas.height / glRenderer.gl.canvas.clientHeight - 1

        const data = new Uint8Array(4)
        glRenderer.gl.readPixels(
            pixelX,            // x
            pixelY,            // y
            1,                 // width
            1,                 // height
            glRenderer.gl.RGBA,           // format
            glRenderer.gl.UNSIGNED_BYTE,  // type
            data)             // typed array to hold result
        const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24)

        scene.getById(scene.children.filter(object => object.type == 'collection')[0].children, id)
            .then(value => currentObjectOver = value)
    }

    const getScreenMouseClick = () => {
        if (!screenArcade.opened) return

        const pixelX = mouseX * glRenderer.gl.canvas.width / glRenderer.gl.canvas.clientWidth
        const pixelY = glRenderer.gl.canvas.height - mouseY * glRenderer.gl.canvas.height / glRenderer.gl.canvas.clientHeight - 1

        let widthData = 16
        let heightData = 16

        const data = new Uint8Array(widthData * heightData * 4)
        glRenderer.gl.readPixels(
            pixelX,            // x
            pixelY,            // y
            widthData,                 // width
            heightData,                 // height
            glRenderer.gl.RGBA,           // format
            glRenderer.gl.UNSIGNED_BYTE,  // type
            data)             // typed array to hold result

        let values = []
        for (let i = 0; i < widthData * heightData * 4; i+=4) {
            if (data[i + 0] == data[i + 1] && data[i + 0] == data[i + 2]) {
                if (!values.filter(value => value.number == data[i + 0]).length) {
                    values.push({ number: data[i + 0], amount: 1 })
                } else {
                    values.filter(value => value.number == data[i + 0])[0].amount++
                }
            }
        }
        if (!values.length) return

        values.sort((a, b) => b.amount - a.amount)
        if (values[0].amount < 8) return

        let smallestDistance = 255
        let value = document.querySelector('#cards').children[0]
        for (let card of document.querySelector('#cards').children) {
            const r = card.style.background.replace(/[^\d,]/g, '').split(',')[0]
            if (smallestDistance > Math.abs(r - values[0].number)) {
                smallestDistance = Math.abs(r - values[0].number)
                value = card
            }
        }
        if (smallestDistance > 16 / 2) return

        return value
    }

    glRenderer.gl.canvas.addEventListener('mousedown', event => {
        event.preventDefault()
        
        if (!currentObjectOver) return
        if (event.buttons != 1) return

        switch (currentObjectOver.name) {
            case 'Screen':
                const value = getScreenMouseClick()
                if (!value) return

                cards.children[value.tabIndex].focus()
                actualFocus = value.tabIndex + 1
                if (actualFocus >= cards.children.length) actualFocus = 0
                buttonFire.click()
                
                break
            case 'Button.RotateRight':
                buttonRotateRight.click()
                break
            case 'Button.RotateLeft':
                buttonRotateLeft.click()
                break
            case 'Button.Fire':
                buttonFire.click()
                break
            case 'Button.Thrust':
                buttonThrust.click()
                break
            case 'Button.HyperSpace':
                buttonHyperSpace.click()
                break
        }
        setTimeout(loadScreen, 10)
    })
    glRenderer.gl.canvas.addEventListener('mouseup', event => {
        if (!currentObjectOver) return

        switch (currentObjectOver.name) {
            case 'Button.RotateRight':
                buttonRotateRight.up()
                break
            case 'Button.RotateLeft':
                buttonRotateLeft.up()
                break
            case 'Button.Fire':
                buttonFire.up()
                break
            case 'Button.Thrust':
                buttonThrust.up()
                break
            case 'Button.HyperSpace':
                buttonHyperSpace.up()
                break
        }
    })

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

    window.addEventListener('resize', () => {
        glRenderer.setSize(window.innerWidth, window.innerHeight)
    })

    if (window['DEBUG_MODE']) overlayDebug.toggle()

    let lastTimeFps = 0
    let lastTimeSecond = 0
    function animate(timeStamp) {
        if (isSimpleMode) return

        let deltaTime = timeStamp - lastTimeFps
        lastTimeFps = timeStamp
        
        let fps = 1000 / deltaTime

        if (window['DEBUG_MODE']) {
            if (!overlayDebug.state.isOpen) {
                glRenderer.isInitialized = false
                overlayDebug.toggle()
            }

            if (timeStamp - lastTimeSecond >= 1000) {
                lastTimeSecond = timeStamp
                fpsElement.value = fps.toFixed(2)
            }

            glRenderer.setProgram(programId)
            glRenderer.renderScissor(scene, [ camera, debugCamera ], fps)
        } else {
            if (overlayDebug.state.isOpen) {
                glRenderer.isInitialized = false
                overlayDebug.toggle()
            }

            glRenderer.setProgram(programPickingId)
            glRenderer.render(scene, camera, fps)
            
            getMouseOver()

            glRenderer.setProgram(programId)
            glRenderer.render(scene, camera, fps)
        }
        
        window.requestAnimationFrame(animate)
    }
    animate(0)
})()