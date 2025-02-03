import Wasm from "./Wasm.js"
import { GLRenderer } from "./WebGL/index.js"
import Scene from "./Objects/Scene.js"
import Camera from "./Objects/Cameras/Camera.js"
import Light from "./Objects/Lights/Light.js"
import Axis from "./Objects/Axis.js"
import Arcade from "./Arcade/Arcade.js"
import { loadObj } from './Loader.js'

(() => {
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return
    }

    document.querySelector('.shortcuts').style.display = 'block'

    const wasm = new Wasm()

    WebAssembly.instantiateStreaming(fetch("main.wasm"), wasm.importObject()).then(
        object => {
            wasm.exports = object.instance.exports
            wasm.memory = object.instance.exports.memory.buffer

            wasm.exports._start()

            /// RENDERER
            const glRenderer = new GLRenderer(wasm)
                    
            glRenderer.setSize(window.innerWidth, window.innerHeight) // change resolution image (1x, 2x)
            document.body.appendChild(glRenderer.gl.canvas)

            /// SCENE
            const scene = new Scene(wasm)

            /// AXIS
            const axis = new Axis(wasm, {
                position: [ 0.0, 11.75, 0.0],
                scale: [ 1.0, 1.0, 1.0 ]
            })
            scene.add(axis)

            /// CAMERA
            const startCamera = [ 25.0, 25.0, 75.0 ]

            const camera = new Camera(wasm, {
                position: startCamera,
                target: [ 0.0, 11.75, 0.0]
            }, {
                zNear: 1.0,
                zFar: 100.0,
                fieldOfViewRadians: Math.degreeToRadians(45)
            })
            scene.add(camera)

            const light001 = new Light(wasm, { 
                position: [ 6.0, 10.0, -4.3 ]
            })
            scene.addLight(light001)

            /// ARCADE
            const arcade = new Arcade(wasm, glRenderer.gl)

            loadObj(wasm, glRenderer.gl, './resources/arcade/', 'arcade.obj')
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

                    glRenderer.setup(scene)

                    // animation
                    let steps = 100 // TODO: influenced by FPS
                    for (let i = steps; i >= 0; i--) {
                        const t = i / steps
                        wasm.update(camera.position, [
                            Math.easeInOutQuad(t, startCamera[0], 8.5), 
                            Math.easeInOutQuad(t, startCamera[1], 12), 
                            Math.easeInOutQuad(t, startCamera[2], 0)
                        ])
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

            wasm.exports.cleanup()
            wasm.exports._exit()
        },
    )
})()