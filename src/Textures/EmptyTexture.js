import Texture from "./Texture.js"

export default class EmptyTexture extends Texture {
    constructor(gl) {
        super(gl)

        this.setEmptyTexture(gl)
    }
}