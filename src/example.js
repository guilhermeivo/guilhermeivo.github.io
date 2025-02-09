import Wasm from "./Wasm.js"
import { GLRenderer } from "./WebGL/index.js"
import GLInfo from "./WebGL/GLInfo.js"
import Scene from "./Objects/Scene.js"
import Plane from "./Primitives/Plane.js"
import Monkey from "./Primitives/Monkey.js"
import Camera from "./Objects/Cameras/Camera.js"
import Light from "./Objects/Lights/Light.js"
import LightHelper from "./Helpers/LightHelper.js"

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
                    value: GLInfo.getRenderer(glRenderer.gl),
                    readonly: 'readonly'
                }
            }, {
                label: 'Vendor',
                type: 'text',
                configs: { 
                    value: GLInfo.getVendor(glRenderer.gl),
                    readonly: 'readonly'
                }
            }, {
                label: 'Camera_zNear',
                type: 'range',
                configs: { 
                    value: 1,
                }
            }, {
                label: 'Camera_zFar',
                type: 'range',
                configs: { 
                    value: 2000,
                    max: 2500
                }
            }, {
                label: 'Camera_X',
                type: 'range',
                configs: { 
                    value: 2.75,
                    max: 50,
                    min: -50
                }
            }, {
                label: 'Camera_Y',
                type: 'range',
                configs: { 
                    value: 8,
                    max: 50,
                    min: -50
                }
            }, {
                label: 'Camera_Z',
                type: 'range',
                configs: { 
                    value: 25,
                    max: 50,
                    min: -50
                }
            }, {
                label: 'Camera_Orthographic',
                type: 'checkbox'
            }, {
                label: 'Camera_Units',
                type: 'range',
                configs: { 
                    value: 250,
                    max: 1000,
                    min: -1000
                }
            }, {
                label: 'Camera_View',
                type: 'range',
                configs: { 
                    value: Math.degreeToRadians(60)
                }
            }
        ])

        const fpsElement = document.querySelector('#textFPS')
        overlayDebug.toggle()

        /// SCENE
        const scene = new Scene(wasm)

        /// CAMERA
        const camera = new Camera(wasm, {
            position: [ 3, 8, 25 ],
            target: [ 0, 15/2-2, 0 ]
        }, {
            zNear: 1,
            zFar: 2000,
            orthographicUnits: 250,
            fieldOfViewRadians: Math.degreeToRadians(60)
        })
        scene.add(camera)

        const light001 = new Light(wasm, { 
            position: [ 6, 10, -4.3 ]
        })
        scene.addLight(light001)
        scene.add(new LightHelper(wasm, light001))

        scene.add(new Plane(wasm, glRenderer.gl))
        scene.add(new Plane(wasm, glRenderer.gl, {
            position: [ -15/2, 15/2, 0 ],
            rotation: [ 0, 0, Math.degreeToRadians(-90) ]
        }))
        scene.add(new Monkey(wasm, {
            position: [ 0, 3.5, 0 ],
            scale: [ 3, 3, 3 ]
        }))

        /// ANIMATE
        let lastTimeFps = 0
        let lastTimeFpsView = 0

        glRenderer.setup(scene)
        function animate(timeStamp) {
            let deltaTime = timeStamp - lastTimeFps
            lastTimeFps = timeStamp
            
            let fps = 1000 / deltaTime

            if (timeStamp - lastTimeFpsView >= 1000) { // time to update the FPS view
                lastTimeFpsView = timeStamp
                fpsElement.value = fps.toFixed(2)
            }
            
            glRenderer.render(scene, camera, fps, false, true)
            window.requestAnimationFrame(animate)
        }
        animate(0)

        wasm.exports.cleanup()
        wasm.exports._exit()
    },
)