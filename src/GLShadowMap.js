export default class GLShadowMap {
    constructor(gl, size) {
        this.gl = gl
        this.size = size

        this.loadDepthBuffer(this.gl, size)
        this.loadCubeMap(this.gl, size)
        const error = this.loadDepthFrameBuffer(this.gl)
    }

    loadDepthBuffer(gl, size) {
        this.depthTexture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, this.depthTexture)
        gl.texImage2D(
            gl.TEXTURE_2D,         // target
            0,                     // mip level
            gl.DEPTH_COMPONENT32F, // internal format
            size, size,            // width, height
            0,                     // border
            gl.DEPTH_COMPONENT,    // format
            gl.FLOAT,              // type
            null)                  // data
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

        this.gl.bindTexture(this.gl.TEXTURE_2D, null)
    }

    loadCubeMap(gl, size) {
        this.shadowMap = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.shadowMap)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE)
    
        for (let i = 0; i < 6; i++) {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.R32F, size, size, 0, gl.RED, gl.FLOAT, null)
        }

        this.gl.bindTexture(this.gl.TEXTURE_2D, null)
    }

    loadDepthFrameBuffer(gl) {
        this.depthFramebuffer = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffer)
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,       // target
            gl.DEPTH_ATTACHMENT,  // attachment point
            gl.TEXTURE_2D,        // texture target
            this.depthTexture,    // texture
            0)                    // mip level

        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
        
        if (status != gl.FRAMEBUFFER_COMPLETE) {
            printf("FB error, status: 0x%x\n", status)
            return false
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)

        return gl.getError()
    }
}