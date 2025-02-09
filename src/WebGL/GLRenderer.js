import GLProgram from "./GLProgram.js"
import GLTexture from "./GLTexture.js"
import GLShadowMap from "./GLShadowMap.js"
import lineVertexSource from "./shaders/lineVertexSource.js"
import lineFragmentSource from "./shaders/lineFragmentSource.js"
import vertexSource from "./shaders/vertexSource.js"
import fragmentSource from "./shaders/fragmentSource.js"
import pickingVertexSource from "./shaders/pickingVertexSource.js"
import pickingFragmentSource from "./shaders/pickingFragmentSource.js"
import shadowVertexSource from "./shaders/shadowVertexSource.js"
import shadowFragmentSource from "./shaders/shadowFragmentSource.js"

import { UniformType } from "../Core/Uniform.js"
import { ObjectType } from "../Objects/Object3.js"
import { float } from "../types.js"
import Material from "../Core/Material.js"

export default class GLRenderer {
    constructor(wasm) {
        this.wasm = wasm

        const domElement = document.createElement('canvas')
        domElement.id = 'canvas'
        this.gl = domElement.getContext(
            'webgl2', 
            { preserveDrawingBuffer: true, powerPreference: "high-performance" }
        ) // WebGLRenderingContext

        if (!this.gl) {
            alert('Unable to initialize WebGL. Your browser or machine may not support it.')
            return
        }

        this.program = null
        this.programs = []

        this.lineProgramId = this.createProgram(lineVertexSource, lineFragmentSource)
        this.pickingProgramId = this.createProgram(pickingVertexSource, pickingFragmentSource) // to check mouse over in canvas
        this.object3ProgramId = this.createProgram(vertexSource, fragmentSource)
        this.shadowProgramId = this.createProgram(shadowVertexSource, shadowFragmentSource)

        this.width = this.gl.canvas.width
        this.height = this.gl.canvas.height

        this.lastUsedVertexArray = null

        this.onResizeHandler = this.onResizeHandler.bind(this)
        window.addEventListener('resize', this.onResizeHandler)

        // planar projection mapping
        this.settings = {
            posX: 6.5,
            posY: 8.0,
            posZ: 4.3,
            targetX: 0.0,
            targetY: 3.5,
            targetZ: 0.0,
            projWidth: 25.0,
            projHeight: 25.0,
            perspective: false,
            fieldOfView: 15.0,
            bias: 0.001,
            zNear: 1.0,
            zFar: 20.0
        }

        this.lightSpaceMatrix = this.wasm.create(float, Math.matrixIdentity())

        this.lightWorldMatrix = this.wasm.create(float, Math.matrixIdentity())
        this.lightProjectionMatrix = this.wasm.create(float, Math.matrixIdentity())

        this.lightPosition = wasm.create(float, [ this.settings.posX, this.settings.posY, this.settings.posZ ])
        this.lightTarget = wasm.create(float, [ this.settings.targetX, this.settings.targetY, this.settings.targetZ ])
        this.lightUp = wasm.create(float, [ 0.0, 1.0, 0.0 ])

        this.glShadowMap = new GLShadowMap(this.gl)

        this.setup()
    }

    setup(scene = null) {
        this.programId = -1

        this.gl.enable(this.gl.DEPTH_TEST) // teste de profundidade
        this.gl.enable(this.gl.CULL_FACE)
        this.gl.disable(this.gl.SCISSOR_TEST)
        this.isInitialized = true

        if (!scene) return

        const objects = scene.children
        objects.forEach(object => {
            this.setupObject(object, this.shadowProgramId, false)
            this.setupObject(object, this.object3ProgramId, false)
            this.setupObject(object, this.pickingProgramId, true)
        })

        const namesLocations = []
        const material = new Material()
        material.uniforms.list.forEach(uniform => namesLocations.push(`u_material.${ uniform.location }`))
        namesLocations.push("u_ambientLight")
        const amountLights = scene.lights.length
        for (let i = 0; i < amountLights; i++) {
            namesLocations.push(`u_lights[${ i }].surfaceToLight`)

            scene.lights[i].uniforms.list.forEach(light => {
                namesLocations.push(`u_lights[${ i }].${ light.location }`)
            })
        }

        namesLocations.push('u_id')
        namesLocations.push('u_bias')
        namesLocations.push('u_shadow')
        namesLocations.push('u_projection')
        namesLocations.push('u_view')
        namesLocations.push('u_world')
        namesLocations.push('u_viewWorldPosition')
        namesLocations.push('u_lightSpaceMatrix')

        Object.keys(material.samplers).forEach(key => {
            namesLocations.push(key)
        })
        namesLocations.push('projectedTexture')

        for (let i = 0; i < this.programs.length; i++) {
            this.setProgram(i)
            namesLocations.forEach(nameLocation => {
                this.program.setUniformLocation(nameLocation)
            })
        }
    }

