import { UniformType } from "../Core/Uniform.js"

export default class GLProgram {
    constructor(gl, vertexShaderSource, fragmentShaderSource) {
        this.gl = gl
        this.id = this.compile(vertexShaderSource, fragmentShaderSource)

        this.vaos = []
        this.uniforms = {}
    }
 
    compile(vertexShaderSource, fragmentShaderSource) {
        const vertexShader = this.compileShader(vertexShaderSource, this.gl.VERTEX_SHADER)
        const fragmentShader = this.compileShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER)

        const id = this.createProgram(vertexShader, fragmentShader)
        this.deleteShader(vertexShader)
        this.deleteShader(fragmentShader)
        return id
    }

    compileShader(source, type) {
        const shader = this.gl.createShader(type)
        this.gl.shaderSource(shader, source)
        this.gl.compileShader(shader)
        const result = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)

        if (result) return shader

        console.log(this.gl.getShaderInfoLog(shader))
        this.deleteShader(shader)
    }

    deleteShader(shader) {
        this.gl.deleteShader(shader)
    }

    // criar programa GLSL na GPU
    createProgram(vertexShader, fragmentShader) {
        const id = this.gl.createProgram()
        this.gl.attachShader(id, vertexShader) // coordenadas
        this.gl.attachShader(id, fragmentShader) // cores
        this.gl.linkProgram(id)
        const result = this.gl.getProgramParameter(id, this.gl.LINK_STATUS)

        if (result) return id

        console.log(this.gl.getProgramInfoLog(id))
        this.deleteProgram(id)
    }

    deleteProgram(program) {
        this.gl.deleteProgram(program)
    }

    attributeBind(attribute, target) {
        this.gl.bindBuffer(target, this.gl.createBuffer())
        this.gl.bufferData(target, attribute.data, this.gl.STATIC_DRAW)
    }

    // dados retirados de buffers
    setAttribute(attributeName, attribute, indice) {
        const locationAttribute = this.gl.getAttribLocation(this.id, `a_${ attributeName }`)

        if (locationAttribute < 0) {
            return
        }

        this.attributeBind(attribute, this.gl.ARRAY_BUFFER)
        if (indice) this.attributeBind(indice, this.gl.ELEMENT_ARRAY_BUFFER)

        this.gl.vertexAttribPointer(
            locationAttribute, 
            attribute.size, 
            attribute.type, 
            attribute.normalize, 
            attribute.stride, 
            attribute.offset)
            
        this.gl.enableVertexAttribArray(locationAttribute)
    }

    
    // valores que permanecem iguais
    setUniform(uniformName, data, dataType) {

        // procurar posição uniform
        // TODO: não é necessario todo frame procurar o location
        //const uniformLocation = this.gl.getUniformLocation(this.id, uniformName)
        const uniformLocation = this.uniforms[uniformName]

        const types = {
            [UniformType.FLOAT]: () => this.gl.uniform1fv(uniformLocation, data), // for float or float array
            [UniformType.VEC2]: () => this.gl.uniform2fv(uniformLocation, data), // for vec2 or vec2 array
            [UniformType.VEC3]: () => this.gl.uniform3fv(uniformLocation, data), // for vec3 or vec3 array
            [UniformType.VEC4]: () => this.gl.uniform4fv(uniformLocation, data), // for vec4 or vec4 array
            [UniformType.MAT2]: () => this.gl.uniformMatrix2fv(uniformLocation, false, data), // for mat2 or mat2 array
            [UniformType.MAT3]: () => this.gl.uniformMatrix3fv(uniformLocation, false, data), // for mat3 or mat3 array
            [UniformType.MAT4]: () => this.gl.uniformMatrix4fv(uniformLocation, false, data), // for mat4 or mat4 array
            [UniformType.INT]: () => this.gl.uniform1iv(uniformLocation, data), // for int or int array
            [UniformType.IVEC2]: () => this.gl.uniform2iv(uniformLocation, data),  // for ivec2 or ivec2 array
            [UniformType.IVEC3]: () => this.gl.uniform3iv(uniformLocation, data), // for ivec3 or ivec3 array
            [UniformType.IVEC4]: () => this.gl.uniform4iv(uniformLocation, data), // for ivec4 or ivec4 array
            [UniformType.UINT]: () => this.gl.uniform1uv(uniformLocation, data), // for uint or uint array
            [UniformType.UVEC2]: () => this.gl.uniform2uv(uniformLocation, data), // for uvec2 or uvec2 array
            [UniformType.UVEC3]: () => this.gl.uniform3uv(uniformLocation, data), // for uvec3 or uvec3 array
            [UniformType.UVEC4]: () => this.gl.uniform4uv(uniformLocation, data), // for uvec4 or uvec4 array
            // for sampler2D, sampler3D, samplerCube, samplerCubeShadow, sampler2DShadow,
            // sampler2DArray, sampler2DArrayShadow
            [UniformType.SAMPLER]: () => this.gl.uniform1i(uniformLocation, data)
        }

        if (types[dataType]) types[dataType]()
    }

    setUniformLocation(uniformName) {
        this.uniforms[uniformName] = this.gl.getUniformLocation(this.id, uniformName)
    }

    existVao(id) {
        return this.vaos.filter(vao => vao.id == id).length == 0 ? false : true
    }

    getVao(id) {
        if (!this.existVao(id)) return -1
        else return this.vaos.filter(vao => vao.id == id)[0].value
    }

    setVao(id, value) {
        this.vaos.push({ id: id, value: value })
    }
}