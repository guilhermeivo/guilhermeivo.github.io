import Object from "../Object.js"

export default class Letter extends Object {
    constructor(scene, transformation = {}) {
        super(scene, 'letter', transformation)

        this.rotationSpeed = 1.2
        this.mesh.load({
            verticeWithIndices: this.vertice(),
            //colorWithIndices: this.color(),
            //texcoordWithIndices: this.texture(),
            normal: this.normal()
        })
        this.init()
    }
    
    _init() {
        this.scene.shader.setAttribute('a_position', new Float32Array(this.mesh.vertice))
        this.scene.shader.setAttribute('a_normal', new Float32Array(this.mesh.normal))
        this.scene.shader.setAttribute('a_texcoord', new Float32Array(this.mesh.texcoord), {
            size: 2
        })

        const image = new Image()
        image.src = '../resources/texture.png'
        this.mesh.texture = this.scene.shader.setTexture(image)
    }

    _update(fps) { 
        this.rotation[1] += this.rotationSpeed / fps
    }

    _draw() {
        this.scene.shader.setUniform('u_projection', this.scene.camera.projectionMatrix, this.scene.shader.types.mat4)
        this.scene.shader.setUniform('u_view', this.scene.camera.viewMatrix, this.scene.shader.types.mat4)
        this.scene.shader.setUniform('u_world', this.worldMatrix, this.scene.shader.types.mat4)
        
        this.scene.shader.setUniform('u_viewWorldPosition', this.scene.camera.location, this.scene.shader.types.vec3)
        this.scene.shader.setUniform('u_lightWorldPosition', [ 80, 120, 240 ], this.scene.shader.types.vec3)
        this.scene.shader.setUniform('u_shininess', [ 75 ], this.scene.shader.types.float)
        this.scene.shader.setUniform('u_lightColor', [ 1, 1, 1 ], this.scene.shader.types.vec3)
        this.scene.shader.setUniform('u_specularColor', [ 1, 1, 1], this.scene.shader.types.vec3)
    
        // Draw the letter
        const primitiveType = this.gl.TRIANGLES
        const offset = 0
        const count = 16 * 6
        this.gl.drawArrays(primitiveType, offset, count)
    }

    vertice() {
        return [
            // left column front
            0,   0,  0,
            0, 150,  0,
            30,   0,  0,
            0, 150,  0,
            30, 150,  0,
            30,   0,  0,

            // top rung front
            30,   0,  0,
            30,  30,  0,
            100,   0,  0,
            30,  30,  0,
            100,  30,  0,
            100,   0,  0,

            // middle rung front
            30,  60,  0,
            30,  90,  0,
            67,  60,  0,
            30,  90,  0,
            67,  90,  0,
            67,  60,  0,

            // left column back
                0,   0,  30,
            30,   0,  30,
                0, 150,  30,
                0, 150,  30,
            30,   0,  30,
            30, 150,  30,

            // top rung back
            30,   0,  30,
            100,   0,  30,
            30,  30,  30,
            30,  30,  30,
            100,   0,  30,
            100,  30,  30,

            // middle rung back
            30,  60,  30,
            67,  60,  30,
            30,  90,  30,
            30,  90,  30,
            67,  60,  30,
            67,  90,  30,

            // top
                0,   0,   0,
            100,   0,   0,
            100,   0,  30,
                0,   0,   0,
            100,   0,  30,
                0,   0,  30,

            // top rung right
            100,   0,   0,
            100,  30,   0,
            100,  30,  30,
            100,   0,   0,
            100,  30,  30,
            100,   0,  30,

            // under top rung
            30,   30,   0,
            30,   30,  30,
            100,  30,  30,
            30,   30,   0,
            100,  30,  30,
            100,  30,   0,

            // between top rung and middle
            30,   30,   0,
            30,   60,  30,
            30,   30,  30,
            30,   30,   0,
            30,   60,   0,
            30,   60,  30,

            // top of middle rung
            30,   60,   0,
            67,   60,  30,
            30,   60,  30,
            30,   60,   0,
            67,   60,   0,
            67,   60,  30,

            // right of middle rung
            67,   60,   0,
            67,   90,  30,
            67,   60,  30,
            67,   60,   0,
            67,   90,   0,
            67,   90,  30,

            // bottom of middle rung.
            30,   90,   0,
            30,   90,  30,
            67,   90,  30,
            30,   90,   0,
            67,   90,  30,
            67,   90,   0,

            // right of bottom
            30,   90,   0,
            30,  150,  30,
            30,   90,  30,
            30,   90,   0,
            30,  150,   0,
            30,  150,  30,

            // bottom
            0,   150,   0,
            0,   150,  30,
            30,  150,  30,
            0,   150,   0,
            30,  150,  30,
            30,  150,   0,

            // left side
            0,   0,   0,
            0,   0,  30,
            0, 150,  30,
            0,   0,   0,
            0, 150,  30,
            0, 150,   0,
        ]
    }

