export const readPixel = (gl, x, y, width, height) => {
    const buffer = new Uint8Array(width * height * 4)
    gl.readPixels(
        x,                // x
        y,                // y
        width,            // width
        height,           // height
        gl.RGBA,          // format
        gl.UNSIGNED_BYTE, // type
        buffer)           // typed array to hold result
    return buffer
}