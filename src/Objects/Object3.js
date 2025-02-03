import { float } from "../types.js"

/**
 * Adaptado do `enum class ObjectType` no arquivo Object3.h
 */
export class ObjectType {
    static #_OBJECT3 = 0
    static #_COLLECTION = 1
    static #_LINE = 2
    static #_MESH = 3
    static #_LIGHT = 4
    static #_CAMERA = 5

    static get OBJECT3() { return this.#_OBJECT3; }
    static get COLLECTION() { return this.#_COLLECTION; }
    static get LINE() { return this.#_LINE; }
    static get MESH() { return this.#_MESH; }
    static get LIGHT() { return this.#_LIGHT; }
    static get CAMERA() { return this.#_CAMERA; }

    static to_string(objectType) {
        switch (objectType) {
            case ObjectType.OBJECT3: return "Object3"
            case ObjectType.COLLECTION: return "Collection"
            case ObjectType.LINE: return "Line"
            case ObjectType.MESH: return "Mesh"
            case ObjectType.LIGHT: return "Light"
            case ObjectType.CAMERA: return "Camera"
        }
        return ""
    }
}

/**
 * @header Cycle Life
 * 
 *                          Opcional
 *  +---------------+   +---------------+
 *  | BeforeRender  |-->| _BeforeRender |
 *  +---------------+   +---------------+
 *         |                    |
 *         v                    |
 *  +---------------+           |
 *  |  AfterRender  |<----------+
 *  +---------------+
 * 
 */
export class Object3 {
    constructor(wasm, transformation = {}) {
        this.wasm = wasm

        this.type = ObjectType.OBJECT3

        this.parent = null
        this.children = []

        this.position =  wasm.create(float, transformation.position || [ 0.0, 0.0, 0.0 ])
        this.rotation = wasm.create(float, transformation.rotation || [ 0.0, 0.0, 0.0 ])
        this.scale = wasm.create(float, transformation.scale || [ 1.0, 1.0, 1.0 ])

        this.worldMatrix = wasm.create(float, Math.matrixIdentity())

        this.id = 0

        this.shadow = 0
    }

    /// virtual
    add(object) {
        if (object === this) return

        this.children.push(object)
    }

    /// virtual
    onBeforeRender(fps, callback = null) {
        const usedValues = !this.parent
            ? [ this.position, this.rotation, this.scale]
            : [ this.parent.position, this.parent.rotation, this.parent.scale ]

        this.wasm.exports.worldMatrix(
            this.worldMatrix.byteOffset, 
            usedValues[0].byteOffset, 
            usedValues[1].byteOffset, 
            usedValues[2].byteOffset)

        if (callback) callback(fps)
        else if (this._onBeforeRender) this._onBeforeRender(fps)
    }

    /// virtual
    _onBeforeRender(fps) { }

    /// virtual
    onAfterRender(fps) { }
}