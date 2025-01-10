`use strict`

import Scene from './Core/Scene.js'

import './components/overlayDebug/index.js'
import Light from './Lights/Light.js'
import { loadObj } from './Loader.js'
import Axis from './Objects/Axis.js'
import Camera from './Cameras/Camera.js'

import Vector3 from './Math/Vector3.js'
import GLRenderer from './GLRenderer.js'

import Arcade from './Arcade/Arcade.js'

(() => {
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return
    }

    document.querySelector('.shortcuts').style.display = 'block'
    
    /// RENDERER
    const glRenderer = new GLRenderer()
    
    glRenderer.setSize(window.innerWidth, window.innerHeight) // change resolution image (1x, 2x)
    document.body.appendChild(glRenderer.gl.canvas)

    /// SCENE
    const scene = new Scene()

    /// AXIS
    const axis = new Axis({
        position: new Vector3(0, 11.75, 0),
        scale: new Vector3(1, 1, 1)
    })
    scene.add(axis)

    /// CAMERA
    const startCamera = [25, 25, 75]

    const camera = new Camera({
        position: new Vector3(startCamera[0], startCamera[1], startCamera[2])
    }, {
        zNear: 1,
        zFar: 100,
        fieldOfViewRadians: Math.degreeToRadians(45)
    })
    camera.target = axis.position
    scene.add(camera)

    /// Light
    const light001 = new Light({ 
        position: new Vector3(6, 15, -4.3)
    })
    scene.addLight(light001)

    /*const light002 = new Light({
        position: new Vector3(-125, 125, 125)
    })
    scene.addLight(light002)
    scene.add(new LightHelper(light002))*/

    // DEBUG CONFIGURATION

    const arcade = new Arcade(glRenderer.gl)
    
    /// ARCADE
    loadObj(glRenderer.gl, '../resources/arcade/', 'arcade.obj')
        .then(async collection => {
            scene.add(collection)
            arcade.screenArcade.open()
            arcade.updateScreen(scene)

            arcade.buttonRotateRight.init(collection.children.filter(object => object.name == 'Button.RotateRight')[0])
            arcade.buttonRotateLeft.init(collection.children.filter(object => object.name == 'Button.RotateLeft')[0])
            arcade.buttonFire.init(collection.children.filter(object => object.name == 'Button.Fire')[0])
            arcade.buttonThrust.init(collection.children.filter(object => object.name == 'Button.Thrust')[0])
            arcade.buttonHyperSpace.init(collection.children.filter(object => object.name == 'Button.HyperSpace')[0])

            collection.children.filter(object => object.name == 'Screen')[0].shadow = 1

            // animation
            let steps = 100 // TODO: influenced by FPS
            for (let i = steps; i >= 0; i--) {
                const t = i / steps
                camera.position.set(
                    Math.easeInOutQuad(t, startCamera[0], 8.5), 
                    Math.easeInOutQuad(t, startCamera[1], 12), 
                    Math.easeInOutQuad(t, startCamera[2], 0))
                await new Promise(resolve => setTimeout(resolve, 5))
            }
        })

    /// EVENTS
    document.addEventListener('keydown', event => {
        switch (event.key) {
            case 'Escape':
                arcade.buttonHyperSpace.click()
                break
            case 'Tab':
                arcade.buttonThrust.click(event)
                break
            case 'Enter':
                arcade.buttonFire.click(event)
                break
            case 'ArrowUp':
            case 'ArrowLeft':
                arcade.buttonRotateLeft.click()
                break
            case 'ArrowDown':
            case 'ArrowRight':
                arcade.buttonRotateRight.click()
                break
            case 'c':
            case 'C':
                arcade.switchMode(animate)
                break
            default:
                return
        }
        setTimeout(() => {
            arcade.updateScreen(scene)
        }, 10)
        document.addEventListener('keyup', arcade.onKeyupHandler)
    })

    glRenderer.gl.canvas.addEventListener('mousemove', arcade.onMouseMoveHandler)

    glRenderer.gl.canvas.addEventListener('mousedown', event => {
        event.preventDefault()
        
        if (!arcade.currentObjectOver) return
        if (event.buttons != 1) return

        const cards = document.querySelector("#cards")
        let clickedButton = null
        switch (arcade.currentObjectOver.name) {
            case 'Screen':
                const value = arcade.getScreenMouseClick()
                if (!value) return

                cards.children[value.tabIndex - 1].focus()
                arcade.actualFocus = value.tabIndex
                if (arcade.actualFocus >= cards.children.length) arcade.actualFocus = 0
                arcade.buttonFire.click()
                clickedButton = arcade.buttonFire
                break
            case 'Button.RotateRight':
                arcade.buttonRotateRight.click()
                clickedButton = arcade.buttonRotateRight
                break
            case 'Button.RotateLeft':
                arcade.buttonRotateLeft.click()
                clickedButton = arcade.buttonRotateLeft
                break
            case 'Button.Fire':
                arcade.buttonFire.click()
                clickedButton = arcade.buttonFire
                break
            case 'Button.Thrust':
                arcade.buttonThrust.click()
                clickedButton = arcade.buttonThrust
                break
            case 'Button.HyperSpace':
                arcade.buttonHyperSpace.click()
                clickedButton = arcade.buttonHyperSpace
                break
            default:
                break
        }
        setTimeout(() => {
            if (clickedButton) clickedButton.up()
            arcade.updateScreen(scene)
        }, 10)

        glRenderer.gl.canvas.addEventListener('mouseup', arcade.onMouseupHandler)
    })

    let wheelEventEndTimeout = null
    glRenderer.gl.canvas.addEventListener('wheel', event => {
        if (!arcade.currentObjectOver) return

        switch (arcade.currentObjectOver.name) {
            case 'Screen':
                event.preventDefault()
                if (event.deltaY > 0) arcade.buttonRotateRight.click()
                else arcade.buttonRotateLeft.click() 
                clearTimeout(wheelEventEndTimeout)
                wheelEventEndTimeout = setTimeout(() => {
                    arcade.buttonRotateRight.up()
                    arcade.buttonRotateLeft.up() 
                }, 100)
                
                break
            default:
                break
        }

        setTimeout(() => {
            arcade.updateScreen(scene)
        }, 10)
    })

    /// ANIMATE
    let lastTimeFps = 0
    let fps = 0

    window.fps = () => {
        return fps
    }

    function animate(timeStamp) {
        if (arcade.isSimpleMode) return

        let deltaTime = timeStamp - lastTimeFps
        lastTimeFps = timeStamp
        
        fps = 1000 / deltaTime

        glRenderer.render(scene, camera, fps, true)
        arcade.getMouseOver(scene)
        glRenderer.render(scene, camera, fps, false)
        
        window.requestAnimationFrame(animate)
    }
    animate(0)
})()