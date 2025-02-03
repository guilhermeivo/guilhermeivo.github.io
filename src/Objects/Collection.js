import { ObjectType, Object3 } from "./Object3.js"

export default class Collection extends Object3 {
    constructor(wasm, transformations = { }) {
        super(wasm, transformations)

        this.type = ObjectType.COLLECTION
    }
}