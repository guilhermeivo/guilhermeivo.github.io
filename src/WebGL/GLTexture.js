window.maxId = 0

export default class GLTexture {
    constructor(gl, textureTarget = gl.TEXTURE_2D) {
        this.name = ''
        this.id = -1
        this.target = textureTarget
        this.data = gl.createTexture()
    }

    setId(id = window.maxId) {
        this.id = id;
        if (id >= window.maxId) window.maxId = id + 1
    }

    setImageTexture(gl, image) {
        this.bind(gl)

        this.createTextureWithImage(gl, image)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
        gl.generateMipmap(this.target)

        return this.data
    }

    setEmptyTexture(gl) {
        this.bind(gl)
        this.createTextureWithPixels(gl, 1, 1, new Uint8Array([255, 255, 255, 255]))

        return this.data
    }

    setTexture(gl) {
        this.bind(gl)
        this.createTextureWithPixels(gl, 1, 1, new Uint8Array([255, 255, 255, 255]))

        return this.data
    }

    setErrorTexture(gl) {
        this.bind(gl)
            
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

    bind(gl) {
        gl.bindTexture(this.target, this.data)
    }
}