import GLTexture from "./Textures/GLTexture.js"
import GLProgram from "./GLProgram.js"
import lineVertexSource from "./shaders/lineVertexSource.js"
import lineFragmentSource from "./shaders/lineFragmentSource.js"
import Matrix4 from "./Math/Matrix4.js"
import Vector3 from "./Math/Vector3.js"
import vertexSource from "./shaders/vertexSource.js"
import fragmentSource from "./shaders/fragmentSource.js"
import pickingVertexSource from "./shaders/pickingVertexSource.js"
import pickingFragmentSource from "./shaders/pickingFragmentSource.js"
import ProjectionHelper from "./Helpers/ProjectionHelper.js"

export default class GLRenderer {
    constructor() {
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
        this.colorProgramId = this.createProgram(lineVertexSource, lineFragmentSource)

        this.width = this.gl.canvas.width
        this.height = this.gl.canvas.height

        this.lastUsedVertexArray = null

        this.onResizeHandler = this.onResizeHandler.bind(this)
        window.addEventListener('resize', this.onResizeHandler)

        // planar projection mapping
        this.settings = {
            posX: 125,
            posY: 150,
            posZ: -125,
            targetX: 10,
            targetY: 40,
            targetZ: 0,
            projWidth: 50,
            projHeight: 90,
            perspective: false,
            fieldOfView: 15,
            bias: -0.006,
            zNear: 150,
            zFar: 250
        }

        this.textureMatrix = new Matrix4()
        this.textureMatrix.identity()
        this.mat = new Matrix4()
        this.mat.identity()

        this.lightWorldMatrix = new Matrix4()
        this.lightProjectionMatrix = new Matrix4()

        this.projectionHelper = new ProjectionHelper()

        // depth texture
        function loadDepthTexture(gl, size) {
            const depthTexture = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_2D, depthTexture)
            gl.texImage2D(
                gl.TEXTURE_2D,      // target
                0,                  // mip level
                gl.DEPTH_COMPONENT32F, // internal format
                size,   // width
                size,   // height
                0,                  // border
                gl.DEPTH_COMPONENT, // format
                gl.FLOAT,           // type
                null)               // data
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

            return depthTexture
        }

