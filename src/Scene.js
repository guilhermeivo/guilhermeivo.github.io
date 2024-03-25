import Collection from "./Collection.js"
import _Object from "./_Object.js"

export default class Scene {
    constructor(gl, shaders) {
        this.gl = gl
        this.shaders = shaders
        this.shader = this.shaders[0]

        this.collection = new Collection('scene')

        this.camera = null
        this.lights = [ ]

        this.lastUsedProgram = null
        this.lastUsedVertexArray = null
        this.lastUsedTexture = null
    }

    add(value) {
        switch (value.type) {
            case 'mesh':
                const object = new _Object(this, value)
                object.init()
                this.addObject(object)
                break
            case 'light':
                this.lights.push(value)
                break
            case 'object':
                this.collection.objects.push(value)
                break
            case 'camera':
                this.collection.objects.push(value)
                break
            default:
                break
        }
    }

    addMesh(mesh) {
        const object = new _Object(this, mesh)
        object.init()
        this.addObject(object)
    }

    addLight(light) {
        this.lights.push(light)
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

    execCollections(collectionObject, fps, debugMode = false) {
        if (collectionObject.constructor.name === 'Collection') {
            collectionObject.objects.forEach(collectionObject => this.execCollections(collectionObject, fps, debugMode))
        } else {
            if (debugMode) {
                collectionObject.update(fps)
                collectionObject.draw()
            } else {
                if (collectionObject.type === 'object') {
                    collectionObject.update(fps)
                    collectionObject.draw()
                }
            }
        }
    }
}