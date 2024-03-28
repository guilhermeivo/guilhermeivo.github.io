import Geometry from "../Core/Geometry.js";
import Material from "../Core/Material.js";
import LightMesh from "./LightMesh.js";
import _Object from "../_Object.js";

export default class DebugLight extends _Object {
    constructor(gl, configs = { }) {
        const mesh = new LightMesh(configs)
        super(gl, mesh, 'light')

        this.type = 'light'

        this.color = configs.color || [ 1, 1, 1 ]
        this.itensity = configs.itensity || [ .5 ]
        this.ambient = configs.ambient || [ 0.05, 0.05, 0.05 ]
        this.diffuse = configs.diffuse || [ 0.8, 0.8, 0.8 ]
        this.specular = configs.specular || [ 1.0, 1.0, 1.0 ]

        this.constant = [ 1.0 ]
        this.linear = [ 0.002 ]
    }

    init(scene) { }

    _update() { }

    draw(scene) { }
}