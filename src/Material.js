export default class Material {
    constructor(config = {}) {
        this.shininess = config.shininess || [ 32 ]
        this.ambient = config.ambient || [ 0, 0, 0 ]
        this.diffuse = config.diffuse || [ 1, 1, 1 ]
        this.specular = config.specular || [ 1, 1, 1 ]
        this.emissive = config.emissive || [ 0, 0, 0 ]
        this.opticalDensity = config.opticalDensity || [ 1.45 ]
        this.opacity = config.opacity || [ 1 ]
        this.illum = config.illum || [ 2 ]

        this.diffuseMap = null
        this.specularMap = null
        this.normalMap = null
        this.opacityMap = null
    }
}