    setupObject(object, programId, pickingMode = false) {
        if (object.type == ObjectType.COLLECTION) {
            object.children.forEach(object => {
                this.setupObject(object, programId)
            })
            return
        }

        this.setProgram(programId)
        if (object.type == ObjectType.LINE) {
            if (pickingMode) return

            this.setProgram(this.lineProgramId)
        }

        if (!this.program.existVao(object.id) && (object.type == ObjectType.MESH || object.type == ObjectType.LINE)) {
            // vbo & ebo
            if (!this.program.existVao(object.id)) {
                this.program.setVao(object.id, this.gl.createVertexArray())
            }

            this.useVao(this.program.getVao(object.id))

            const attributes = object.geometry.attributes

            attributes.forEach(attribute => {
                if (attribute.name === 'position' && object.geometry.indice) {
                    this.program.setAttribute(attribute.name, 
                        attribute,
                        object.geometry.indice)
                } else {
                    this.program.setAttribute(attribute.name, attribute)
                }
            })

            Object.keys(object.material.samplers).forEach((key, index) => {
                if (!object.material.samplers[key]) {
                    object.material.samplers[key] = new GLTexture(this.gl)
                    object.material.samplers[key].setEmptyTexture(this.gl)
                    
                    // unbind
                    this.gl.bindTexture(this.gl.TEXTURE_2D, null)
                }
            })

            if (object.geometry.indice) object.counter = object.geometry.indice.data.length
            else object.counter = object.geometry.attributes.filter(attribute => attribute.name == 'position')[0].data.length

            object.isInitialized = true

            /*object.geometry.attributes.forEach(attribute => {
                attribute.data = null
                delete attribute.data
            })*/
        }
    }

    onResizeHandler() {
        this.setSize(window.innerWidth, window.innerHeight)
    }

    createProgram(vertexShaderSource, fragmentShaderSource) {
        this.programs.push(new GLProgram(this.gl, vertexShaderSource, fragmentShaderSource))
        //this.setProgram(this.programs.length - 1)
        return this.programs.length - 1
    }

    setProgram(id) {
        if (this.programId == id) return

        this.programId = id
        this.program = this.programs[id]
        this.gl.useProgram(this.program.id)
    }

    setSize(width, height) {
        this.width = width
        this.height = height
        
        this.gl.canvas.width = this.width
        this.gl.canvas.height = this.height

        // reset display
        this.gl.viewport(0, 0, this.width, this.height)
    }

    renderShadow(scene, fps, debugMode) {
        // Render to depth map
        // depth buffer
        //this.gl.cullFace(this.gl.FRONT) // peter panning correction

        this.gl.viewport(0, 0, this.glShadowMap.size, this.glShadowMap.size)
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.glShadowMap.depthMapFBO)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

        scene.wasm.exports.lightSpaceMatrix(
            this.lightSpaceMatrix.byteOffset,
            this.lightProjectionMatrix.byteOffset,
            this.lightWorldMatrix.byteOffset,
            this.lightPosition.byteOffset,
            this.lightTarget.byteOffset,
            this.lightUp.byteOffset,
            this.settings.projWidth,
            this.settings.projHeight,
            this.settings.zNear,
            this.settings.zFar,
            Math.degreeToRadians(this.settings.fieldOfView),
            this.settings.perspective)

