`use strict`

export default class Mesh {
    constructor(geometry, material, transformation = {}) {
        this.geometry = geometry
        this.material = material

        this.type = 'mesh'

        this.location = transformation.location || new Vector3()
        this.rotation = transformation.rotation || new Vector3()
        this.scale = transformation.scale || new Vector3([ 1, 1, 1 ])
    }
}