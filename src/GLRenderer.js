import GLTexture from "./Textures/GLTexture.js"
import GLProgram from "./GLProgram.js"

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

        this.width = this.gl.canvas.width
        this.height = this.gl.canvas.height

        this.lastUsedVertexArray = null
        this.lastUsedTextureId = null

        this.onResizeHandler = this.onResizeHandler.bind(this)
        window.addEventListener('resize', this.onResizeHandler)
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

    render(scene, camera, fps) {
        if (!this.isInitialized) {
            this.gl.enable(this.gl.DEPTH_TEST)
            this.gl.enable(this.gl.CULL_FACE)
            this.gl.disable(this.gl.SCISSOR_TEST)
            this.isInitialized = true
        }

        this.gl.viewport(0, 0, this.width, this.height)

        this.gl.clearColor(0, 0, 0, 0)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

        camera.aspect = this.width / this.height
        this.renderScene(scene, camera, fps)
    }

    renderScissor(scene, cameras, fps) {
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
                    object.material.samplers[key].id = index
                    object.material.samplers[key].setEmptyTexture(this.gl)
                }
            })

            Object.keys(object.material.samplers).forEach((key, index) => {
                const currentSampler = object.material.samplers[key]
                
                this.useTexture(this.gl.TEXTURE0 + currentSampler.id, currentSampler.data)
                
                this.program.setUniform(`${ key }`, currentSampler.id, this.program.types.sampler)
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

        Object.keys(object.material.samplers).forEach((key, index) => {
            const currentSampler = object.material.samplers[key]
                
            this.useTexture(this.gl.TEXTURE0 + currentSampler.id, currentSampler.data)
            this.program.setUniform(`${ key }`, currentSampler.id, this.program.types.sampler)
        })

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

        let primitiveType = this.gl.TRIANGLES
        const offset = 0

        if (object.type == 'mesh') {
            primitiveType = this.gl.TRIANGLES

            const count = object.counter / 3
            this.gl.drawArrays(primitiveType, offset, count)
        }
        else if (object.type == 'line') {
            primitiveType = this.gl.LINES

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

    useTexture(id, data) {
        if (id !== this.lastUsedTextureId) {
            this.lastUsedVertexArray = id

            this.gl.activeTexture(id)
            this.gl.bindTexture(this.gl.TEXTURE_2D, data)
        }
    }
}