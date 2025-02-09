import fs from 'node:fs'

import Wasm from "../../src/Wasm.js"
import { float } from "../../src/types.js"

import math from "../../src/Math/old/math.js"

/// BEGIN WASM
const wasmBuffer = fs.readFileSync('main.wasm')
const wasm = new Wasm()

async function wasmFunction() {
    return new Promise((resolve, reject) => {
        wasm.exports._start()
        const ptr = wasm.exports.some_func()
        const array = new float(wasm.memory, ptr, 16)
        console.log(array)
        wasm.exports._exit()

        resolve()
    })
}

WebAssembly.instantiate(wasmBuffer, wasm.importObject()).then(
    async object => {
        wasm.exports = object.instance.exports
        wasm.memory = object.instance.exports.memory.buffer

        console.time("wasm")
        await wasmFunction()
        console.timeEnd("wasm")
    })
/// END WASM

/// BEGIN JAVASCRIPT
async function javascriptFunction() {
    return new Promise((resolve, reject) => {
        const projectionMatrix = new math.Matrix4()
        projectionMatrix.orthographic(-50.0, 50.0, -50.0, 50.0, 90.0, 1.0)

        const cameraMatrix = new math.Matrix4()
        cameraMatrix.lookAt([ 5.0, 5.0, 2.0 ], [ 1.0, 5.0, 1.0 ], [ 0.0, 1.0, 0.0 ])

        const viewMatrix = new math.Matrix4()
        viewMatrix.invert(cameraMatrix)

        const projectionViewMatrix = new math.Matrix4()
        projectionViewMatrix.identity()
        projectionViewMatrix.multiply(projectionMatrix)
        projectionViewMatrix.multiply(viewMatrix)
        console.log(projectionViewMatrix.elements)

        resolve()
    })
}

console.time("javascript")
await javascriptFunction()
console.timeEnd("javascript")
/// END JAVASCRIPT