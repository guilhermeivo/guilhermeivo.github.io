export default class Program {
    constructor(gl, vertexShaderSource, fragmentShaderSource) {
        this.gl = gl
        this.program = this.compile(vertexShaderSource, fragmentShaderSource)
        this.types = {
            float: 'float',
            vec2: 'vec2',
            vec3: 'vec3',
            vec4: 'vec4',
            mat2: 'mat2',
            mat3: 'mat3',
            mat4: 'mat4',
            int: 'int',
            ivec2: 'ivec2',
            ivec3: 'ivec3',
            ivec4: 'ivec4',
            uint: 'uint',
            uvec2: 'uvec2',
            uvec3: 'uvec3',
            uvec4: 'uvec4'
        }

        this.defaultConfigAttribute = {
            numComponents: 3, // VEC3
            type: this.gl.FLOAT,
            normalize: true,
            offset: 0,
            stride: 0,
        }

        this.buffers = []
    }
 
    compile(vertexShaderSource, fragmentShaderSource) {
        const vertexShader = this.compileShader(vertexShaderSource, this.gl.VERTEX_SHADER)
        const fragmentShader = this.compileShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER)

        const program = this.createProgram(vertexShader, fragmentShader)
        return program
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
        const program = this.gl.createProgram()
        this.gl.attachShader(program, vertexShader) // coordenadas
        this.gl.attachShader(program, fragmentShader) // cores
        this.gl.linkProgram(program)
        const result = this.gl.getProgramParameter(program, this.gl.LINK_STATUS)

        if (result) return program

        console.log(this.gl.getProgramInfoLog(program))
        this.deleteProgram(program)
    }

    deleteProgram(program) {
        this.gl.deleteProgram(program)
    }

    createBuffers() {
        const buffer = this.gl.createBuffer()
        this.buffers.push(buffer)
        return buffer
    }

    deleteBuffers() {
        this.buffers.forEach(buffer => {
            this.gl.deleteBuffer(buffer)
        })
    }

    // dados retirados de buffers
    setAttribute(attributeName, data, config = {}) {
        const locationAttribute = this.gl.getAttribLocation(this.program, attributeName) 
        
        if (!Array.isArray(data)) data = [data]

        data.forEach(element => {
            const buffer = this.createBuffers()

            let _data = element.hasOwnProperty('data') ? element['data'] : element
            let _target = element.hasOwnProperty('target') ? element['target'] : this.gl.ARRAY_BUFFER

            this.gl.bindBuffer(_target, buffer)  
            this.gl.bufferData(_target, _data, this.gl.STATIC_DRAW)
        })
        
        this.gl.vertexAttribPointer(
            locationAttribute, 
            config.size || this.defaultConfigAttribute.numComponents, 
            config.type || this.defaultConfigAttribute.type, 
            config.normalize || this.defaultConfigAttribute.normalize, 
            config.stride || this.defaultConfigAttribute.stride, 
            config.offset || this.defaultConfigAttribute.offset)
            
        this.gl.enableVertexAttribArray(locationAttribute)
    }

    // valores que permanecem iguais
    setUniform(uniformName, data, dataType) {
        // procurar posição uniform
        const uniformLocation = this.gl.getUniformLocation(this.program, uniformName)

        const types = {
            'float': () => this.gl.uniform1fv(uniformLocation, data), // for float or float array
            'vec2': () => this.gl.uniform2fv(uniformLocation, data), // for vec2 or vec2 array
            'vec3': () => this.gl.uniform3fv(uniformLocation, data), // for vec3 or vec3 array
            'vec4': () => this.gl.uniform4fv(uniformLocation, data), // for vec4 or vec4 array
            'mat2': () => this.gl.uniformMatrix2fv(uniformLocation, false, data), // for mat2 or mat2 array
            'mat3': () => this.gl.uniformMatrix3fv(uniformLocation, false, data), // for mat3 or mat3 array
            'mat4': () => this.gl.uniformMatrix4fv(uniformLocation, false, data), // for mat4 or mat4 array
            'int': () => this.gl.uniform1iv(uniformLocation, data), // for int or int array
            'ivec2': () => this.gl.uniform2iv(uniformLocation, data),  // for ivec2 or ivec2 array
            'ivec3': () => this.gl.uniform3iv(uniformLocation, data), // for ivec3 or ivec3 array
            'ivec4': () => this.gl.uniform4iv(uniformLocation, data), // for ivec4 or ivec4 array
            'uint': () => this.gl.uniform1uv(uniformLocation, data), // for uint or uint array
            'uvec2': () => this.gl.uniform2uv(uniformLocation, data), // for uvec2 or uvec2 array
            'uvec3': () => this.gl.uniform3uv(uniformLocation, data), // for uvec3 or uvec3 array
            'uvec4': () => this.gl.uniform4uv(uniformLocation, data), // for uvec4 or uvec4 array
            // for sampler2D, sampler3D, samplerCube, samplerCubeShadow, sampler2DShadow,
            // sampler2DArray, sampler2DArrayShadow
            'sampler': () => this.gl.uniform1i(uniformLocation, data)
        }

        if (types[dataType]) types[dataType]()
    }
}