export default class GLInfo {
    constructor() {}

    static getRenderer(gl) {
        const paramRenderer = gl.getParameter(gl.RENDERER)
        const matches = paramRenderer.match(/((NVIDIA|AMD|Intel)[^\d]*[^\s]+)/)

        return matches && matches[0]
    }

    static getVendor(gl) {
        const paramVendor = gl.getParameter(gl.VENDOR)
        return paramVendor
    }
}