import Camera from "./src_new/Camera.js"
import Geometry from "./src_new/Geometry.js"
import Material from "./src_new/Material.js"
import Mesh from "./src_new/Mesh.js"
import Attribute from "./src_new/Attribute.js"
import Scene from "./src_new/Scene.js"
import Light from "./src_new/Light.js"
import Renderer from "./src_new/Renderer.js"
import { FloatType } from "./src/constants.js"

import monkey from "./resources/monkey/monkey.js"

`use-strict`

const scene = new Scene()

const camera = new Camera()
const light = new Light()

const geometry = new Geometry()
geometry.setAttribute('position', new Attribute(monkey.vertice(), 3, true, FloatType))
geometry.setAttribute('normal', new Attribute(monkey.normal(), 3, true, FloatType))
geometry.setAttribute('color', new Attribute(monkey.color(), 2, false, FloatType))
geometry.setAttribute('texcoord', new Attribute(monkey.texture(), 2, false, FloatType))
const material = new Material()
const mesh = new Mesh(geometry, material)

scene.add(light)
scene.add(mesh)

const renderer = new Renderer()
renderer.render(scene, camera)