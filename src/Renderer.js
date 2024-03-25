export default class Renderer {
    constructor(gl) {
        this.gl = gl
    }

    render(scene, camera, fps) {
        // reset display
        let width = this.gl.canvas.clientWidth
        let height = this.gl.canvas.clientHeight
    
        if (this.gl.canvas.width != width ||
            this.gl.canvas.height != height) {
           this.gl.canvas.width = width
           this.gl.canvas.height = height
        }

        this.gl.enable(this.gl.DEPTH_TEST)
        this.gl.enable(this.gl.CULL_FACE)

        // config display
        this.gl.viewport(0, 0, width, height)

        this.gl.clearColor(0, 0, 0, 0)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT) 

        scene.activeCamera(camera)
        scene.execCollections(scene.collection, fps)
    }

    renderScissor(scene, cameras, fps) {
        // reset display
        let width = this.gl.canvas.clientWidth
        let height = this.gl.canvas.clientHeight

        if (this.gl.canvas.width != width ||
            this.gl.canvas.height != height) {
            this.gl.canvas.width = width
            this.gl.canvas.height = height
        }

        this.gl.enable(this.gl.DEPTH_TEST)
        this.gl.enable(this.gl.CULL_FACE)
        this.gl.enable(this.gl.SCISSOR_TEST)

        // config display
        const leftWidth = width / 2 | 0
        this.gl.viewport(0, 0, leftWidth, height)
        this.gl.scissor(0, 0, leftWidth, height)
        this.gl.clearColor(0, 0, 0, 0)

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT) 

        scene.activeCamera(cameras[0])
        scene.execCollections(scene.collection, fps)

        const rightWidth = width - leftWidth
        this.gl.viewport(leftWidth, 0, rightWidth, height)
        this.gl.scissor(leftWidth, 0, rightWidth, height)
        this.gl.clearColor(0.925, 0.941, 0.945, 1) 

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT) 

        scene.activeCamera(cameras[1])
        scene.execCollections(scene.collection, fps, true)
    }
}