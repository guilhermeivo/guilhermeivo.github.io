import Collection from "./Collection.js"
import Lamp from "./Lamp.js"
import _Object from "./_Object.js"

export default class Scene {
    constructor(gl, shaders) {
        this.gl = gl
        this.shaders = shaders
        this.shader = this.shaders[0]

        this.collection = new Collection('scene')

        this.camera = null
        this.lamp = new Lamp({
            position: [ 0, 0, 600 ]
        })

        this.lastUsedProgram = null
        this.lastUsedVertexArray = null
        this.lastUsedTexture = null
    }

    addMesh(mesh) {
        const object = new _Object(this, mesh)
        object.init()
        this.addObject(object)
    }

    addObject(object) {
        this.collection.objects.push(object)
    }
    
    addCollection(collection) {
        this.collection.objects.push(collection)
    }

    activeCamera(camera) {
        this.camera = camera
    }
    
    activeShaders(index) {
        this.shader = this.shaders[index]
    }

    deleteShaders() {
        this.shaders.forEach(shader => {
            shader.deleteBuffers()
            shader.deleteTextures()
        })
    }

    useProgram(program) {
        if (program !== this.lastUsedProgramInfo) {
            this.lastUsedProgramInfo = program
            this.gl.useProgram(program)
        }
    }

    useVao(vao) {
        if (vao !== this.lastUsedVertexArray) {
            this.lastUsedVertexArray = vao
            this.gl.bindVertexArray(vao)
        }
    }

    useTexture(texture, target = this.gl.TEXTURE_2D) {
        if (texture !== this.lastUsedTexture) {
            this.lastUsedTexture = texture
            this.gl.bindTexture(target, texture)
        }
    }

    execCollections(collectionObject, fps) {
        if (collectionObject.constructor.name === 'Collection') {
            collectionObject.objects.forEach(collectionObject => this.execCollections(collectionObject, fps))
        } else {
            collectionObject.update(fps)
            collectionObject.draw()
        }
    }
}