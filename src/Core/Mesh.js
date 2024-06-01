import Object3 from '../Objects/Object3.js'

export default class Mesh extends Object3 {
    constructor(geometry, material, transformation = {}) {
        super(transformation)

        this.geometry = geometry
        this.material = material

        this.name = ''

        this.type = 'mesh'
    }
}