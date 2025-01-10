import plane from "../../resources/plane/plane.js"
import { UnsignedByte } from "../Core/constants.js"
import Geometry from "../Core/Geometry.js"
import Material from "../Core/Material.js"
import Mesh from "../Core/Mesh.js"
import GLTexture from "../Textures/GLTexture.js"

export default class Plane extends Mesh {
    constructor(gl, transformation) {
        const width = 15
        const height = 15

        const geometry = new Geometry()

        geometry.setAttribute('position', plane.vertice(width, height), { size: 3 })
        geometry.setAttribute('color', plane.color(), { type: UnsignedByte })
        geometry.setAttribute('normal', plane.normal())
        geometry.setAttribute('texcoord', plane.texture(), { size: 2, normalize: false })
        const material = new Material({
            specular: [0, 0, 0]
        })
        const texture = new GLTexture(gl)
        texture.bind(gl)
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,                // mip level
            gl.LUMINANCE,     // internal format
            8,                // width
            8,                // height
            0,                // border
            gl.LUMINANCE,     // format
            gl.UNSIGNED_BYTE, // type
            new Uint8Array([  // data
                0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
                0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
                0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
                0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
                0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
                0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
                0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
                0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
            ]))
        gl.generateMipmap(gl.TEXTURE_2D)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        material.defineSampler('diffuseMap', texture)
        material.name = 'plane'

        super(geometry, material, transformation)

        this.vertice = [...plane.vertice(width, height)]
        this.color = [...plane.color()]
        this.normal = [...plane.normal()]
        this.texture = [...plane.texture()]

        //this.subdivision()
    }

    subdivision() {
        let newPosition = []
        let newColor = []
        for (let i = 0; i < this.vertice.length; i+=3*3) {
            let colorA = [this.color[i + 0], this.color[i + 1], this.color[i + 2]]
            let colorB = [this.color[i + 3], this.color[i + 4], this.color[i + 5]]
            let colorC = [this.color[i + 6], this.color[i + 7], this.color[i + 8]]

            let pointA = [this.vertice[i + 0], this.vertice[i + 1], this.vertice[i + 2]]
            let pointB = [this.vertice[i + 3], this.vertice[i + 4], this.vertice[i + 5]]
            let pointC = [this.vertice[i + 6], this.vertice[i + 7], this.vertice[i + 8]]

            let pointD = [(pointA[0] + pointB[0]) / 2, (pointA[1] + pointB[1]) / 2, (pointA[2] + pointB[2]) / 2]
            let pointE = [(pointB[0] + pointC[0]) / 2, (pointB[1] + pointC[1]) / 2, (pointB[2] + pointC[2]) / 2]
            let pointF = [(pointA[0] + pointC[0]) / 2, (pointA[1] + pointC[1]) / 2, (pointA[2] + pointC[2]) / 2]

            newPosition.push(...pointA, ...pointD, ...pointF)
            newPosition.push(...pointD, ...pointB, ...pointE)
            newPosition.push(...pointD, ...pointE, ...pointF)
            newPosition.push(...pointF, ...pointE, ...pointC)

            newColor.push(...colorA);newColor.push(...colorA);newColor.push(...colorA)
            newColor.push(...colorB);newColor.push(...colorB);newColor.push(...colorB)
            newColor.push(...colorA);newColor.push(...colorA);newColor.push(...colorA)
            newColor.push(...colorC);newColor.push(...colorC);newColor.push(...colorC)

            this.normal.push(0, 1, 0); this.normal.push(0, 1, 0); this.normal.push(0, 1, 0)
            this.normal.push(0, 1, 0); this.normal.push(0, 1, 0); this.normal.push(0, 1, 0)
            this.normal.push(0, 1, 0); this.normal.push(0, 1, 0); this.normal.push(0, 1, 0)

            this.texture.push(0, 0); this.texture.push(0, 0); this.texture.push(0, 0)
            this.texture.push(0, 0); this.texture.push(0, 0); this.texture.push(0, 0)
            this.texture.push(0, 0); this.texture.push(0, 0); this.texture.push(0, 0)
        }

        this.vertice = newPosition
        this.color = newColor

        this.geometry.setAttribute('position', new Float32Array(this.vertice), { size: 3 })
        this.geometry.setAttribute('color', new Float32Array(this.color), { type: UnsignedByte })
        this.geometry.setAttribute('normal', new Float32Array(this.normal))
        this.geometry.setAttribute('texcoord', new Float32Array(this.texture), { size: 2, normalize: false })
    }
}