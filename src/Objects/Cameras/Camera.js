import { ObjectType, Object3 } from "../Object3.js"
import { float } from "../../types.js"

export default class Camera extends Object3 {
    /**
     * @param {{
     *  zNear:float;
     *  zFar:float;
     *  fieldOfViewRadians:float;
     *  orthographic:boolean;
     *  orthographicUnits:float;
     * }} config 
     */
    constructor(wasm, transformation = {}, config = {}) {
        super(wasm, transformation)

        this.type = ObjectType.CAMERA

        this.aspect = 1

        this.zNear = config.zNear || 0.0
        this.zFar = config.zFar || 1.0
        this.fieldOfViewRadians = config.fieldOfViewRadians || Math.degreeToRadians(60.0)

        this.orthographic = config.orthographic || false
        this.orthographicUnits = config.orthographicUnits || 1.0

        this.parent = null

        this.target = wasm.create(float, transformation.target || [ 0.0, 0.0, 0.0 ])
        this.up = wasm.create(float, transformation.up || [ 0.0, 1.0, 0.0 ])

        this.projectionMatrix = wasm.create(float, Math.matrixIdentity())
        this.cameraMatrix = wasm.create(float, Math.matrixIdentity())
        this.viewMatrix = wasm.create(float, Math.matrixIdentity())
        this.projectionViewMatrix = wasm.create(float, Math.matrixIdentity())
    }

    _onBeforeRender() {
        const position = !this.parent ? this.position : this.parent.position

        this.wasm.exports.cameraMatrix(
            this.projectionViewMatrix.byteOffset, 
            this.projectionMatrix.byteOffset, 
            this.cameraMatrix.byteOffset, 
            this.viewMatrix.byteOffset,
            this.worldMatrix.byteOffset,
            position.byteOffset,
            this.target.byteOffset,
            this.up.byteOffset,
            this.orthographicUnits,
            this.aspect,
            this.zNear,
            this.zFar,
            this.fieldOfViewRadians,
            this.orthographic)
    }
}

