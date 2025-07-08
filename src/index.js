import Wasm from "./Wasm.js"
import { GLRenderer } from "./WebGL/index.js"
import Scene from "./Objects/Scene.js"
import Camera from "./Objects/Cameras/Camera.js"
import Light from "./Objects/Lights/Light.js"
import Axis from "./Objects/Axis.js"
import Arcade from "./Arcade/Arcade.js"
import { loadObj } from './Loader.js'
import Plane from "./Primitives/Plane.js"
import Material from "./Core/Material.js"
import { ObjectType } from "./Objects/Object3.js"

(() => {
    if (window.executeInSimplifiedMode) {
        return
    }

    document.querySelector('.shortcuts').style.display = 'block'

    const wasm = new Wasm()

    WebAssembly.instantiateStreaming(fetch("assets/main.wasm"), wasm.importObject()).then(
        object => {
            wasm.exports = object.instance.exports
            wasm.memory = object.instance.exports.memory.buffer

            wasm.exports._start()

            /// RENDERER
            const glRenderer = new GLRenderer(wasm)
                    
            glRenderer.setSize(window.innerWidth, window.innerHeight) // change resolution image (1x, 2x)
            document.querySelector('#experience').appendChild(glRenderer.gl.canvas)
            glRenderer.setSize(glRenderer.gl.canvas.clientWidth, glRenderer.gl.canvas.clientHeight)

            let statusArcade = false

            const updateScroll = () => {
                if (arcade.isSimpleMode || !scene.children) return t

                let t = Math.abs(document.body.getBoundingClientRect().top / (document.querySelector('#hero').clientHeight + document.querySelector('#projects').clientHeight - window.innerHeight))

                if (t > 1.0 ) {
                    glRenderer.gl.canvas.style.top = document.querySelector('#projects').getBoundingClientRect().top - 24 + 'px'
                    t = 1.0
                    //return t
                } else {
                    glRenderer.gl.canvas.style.top = '0'
                }

                if (arcade.inmove) return t

                document.body.style.setProperty('--scroll', t)

                wasm.update(camera.position, [
                    Math.easeInOutQuad(t, 8.5, startCamera[0]), 
                    Math.easeInOutQuad(t, 12.0, startCamera[1]), 
                    Math.easeInOutQuad(t, 0.0, startCamera[2])
                ])
                wasm.update(scene.children.find(object => object.type == ObjectType.COLLECTION).position, [
                    startArcade[0], 
                    Math.easeInOutQuad(t, 0.0, startArcade[1]), 
                    startArcade[2]
                ])

                document.querySelector('canvas').style.transform = `
                    translateX(-${ Math.easeInOutQuad(t, getComputedStyle(glRenderer.gl.canvas).getPropertyValue('left').split('px')[0], 0) }px)
                `

                if (t >= 0.85) {
                    if (statusArcade == false) {
                        statusArcade = true
                        activeArcade()
                    }
                } else {
                    if (statusArcade == true) {
                        statusArcade = false
                        disableArcade()
                    }
                }
                return t
            }

            window.addEventListener('scroll', updateScroll)

            /// SCENE
            const scene = new Scene(wasm)

            /// AXIS
            const axis = new Axis(wasm, {
                position: [ 0.0, 11.75, 0.0],
                scale: [ 1.0, 1.0, 1.0 ]
            })
            scene.add(axis)

            /// CAMERA
            const startCamera = [ 30.0, 20.0, -20.0 ]

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
                position: [ 6.0, 15.0, -4.3 ]
            })
            scene.addLight(light001)

            // MASK
            const material = new Material({
                shininess: [ 0.0 ],
                ambient: [ 0.0, 0.0, 0.0 ],
                diffuse: [ 0.0, 0.0, 0.0 ],
                specular: [ 0.0, 0.0, 0.0 ],
                emissive: [ 0.0, 0.0, 0.0 ],
                opticalDensity: [ 1.45 ],
                opacity: [ 0.0 ],
                illum: [ 0.0 ]
            })

            const plane001 = new Plane(wasm, glRenderer.gl, {
                position: [ 6, -2, 0 ],
                rotation: [ 0, 0, Math.degreeToRadians(-90) ]
            })
            plane001.shadow = 1
            plane001.material = material
            scene.add(plane001)
            const plane002 = new Plane(wasm, glRenderer.gl, {
                position: [ -3/2, -2, -6-3/2 ],
                rotation: [ Math.degreeToRadians(-90), 0, 0 ]
            })
            plane002.shadow = 1
            plane002.material = material
            scene.add(plane002)

            /// ARCADE
            const arcade = new Arcade(wasm, glRenderer.gl)

            const startArcade = [ 0.0, 5.0, 0.0 ]

            loadObj(wasm, glRenderer.gl, './assets/arcade/', 'arcade.obj', {
                position: [ 0.0, -50.0, 0.0 ]
            })
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

                    const tScroll = updateScroll()

                    arcade.inmove = true

                    let steps = 100 // TODO: influenced by FPS
                    for (let i = steps; i >= 0; i--) {
                        const t = i / steps
                        wasm.update(collection.position, [
                            Math.easeInOutQuad(t, 0.0, startArcade[0]), 
                            Math.easeInOutQuad(t, -50.0, startArcade[1] * (1 - tScroll)), 
                            Math.easeInOutQuad(t, 0.0, startArcade[2])
                        ])
                        await new Promise(resolve => setTimeout(resolve, 5))
                    }

                    arcade.inmove = false
                    updateScroll()
                })

            // mousemoveend event
            const debounce = (callback, wait) => {
                let timeoutId = null
                return (...args) => {
                    window.clearTimeout(timeoutId)
                    timeoutId = window.setTimeout(() => {
                        callback(...args)
                    }, wait)
                }
            }

            const throttle = (callback, wait) => {
                let timeoutId = null
                
                return (...args) => {
                    if (timeoutId === null) {
                        callback(...args)
                        timeoutId = setTimeout(() => { 
                            timeoutId = null
                        }, wait)
                    }
                }
            }

            let wheelEventEndTimeoutId = null

            const keydownEvent = (event) => {
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
                        window.scroll({ top: 0, behavior: 'instant' })
                        updateScroll()
                        break
                    default:
                        return
                }
                setTimeout(() => {
                    arcade.updateScreen(scene)
                }, 10)
                document.addEventListener('keyup', arcade.onKeyupHandler)
            }

            const mousemoveEvent = debounce(function (event) {
                arcade.onMouseMoveHandler(event)
            }, 50)

            const mouseDownEvent = (event) => {
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
            }

            const wheelEvent = (event) => {
                if (!arcade.currentObjectOver) return

                switch (arcade.currentObjectOver.name) {
                    case 'Screen':
                        event.preventDefault()

                        if (event.deltaY > 0) arcade.buttonRotateRight.click()
                        else arcade.buttonRotateLeft.click()

                        setTimeout(() => {
                            arcade.updateScreen(scene)
                        }, 10)

                        window.clearTimeout(wheelEventEndTimeoutId)
                        wheelEventEndTimeoutId = window.setTimeout(() => {
                            arcade.buttonRotateRight.up()
                            arcade.buttonRotateLeft.up() 
                        }, 500)
                        
                        break
                    default:
                        break
                }
            }

            const activeArcade = async () => {
                /// EVENTS
                document.addEventListener('keydown', keydownEvent)
                document.addEventListener('mousemove', mousemoveEvent)
                glRenderer.gl.canvas.addEventListener('mousedown', mouseDownEvent)
                glRenderer.gl.canvas.addEventListener('wheel', wheelEvent)
            }

            const disableArcade = () => {
                document.removeEventListener('keydown', keydownEvent)
                document.removeEventListener('mousemove', mousemoveEvent)
                glRenderer.gl.canvas.removeEventListener('mousedown', mouseDownEvent)
                glRenderer.gl.canvas.removeEventListener('wheel', wheelEvent)
            }

            /// ANIMATE
            let lastTimeFps = 0
            let fps = 0

            window.fps = () => {
                return fps
            }

            glRenderer.setup(scene)
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