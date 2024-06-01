import Matrix4 from '../Math/Matrix4.js'
import Vector3 from '../Math/Vector3.js'

export default class Object3 {
    constructor(transformation = {}) {
        this.type = 'object3'

        this.parent = null
        this.children = []

        this.position = transformation.position || new Vector3()
        this.rotation = transformation.rotation || new Vector3()
        this.scale = transformation.scale || new Vector3(1, 1, 1)

        this.worldMatrix = new Matrix4()
    }

    add(object) {
        if (object === this) return

        this.children.push(object)
    }

    onBeforeRender(scene, camera, fps, callback = null) {
        this.worldMatrix.identity()

        const usedValues = [
            !this.parent ? this.position : this.parent.position,
            !this.parent ? this.rotation : this.parent.rotation,
            !this.parent ? this.scale : this.parent.scale,
        ]

        // model or world matrix = translation * rotation * scale
        this.worldMatrix.identity()
        this.worldMatrix.translate(usedValues[0])
        this.worldMatrix.rotate(usedValues[1])
        this.worldMatrix.scale(usedValues[2])

        if (callback) callback(scene, camera, fps)
        else if (this._onBeforeRender) this._onBeforeRender(scene, camera, fps)
    }

    onAfterRender(scene, camera, fps) { }
}