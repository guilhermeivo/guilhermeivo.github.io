`use strict`

export default class Texture {
    constructor(gl, textureTarget = gl.TEXTURE_2D) {
        this.id = 0
        this.data = null
        this.target = textureTarget
        this.data = gl.createTexture()
    }

    setImageTexture(gl, image) {
        this.bind(gl, this.id)

        this.createTextureWithImage(gl, image)

        gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(this.target, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
        gl.texParameteri(this.target, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.generateMipmap(this.target)

        return this.data
    }

    setEmptyTexture(gl) {
        this.bind(gl, this.id)
        this.createTextureWithPixels(gl, 1, 1, new Uint8Array([255, 255, 255, 255]))

        return this.data
    }

    setTexture(gl) {
        this.bind(gl, this.id)
        this.createTextureWithPixels(gl, 1, 1, new Uint8Array([255, 255, 255, 255]))

        return this.data
    }

    setErrorTexture(gl) {
        this.bind(gl, this.id)
            
        const alignment = 1
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, alignment)
        // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
        this.createTextureWithPixels(gl,
            2, 2, 
            new Uint8Array([
                128,  64,
                0, 192
            ]),
            gl.R8, gl.RED)

        gl.texParameteri(this.target, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(this.target, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        
        return this.data
    }

    createTextureWithPixels(gl,
        width, height, pixels, 
        internalformat = gl.RGBA, format = gl.RGBA, type = gl.UNSIGNED_BYTE) {
        return gl.texImage2D(
            this.target,             // target
            0,                       // level
            internalformat,          // internalformat
            width,                   // width
            height,                  // height
            0,                       // border
            format,                  // format
            type,                    // type
            pixels)                  // pixels
    }

    createTextureWithImage(gl,
        image, 
        internalformat = gl.RGBA, format = gl.RGBA, type = gl.UNSIGNED_BYTE) {
        return gl.texImage2D(
            this.target, 
            0, 
            internalformat, 
            format, 
            type, 
            image)
    }

    bind(gl, textureUnit) {
        gl.activeTexture(gl.TEXTURE0 + textureUnit)
        gl.bindTexture(gl.TEXTURE_2D, this.data)
    }

    unbind(gl) {
        gl.bindTexture(this.target, null)
    }
}