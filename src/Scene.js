import Collection from "./Collection.js"

export default class Scene {
    constructor(gl, shaders) {
        this.gl = gl
        this.shaders = shaders
        this.shader = this.shaders[0]

        this.collection = new Collection('scene')

        this.camera = null
        this.cameras = [ ]
        this.lights = [ ]

        this.lastUsedProgram = null
        this.lastUsedVertexArray = null
        this.lastUsedTexture = null
    }

    add(value) {
        switch (value.type) {
            case 'light':
                this.addLight(value)
                break
            case 'object':
                this.addObject(value)
                break
            case 'collection':
                this.addCollection(value)
                break
            case 'camera':
                this.addCamera(value)
                break
            default:
                break
        }
    }

    addLight(light) {
        this.addObject(light)
        this.lights.push(light)
    }

    addCamera(camera) {
        this.addObject(camera)
        this.cameras.push(camera)
    }

    addObject(object) {
        object.init(this)
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
                collectionObject.draw(this)
            } else {
                if (!collectionObject.debug) {
                    collectionObject.update(fps)
                    collectionObject.draw(this)
                }
            }
        }
    }
}