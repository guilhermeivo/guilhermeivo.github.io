import Object from "../Object.js"
import cube from "../primitives/cube.js"

export default class Cube extends Object {
    constructor(scene, transformation = {}) {
        super(scene, 'cube', transformation)

        this.rotationSpeed = .6
        this.mesh.load({
            ...cube,
            colorWithIndices: this.color()
        })
        this.init()
    }

    _init() {
        // vbo & ebo
        this.scene.shader.setAttribute('a_position', [
            new Float32Array(this.mesh.vertice),
            { data: new Uint16Array(this.mesh.verticeIndice), target: this.gl.ELEMENT_ARRAY_BUFFER },
        ])

        this.scene.shader.setAttribute('a_color', new Uint8Array(this.mesh.color), {
            type: this.gl.UNSIGNED_BYTE
        })

        this.scene.shader.setAttribute('a_texcoord', new Float32Array(this.mesh.texcoord), {
            size: 2
        })
    }

    _update(fps) { 
        this.rotation[1] += this.rotationSpeed / fps
    }

    _draw() {
        // Set the matrix
        this.scene.shader.setUniform('u_projection', this.scene.camera.projectionMatrix, this.scene.shader.types.mat4)
        this.scene.shader.setUniform('u_view', this.scene.camera.viewMatrix, this.scene.shader.types.mat4)
        this.scene.shader.setUniform('u_world', this.worldMatrix, this.scene.shader.types.mat4)
        
        this.scene.shader.setUniform('u_viewWorldPosition', this.scene.camera.location, this.scene.shader.types.vec3)
        this.scene.shader.setUniform('u_lightWorldPosition', [ 20, 30, 60 ], this.scene.shader.types.vec3)
        this.scene.shader.setUniform('u_shininess', [ 150 ], this.scene.shader.types.float)
        this.scene.shader.setUniform('u_lightColor', [1, 0.6, 0.6], this.scene.shader.types.vec3)
        this.scene.shader.setUniform('u_specularColor', [1, 0.2, 0.2], this.scene.shader.types.vec3)
    
        // Draw the cube
        const primitiveType = this.gl.TRIANGLES
        const offset = 0
        const count = this.mesh.verticeIndice.length
        const indexType = this.gl.UNSIGNED_SHORT
        this.gl.drawElements(primitiveType, count, indexType, offset)
    }

    color() {
        return [
            236, 240, 241, // Front face: white
            236, 240, 241, // 
            236, 240, 241, // 
            236, 240, 241, // 
            231, 76, 60, // Back face: red
            231, 76, 60, // 
            231, 76, 60, // 
            231, 76, 60, // 
            46, 204, 113, // Top face: green
            46, 204, 113, // 
            46, 204, 113, // 
            46, 204, 113, // 
            52, 152, 219, // Bottom face: blue
            52, 152, 219, //
            52, 152, 219, //
            52, 152, 219, //
            241, 196, 15, // Right face: yellow
            241, 196, 15, // 
            241, 196, 15, // 
            241, 196, 15, // 
            155, 89, 182, // Left face: purple
            155, 89, 182, // 
            155, 89, 182, // 
            155, 89, 182, // 
        ]
    }
}