        this.renderScene(scene, { // config with "new camera"
            projectionMatrix: this.lightProjectionMatrix,
            viewMatrix: this.lightWorldMatrix,
            position: this.lightPosition // is not used in the shader line
        }, this.shadowProgramId, fps, debugMode)

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null) // unbind framebuffer

        //this.gl.cullFace(this.gl.BACK)
    }

    render(scene, camera, fps, pickingMode = false, debugMode = false) {
        this.materialName = null
        this.pickingMode = pickingMode

        if (!this.pickingMode) {
            this.renderShadow(scene, fps, debugMode)
        }

        // Render scene
        this.gl.viewport(0, 0, this.width, this.height)

        this.gl.clearColor(0, 0, 0, 0)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

        camera.aspect = this.width / this.height

        this.renderScene(scene, camera, this.object3ProgramId, fps, debugMode)
    }

    renderScissor(scene, cameras, fps, pickingMode = false) {
        this.pickingMode = pickingMode
        this.gl.enable(this.gl.SCISSOR_TEST)

        if (!this.pickingMode) {
            this.renderShadow(scene, fps, false)
        }

        // config display
        // left
        const leftWidth = this.width / 2 | 0
        this.gl.viewport(0, 0, leftWidth, this.height)
        this.gl.scissor(0, 0, leftWidth, this.height)
        this.gl.clearColor(0, 0, 0, 0)

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT) 

        cameras[0].aspect = (this.width / 2) / this.height
        this.renderScene(scene, cameras[0], this.object3ProgramId, fps)

        // right
        const rightWidth = this.width - leftWidth
        this.gl.viewport(leftWidth, 0, rightWidth, this.height)
        this.gl.scissor(leftWidth, 0, rightWidth, this.height)
        this.gl.clearColor(0.925, 0.941, 0.945, 1) 

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT) 

        cameras[1].aspect = (this.width / 2) / this.height
        this.renderScene(scene, cameras[1], this.object3ProgramId, fps, true)
    }

    renderScene(scene, camera, programId, fps, debugMode = false) {
        const objects = scene.children

        this.renderObjects(objects, scene, camera, programId, fps, debugMode)
    }

    renderObjects(objects, scene, camera, programId, fps, debugMode) {
        objects.forEach(object => {
            this.renderObject(
                object, scene, camera, 
                programId,
                fps, debugMode)
        })
    }

    renderObject(object, scene, camera, programId, fps, debugMode) {
        if (object.type == ObjectType.COLLECTION) {
            this.renderObjects(object.children, scene, camera, programId, fps, debugMode)
            return
        }

        if (!debugMode && object.debug) return

        this.setProgram(programId)
        if (object.type == ObjectType.MESH || object.type == ObjectType.OBJECT3) {
            if (this.pickingMode) {
                this.setProgram(this.pickingProgramId)
            }
        } else if (object.type == ObjectType.LINE) {
            if (this.pickingMode) return

            this.setProgram(this.lineProgramId)
        }

        object.onBeforeRender(fps)

        // draw
        if (object.type != ObjectType.MESH && object.type != ObjectType.LINE) return
        // if (!this.program.existVao(object.id)) return

        this.useVao(this.program.getVao(object.id))

        // load samplers
        if (!this.sameMaterial(object.material)) {
            let unit = 0
            Object.keys(object.material.samplers).forEach(key => {
                this.gl.activeTexture(this.gl.TEXTURE0 + unit)
                this.gl.bindTexture(this.gl.TEXTURE_2D, object.material.samplers[key].data)
                this.program.setUniform(key, unit, UniformType.SAMPLER)
                
                unit++
            })
            this.gl.activeTexture(this.gl.TEXTURE0 + unit)
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.glShadowMap.depthMap)
            this.program.setUniform('projectedTexture', unit, UniformType.SAMPLER)
        }
        
        // load id for picking mode
        if (this.pickingMode) {
            this.program.setUniform('u_id', [
                ((object.id >>  0) & 0xFF) / 0xFF,
                ((object.id >>  8) & 0xFF) / 0xFF,
                ((object.id >> 16) & 0xFF) / 0xFF,
                ((object.id >> 24) & 0xFF) / 0xFF,
            ], UniformType.VEC4)
        }

        this.program.setUniform('u_bias', [this.settings.bias], UniformType.FLOAT)
        this.program.setUniform('u_shadow', [object.shadow], UniformType.INT)

        this.program.setUniform('u_projection', camera.projectionMatrix, UniformType.MAT4)
        this.program.setUniform('u_view', camera.viewMatrix, UniformType.MAT4)
        this.program.setUniform('u_world', object.worldMatrix, UniformType.MAT4)

        this.program.setUniform('u_viewWorldPosition', camera.position, UniformType.VEC3)

        // planar projection
        this.program.setUniform('u_lightSpaceMatrix', this.lightSpaceMatrix, UniformType.MAT4)

        if (object.material) {
            if (object.type == ObjectType.MESH) {
                object.material.uniforms.list.forEach(uniform => {
                    this.program.setUniform(
                        `u_material.${ uniform.location }`, 
                        uniform.value, 
                        uniform.type)
                })

                this.program.setUniform('u_ambientLight', [ .1, .1, .1 ], UniformType.VEC3)

                const amountLights = scene.lights.length
                for (let i = 0; i < amountLights; i++) {
                    this.program.setUniform(`u_lights[${ i }].surfaceToLight`, scene.lights[i].position, UniformType.VEC3)

                    scene.lights[i].uniforms.list.forEach(light => {
                        this.program.setUniform(
                            `u_lights[${ i }].${ light.location }`, 
                            light.value, 
                            light.type)
                    })
                }
            } else if (object.type == ObjectType.LINE) {
                const opacity = object.material.uniforms.list.filter(uniform => uniform.location == 'opacity')[0]
                this.program.setUniform(`u_material.${ opacity.location }`, opacity.value, opacity.type)
            }
        }

        const offset = 0

        if (object.type == ObjectType.MESH || object.type == ObjectType.OBJECT3) {
            const primitiveType = this.gl.TRIANGLES

            const count = object.counter / 3
            this.gl.drawArrays(primitiveType, offset, count)
        } else if (object.type == ObjectType.LINE) {
            const primitiveType = this.gl.LINES

            const indexType = this.gl.UNSIGNED_INT
            const count = object.counter
            this.gl.drawElements(primitiveType, count, indexType, offset)
        }

        object.onAfterRender(fps)
    }

    sameMaterial(material) {
        if (material.name == this.materialName) return true

        this.materialName = material.name
        return false
    }

    useVao(vao) {
        if (vao !== this.lastUsedVertexArray) {
            this.lastUsedVertexArray = vao
            this.gl.bindVertexArray(vao)
        }
    }
}