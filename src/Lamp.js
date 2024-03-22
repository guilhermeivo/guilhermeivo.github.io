export default class Lamp {
    constructor(configs, type) {
        this.type = type || 'point'

        this.position = configs.position || [ 0, 0, 0 ]

        this.color = configs.color || [ 1, 1, 1 ]
        this.itensity = configs.itensity || [ .5 ]
        this.ambient = configs.ambient || [ 0.05, 0.05, 0.05 ]
        this.diffuse = configs.diffuse || [ 0.8, 0.8, 0.8 ]
        this.specular = configs.specular || [ 1.0, 1.0, 1.0 ]

        this.constant = [ 1.0 ]
        this.linear = [ 0.002 ]
    }
}