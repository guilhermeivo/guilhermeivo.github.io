import Texture from "./Texture.js"

`use strict`

export default class EmptyTexture extends Texture {
    constructor(gl) {
        super(gl)

        this.setEmptyTexture(gl)
    }
}