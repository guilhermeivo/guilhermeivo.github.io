export default class Texture {
    constructor(gl, image = null) {
        this.gl = gl
        this.data = null
        this.image = null
        this.target = this.gl.TEXTURE_2D

        if (image) {
            this.setTexture(image)
        }
    }

    setTexture(image) {
        if (!image) return this.setEmptyTexture()
        this.image = image
        
        // Create a texture.
        this.data = this.gl.createTexture()
        this.gl.bindTexture(this.target, this.data)
        
        // Fill the texture with a 1x1 blue pixel (pre_load)
        this.createTextureWithPixels(1, 1, new Uint8Array([255, 255, 255, 255]))

        // Asynchronously load an image
        this.image.addEventListener('load', () => {
            // Now that the image has loaded make copy it to the texture.
            this.gl.bindTexture(this.target, this.data)
            
            this.createTextureWithImage(this.image)

            this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
            this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)
            this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR)
            this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR)
            this.gl.generateMipmap(this.target)
        })

        // error_load
        this.image.addEventListener('error', () => {
            this.gl.bindTexture(this.target, texture)
            
            const alignment = 1
            this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, alignment)
            // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
            this.createTextureWithPixels(
                2, 2, 
                new Uint8Array([
                    128,  64,
                    0, 192
                ]),
                this.gl.R8, this.gl.RED)
 
                this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST)
                this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
                this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
                this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)
        })

        return this.data
    }

    createTextureWithPixels(
        width, height, pixels, 
        internalformat = this.gl.RGBA, format = this.gl.RGBA, type = this.gl.UNSIGNED_BYTE) {
        return this.gl.texImage2D(
            this.target,      // target
            0,                       // level
            internalformat,          // internalformat
            width,                   // width
            height,                  // height
            0,                       // border
            format,                  // format
            type,                    // type
            pixels)                  // pixels
    }

    createTextureWithImage(
        image, 
        internalformat = this.gl.RGBA, format = this.gl.RGBA, type = this.gl.UNSIGNED_BYTE) {
        return this.gl.texImage2D(
            this.target, 
            0, 
            internalformat, 
            format, 
            type, 
            image)
    }

    setEmptyTexture() {
        this.data = this.gl.createTexture()
        this.gl.bindTexture(this.target, this.data)
        this.createTextureWithPixels(1, 1, new Uint8Array([255, 255, 255, 255]))

        return this.data
    }
}