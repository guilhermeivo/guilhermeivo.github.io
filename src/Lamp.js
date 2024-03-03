export default class Lamp {
    constructor(transformation) {
        this.position = transformation.position || [ 0, 0, 0 ]

        this.color = [ 1, 1, 1 ]
        this.itensity = [ .5 ]
    }
}