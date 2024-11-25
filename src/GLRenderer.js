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

        this.width = this.gl.canvas.width
        this.height = this.gl.canvas.height

        this.lastUsedVertexArray = null

        this.onResizeHandler = this.onResizeHandler.bind(this)
        window.addEventListener('resize', this.onResizeHandler)

        // planar projection mapping
        const settings = {
            posX: 2.5,
            posY: 4.8,
            posZ: 4.3,
            targetX: 2.5,
            targetY: 0,
            targetZ: 3.5,
            projWidth: 1,
            projHeight: 1,
            perspective: true,
            fieldOfView: 45,
        }

        this.textureWorldMatrix = new Matrix4()
        this.textureMatrix = new Matrix4()
        this.mat = new Matrix4()
        this.textureProjectionMatrix = new Matrix4()

        this.textureWorldMatrix.lookAt(
            [settings.posX, settings.posY, settings.posZ],          // position
            [settings.targetX, settings.targetY, settings.targetZ], // target
            [0, 1, 0],                                              // up
        )

        settings.perspective
            ? this.textureProjectionMatrix.perspective(
                Math.degreeToRadians(settings.fieldOfView),
                settings.projWidth / settings.projHeight,
                0.1,  // near
                200)  // far
            : this.textureProjectionMatrix.orthographic(
                -settings.projWidth / 2,   // left
                settings.projWidth / 2,   // right
                -settings.projHeight / 2,  // bottom
                settings.projHeight / 2,  // top
                0.1,                      // near
                200)                      // far

        this.textureMatrix.translate(new Vector3(0.5, 0.5, 0.5))
        this.textureMatrix.scale(new Vector3(0.5, 0.5, 0.5))
        this.textureMatrix.multiply(this.textureProjectionMatrix)

        this.textureWorldMatrix.invert(this.textureWorldMatrix)
        this.textureMatrix.multiply(this.textureWorldMatrix)

        this.textureWorldMatrix.invert(this.textureWorldMatrix)
        this.textureProjectionMatrix.invert(this.textureProjectionMatrix)
        this.mat.multiply(this.textureWorldMatrix)
        this.mat.multiply(this.textureProjectionMatrix)
        this.projectionHelper = new ProjectionHelper()
        this.projectionHelper.updateWorld(this.mat)

        function loadImageTexture(gl, url) {
            const texture = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_2D, texture)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                          new Uint8Array([0, 0, 255, 255]))
            const image = new Image()
            image.src = url
            image.addEventListener('load', function() {
              gl.bindTexture(gl.TEXTURE_2D, texture)
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
              gl.generateMipmap(gl.TEXTURE_2D)
            })
            return texture
          }
           
        this.imageTexture = loadImageTexture(this.gl, 'resources/f-texture.png');
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

        camera.aspect = this.width / this.height

        this.gl.viewport(0, 0, this.width, this.height)

        this.gl.clearColor(0, 0, 0, 0)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

        this.renderScene(scene, camera, fps, debugMode)
        if (this.projectionHelper.id == 0) {
            scene.add(this.projectionHelper)
        }
    }

    renderScissor(scene, cameras, fps, pickingMode = false) {
        this.pickingMode = pickingMode
        if (!this.isInitialized) {
            this.gl.enable(this.gl.DEPTH_TEST)
            this.gl.enable(this.gl.CULL_FACE)
            this.gl.enable(this.gl.SCISSOR_TEST)
            this.isInitialized = true
        }

        // config display
        const leftWidth = this.width / 2 | 0
        this.gl.viewport(0, 0, leftWidth, this.height)
        this.gl.scissor(0, 0, leftWidth, this.height)
        this.gl.clearColor(0, 0, 0, 0)

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT) 

        cameras[0].aspect = (this.width / 2) / this.height
        this.renderScene(scene, cameras[0], fps)

        const rightWidth = this.width - leftWidth
        this.gl.viewport(leftWidth, 0, rightWidth, this.height)
        this.gl.scissor(leftWidth, 0, rightWidth, this.height)
        this.gl.clearColor(0.925, 0.941, 0.945, 1) 

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT) 

        cameras[1].aspect = (this.width / 2) / this.height
        this.renderScene(scene, cameras[1], fps, true)
    }

    renderScene(scene, camera, fps, debugMode = false) {
        const objects = scene.children

        this.renderObjects(objects, scene, camera, fps, debugMode)
    }

    renderObjects(objects, scene, camera, fps, debugMode) {
        objects.forEach(object => {
            this.renderObject(object, scene, camera, fps, debugMode)
        })
    }

    renderObject(object, scene, camera, fps, debugMode) {
        if (object.type == 'collection') {
            this.renderObjects(object.children, scene, camera, fps, debugMode)
        }

        if (!debugMode && object.debug) return

        this.setProgram(this.object3ProgramId)
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
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.imageTexture)
        this.program.setUniform('projectedTexture', unit, this.program.types.sampler)
        
        this.program.setUniform('u_id', [
            ((object.id >>  0) & 0xFF) / 0xFF,
            ((object.id >>  8) & 0xFF) / 0xFF,
            ((object.id >> 16) & 0xFF) / 0xFF,
            ((object.id >> 24) & 0xFF) / 0xFF,
        ], this.program.types.vec4)

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