        function loadDepthFrameBuffer(gl, depthTexture) {
            const depthFramebuffer = gl.createFramebuffer()
            gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer)
            gl.framebufferTexture2D(
                gl.FRAMEBUFFER,       // target
                gl.DEPTH_ATTACHMENT,  // attachment point
                gl.TEXTURE_2D,        // texture target
                depthTexture,         // texture
                0)                    // mip level
            return depthFramebuffer
        }
        
        this.depthTextureSize = 1024 * 2
        this.depthTexture = loadDepthTexture(this.gl, this.depthTextureSize)
        
        this.depthFramebuffer = loadDepthFrameBuffer(this.gl, this.depthTexture)
    }

    onResizeHandler() {
        this.setSize(window.innerWidth, window.innerHeight)
    }

    createProgram(vertexShaderSource, fragmentShaderSource) {
        this.programs.push(new GLProgram(this.gl, vertexShaderSource, fragmentShaderSource))
        this.setProgram(this.programs.length - 1)
        return this.programs.length - 1
    }

    setProgram(id) {
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

    render(scene, camera, fps, pickingMode = false, debugMode = false) {
        this.pickingMode = pickingMode
        if (!this.isInitialized) {
            this.gl.enable(this.gl.DEPTH_TEST) // teste de profundidade
            this.gl.enable(this.gl.CULL_FACE)
            this.gl.disable(this.gl.SCISSOR_TEST)
            this.isInitialized = true
        }

        // calc lights matrix4
        this.lightWorldMatrix.lookAt(
            [this.settings.posX, this.settings.posY, this.settings.posZ],          // position
            [this.settings.targetX, this.settings.targetY, this.settings.targetZ], // target
            [0, 1, 0],                                              // up
        )

        this.settings.perspective
            ? this.lightProjectionMatrix.perspective(
                Math.degreeToRadians(this.settings.fieldOfView),
                this.settings.projWidth / this.settings.projHeight,
                this.settings.zNear,  // near
                this.settings.zFar)  // far
            : this.lightProjectionMatrix.orthographic(
                -this.settings.projWidth / 2,   // left
                this.settings.projWidth / 2,   // right
                -this.settings.projHeight / 2,  // bottom
                this.settings.projHeight / 2,  // top
                this.settings.zNear,                      // near
                this.settings.zFar)                      // far

        // depth buffer
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.depthFramebuffer)
        this.gl.viewport(0, 0, this.depthTextureSize, this.depthTextureSize)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

        this.lightWorldMatrix.invert(this.lightWorldMatrix)
        this.renderScene(scene, { // config with "new camera"
            projectionMatrix: this.lightProjectionMatrix,
            viewMatrix: this.lightWorldMatrix,
            position: new Vector3(this.settings.posX, this.settings.posY, this.settings.posZ) // is not used in the shader line
        }, this.colorProgramId, fps, debugMode)

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null) // unbind framebuffer

        this.gl.viewport(0, 0, this.width, this.height)

        this.gl.clearColor(0, 0, 0, 0)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

        // calc textureMatrix
        this.textureMatrix.identity()
        this.textureMatrix.translate(new Vector3(0.5, 0.5, 0.5))
        this.textureMatrix.scale(new Vector3(0.5, 0.5, 0.5))
        this.textureMatrix.multiply(this.lightProjectionMatrix)

        this.textureMatrix.multiply(this.lightWorldMatrix)

        this.lightWorldMatrix.invert(this.lightWorldMatrix)   // return to default

        this.lightProjectionMatrix.invert(this.lightProjectionMatrix)
        this.mat.identity()
        this.mat.multiply(this.lightWorldMatrix)
        this.mat.multiply(this.lightProjectionMatrix)

        camera.aspect = this.width / this.height

        this.renderScene(scene, camera, this.object3ProgramId, fps, debugMode)

        if (this.projectionHelper.id == 0) {
            scene.add(this.projectionHelper)
        }
        this.projectionHelper.updateWorld(this.mat)
    }

    renderScissor(scene, cameras, fps, pickingMode = false) {
        this.pickingMode = pickingMode
        if (!this.isInitialized) {
            this.gl.enable(this.gl.DEPTH_TEST)
            this.gl.enable(this.gl.CULL_FACE)
            this.gl.enable(this.gl.SCISSOR_TEST)
            this.isInitialized = true
        }

        // calc lights matrix4
        this.lightWorldMatrix.lookAt(
            [this.settings.posX, this.settings.posY, this.settings.posZ],          // position
            [this.settings.targetX, this.settings.targetY, this.settings.targetZ], // target
            [0, 1, 0],                                              // up
        )

        this.settings.perspective
            ? this.lightProjectionMatrix.perspective(
                Math.degreeToRadians(this.settings.fieldOfView),
                this.settings.projWidth / this.settings.projHeight,
                this.settings.zNear,  // near
                this.settings.zFar)  // far
            : this.lightProjectionMatrix.orthographic(
                -this.settings.projWidth / 2,   // left
                this.settings.projWidth / 2,   // right
                -this.settings.projHeight / 2,  // bottom
                this.settings.projHeight / 2,  // top
                this.settings.zNear,                      // near
                this.settings.zFar)                      // far

        // depth buffer
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.depthFramebuffer)
        this.gl.viewport(0, 0, this.depthTextureSize, this.depthTextureSize)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

        this.lightWorldMatrix.invert(this.lightWorldMatrix)
        this.renderScene(scene, { // config with "new camera"
            projectionMatrix: this.lightProjectionMatrix,
            viewMatrix: this.lightWorldMatrix,
            position: new Vector3(this.settings.posX, this.settings.posY, this.settings.posZ) // is not used in the shader line
        }, this.colorProgramId, fps)

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null) // unbind framebuffer

        // config display
        // left
        const leftWidth = this.width / 2 | 0
        this.gl.viewport(0, 0, leftWidth, this.height)
        this.gl.scissor(0, 0, leftWidth, this.height)
        this.gl.clearColor(0, 0, 0, 0)

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT) 

        // calc textureMatrix
        this.textureMatrix.identity()
        this.textureMatrix.translate(new Vector3(0.5, 0.5, 0.5))
        this.textureMatrix.scale(new Vector3(0.5, 0.5, 0.5))
        this.textureMatrix.multiply(this.lightProjectionMatrix)

        this.textureMatrix.multiply(this.lightWorldMatrix)

        this.lightWorldMatrix.invert(this.lightWorldMatrix)   // return to default

        this.lightProjectionMatrix.invert(this.lightProjectionMatrix)
        this.mat.identity()
        this.mat.multiply(this.lightWorldMatrix)
        this.mat.multiply(this.lightProjectionMatrix)

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

        if (this.projectionHelper.id == 0) {
            scene.add(this.projectionHelper)
        }
        this.projectionHelper.updateWorld(this.mat)
    }

    renderScene(scene, camera, programId, fps, debugMode = false) {
        const objects = scene.children

        this.renderObjects(objects, scene, camera, programId, fps, debugMode)
    }

    renderObjects(objects, scene, camera, programId, fps, debugMode) {
        objects.forEach(object => {
            this.renderObject(
                object, scene, camera, 
                programId, // default program id
                fps, debugMode)
        })
    }

    renderObject(object, scene, camera, programId, fps, debugMode) {
        if (object.type == 'collection') {
            this.renderObjects(object.children, scene, camera, programId, fps, debugMode)
        }

        if (!debugMode && object.debug) return

        this.setProgram(programId)
        if (object.type == 'mesh' || object.type == 'object3') {
            if (this.pickingMode) {
                this.setProgram(this.pickingProgramId)
            }
        } else if (object.type == 'line') {
            if (this.pickingMode) return

            this.setProgram(this.lineProgramId)
        }

        // init
        if (!this.program.existVao(object.id) && (object.type == 'mesh' || object.type == 'line')) {
            // vbo & ebo
            if (!object.vao) this.program.setVao(object.id, this.gl.createVertexArray())

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
                    //this.gl.activeTexture(this.gl.TEXTURE0)
                    //this.gl.bindTexture(this.gl.TEXTURE_2D, null)
                }
            })

            if (object.geometry.indice) object.counter = object.geometry.indice.data.length
            else object.counter = object.geometry.attributes.filter(attribute => attribute.name == 'position')[0].data.length

            object.isInitialized = true

            object.geometry.attributes.forEach(attribute => {
                //attribute.data = null
                //delete attribute.data
            })
        }

        object.onBeforeRender(scene, camera, fps)

        // draw
        if (!this.program.existVao(object.id)) return

        this.useVao(this.program.getVao(object.id))

        // load samplers
        let unit = 0
        Object.keys(object.material.samplers).forEach(key => {
            this.gl.activeTexture(this.gl.TEXTURE0 + unit)
            this.gl.bindTexture(this.gl.TEXTURE_2D, object.material.samplers[key].data)
            this.program.setUniform(key, unit, this.program.types.sampler)
            unit++
        })

        this.gl.activeTexture(this.gl.TEXTURE0 + unit)
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthTexture)
        this.program.setUniform('projectedTexture', unit, this.program.types.sampler)
        
        this.program.setUniform('u_id', [
            ((object.id >>  0) & 0xFF) / 0xFF,
            ((object.id >>  8) & 0xFF) / 0xFF,
            ((object.id >> 16) & 0xFF) / 0xFF,
            ((object.id >> 24) & 0xFF) / 0xFF,
        ], this.program.types.vec4)

        this.program.setUniform('u_bias', [this.settings.bias], this.program.types.float)
        this.program.setUniform('u_shadow', [object.shadow], this.program.types.int)

        this.program.setUniform('u_projection', camera.projectionMatrix.elements, this.program.types.mat4)
        this.program.setUniform('u_view', camera.viewMatrix.elements, this.program.types.mat4)
        this.program.setUniform('u_world', object.worldMatrix.elements, this.program.types.mat4)

        this.program.setUniform('u_viewWorldPosition', camera.position.elements, this.program.types.vec3)

        // planar projection
        this.program.setUniform('u_textureMatrix', this.textureMatrix.elements, this.program.types.mat4)

        if (object.material) {
            if (object.type == 'mesh') {
                object.material.uniforms.list.forEach(uniform => {
                    this.program.setUniform(
                        `u_material.${ uniform.location }`, 
                        uniform.value, 
                        this.program.types[uniform.type])
                })

                this.program.setUniform('u_ambientLight', [ .1, .1, .1 ], this.program.types.vec3)

                for (let i = 0; i < scene.lights.length; i++) {
                    this.program.setUniform(`u_lights[${ i }].surfaceToLight`, scene.lights[i].position.elements, this.program.types.vec3)

                    scene.lights[i].uniforms.list.forEach(light => {
                        this.program.setUniform(
                            `u_lights[${ i }].${ light.location }`, 
                            light.value, 
                            this.program.types[light.type])
                    })
                }
            } else if (object.type == 'line') {
                const opacity = object.material.uniforms.list.filter(uniform => uniform.location == 'opacity')[0]
                this.program.setUniform(`u_material.${ opacity.location }`, opacity.value, this.program.types[opacity.type])
            }
        }

        const offset = 0

        if (object.type == 'mesh' || object.type == 'object3') {
            const primitiveType = this.gl.TRIANGLES

            const count = object.counter / 3
            this.gl.drawArrays(primitiveType, offset, count)
        } else if (object.type == 'line') {
            const primitiveType = this.gl.LINES

            const indexType = this.gl.UNSIGNED_INT
            const count = object.counter
            this.gl.drawElements(primitiveType, count, indexType, offset)
        }

        object.onAfterRender(scene, camera, fps)
    }

    useVao(vao) {
        if (vao !== this.lastUsedVertexArray) {
            this.lastUsedVertexArray = vao
            this.gl.bindVertexArray(vao)
        }
    }
}