    color() {
        return [
            // left column front
            200,  0, 120,
            200,  0, 120,
            200,  0, 120,
            200,  0, 120,
            200,  0, 120,
            200,  0, 120,

            // top rung front
            200,  0, 120,
            200,  0, 120,
            200,  0, 120,
            200,  0, 120,
            200,  0, 120,
            200,  0, 120,

            // middle rung front
            200,  0, 120,
            200,  0, 120,
            200,  0, 120,
            200,  0, 120,
            200,  0, 120,
            200,  0, 120,

            // left column back
            80, 0, 200,
            80, 0, 200,
            80, 0, 200,
            80, 0, 200,
            80, 0, 200,
            80, 0, 200,

            // top rung back
            80, 0, 200,
            80, 0, 200,
            80, 0, 200,
            80, 0, 200,
            80, 0, 200,
            80, 0, 200,

            // middle rung back
            80, 0, 200,
            80, 0, 200,
            80, 0, 200,
            80, 0, 200,
            80, 0, 200,
            80, 0, 200,

            // top
            0, 200, 210,
            0, 200, 210,
            0, 200, 210,
            0, 200, 210,
            0, 200, 210,
            0, 200, 210,

            // top rung right
            200, 200, 0,
            200, 200, 0,
            200, 200, 0,
            200, 200, 0,
            200, 200, 0,
            200, 200, 0,

            // under top rung
            210, 100, 0,
            210, 100, 0,
            210, 100, 0,
            210, 100, 0,
            210, 100, 0,
            210, 100, 0,

            // between top rung and middle
            210, 160, 0,
            210, 160, 0,
            210, 160, 0,
            210, 160, 0,
            210, 160, 0,
            210, 160, 0,

            // top of middle rung
            0, 180, 210,
            0, 180, 210,
            0, 180, 210,
            0, 180, 210,
            0, 180, 210,
            0, 180, 210,

            // right of middle rung
            100, 0, 210,
            100, 0, 210,
            100, 0, 210,
            100, 0, 210,
            100, 0, 210,
            100, 0, 210,

            // bottom of middle rung.
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,

            // right of bottom
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,

            // bottom
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,

            // left side
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
        ]
    }

    texture() {
        /*
         * texcoordX = pixelCoordX / (width  - 1)
         * texcoordY = pixelCoordY / (height - 1)
         */
        return [
            // left column front
             38 / 255,  44 / 255,
             38 / 255, 223 / 255,
            113 / 255,  44 / 255,
             38 / 255, 223 / 255,
            113 / 255, 223 / 255,
            113 / 255,  44 / 255,
    
            // top rung front
            113 / 255, 44 / 255,
            113 / 255, 85 / 255,
            218 / 255, 44 / 255,
            113 / 255, 85 / 255,
            218 / 255, 85 / 255,
            218 / 255, 44 / 255,
    
            // middle rung front
            113 / 255, 112 / 255,
            113 / 255, 151 / 255,
            203 / 255, 112 / 255,
            113 / 255, 151 / 255,
            203 / 255, 151 / 255,
            203 / 255, 112 / 255,
    
            // left column back
             38 / 255,  44 / 255,
            113 / 255,  44 / 255,
             38 / 255, 223 / 255,
             38 / 255, 223 / 255,
            113 / 255,  44 / 255,
            113 / 255, 223 / 255,
    
            // top rung back
            113 / 255, 44 / 255,
            218 / 255, 44 / 255,
            113 / 255, 85 / 255,
            113 / 255, 85 / 255,
            218 / 255, 44 / 255,
            218 / 255, 85 / 255,
    
            // middle rung back
            113 / 255, 112 / 255,
            203 / 255, 112 / 255,
            113 / 255, 151 / 255,
            113 / 255, 151 / 255,
            203 / 255, 112 / 255,
            203 / 255, 151 / 255,
    
            // top
            0, 0,
            38 / 255, 0,
            38 / 255, 1,
            0, 0,
            38 / 255, 1,
            0, 1,
    
            // top rung right
            0, 0,
            30 / 255, 0,
            30 / 255, 1,
            0, 0,
            30 / 255, 1,
            0, 1,
    
            // under top rung
            0, 0,
            0, 1,
            30 / 255, 1,
            0, 0,
            30 / 255, 1,
            30 / 255, 0,
    
            // between top rung and middle
            0, 0,
            30 / 255, 1,
            0, 1,
            0, 0,
            30 / 255, 0,
            30 / 255, 1,
    
            // top of middle rung
            0, 0,
            30 / 255, 1,
            0, 1,
            0, 0,
            30 / 255, 0,
            30 / 255, 1,
    
            // right of middle rung
            0, 0,
            30 / 255, 1,
            0, 1,
            0, 0,
            30 / 255, 0,
            30 / 255, 1,
    
            // bottom of middle rung.
            0, 0,
            0, 1,
            30 / 255, 1,
            0, 0,
            30 / 255, 1,
            30 / 255, 0,
    
            // right of bottom
            0, 0,
            30 / 255, 1,
            0, 1,
            0, 0,
            30 / 255, 0,
            30 / 255, 1,
    
            // bottom
            0, 0,
            0, 1,
            30 / 255, 1,
            0, 0,
            30 / 255, 1,
            30 / 255, 0,
    
            // left side
            0, 0,
            0, 1,
            30 / 255, 1,
            0, 0,
            30 / 255, 1,
            30 / 255, 0,
        ]
    }

    normal() {
        return [
            // left column front
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // top rung front
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // middle rung front
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // left column back
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            // top rung back
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            // middle rung back
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            // top
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            // top rung right
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // under top rung
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            // between top rung and middle
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // top of middle rung
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            // right of middle rung
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // bottom of middle rung.
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            // right of bottom
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // bottom
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            // left side
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
        ]
    }
}