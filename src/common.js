import Collection from "./Collection.js"
import Geometry from "./Geometry.js"
import Material from "./Material.js"
import Mesh from "./Mesh.js"
import _Object from "./_Object.js"

const makeZToWMatrix = (fudgeFactor) => {
	return [
	  1, 0, 0, 0,
	  0, 1, 0, 0,
	  0, 0, 1, fudgeFactor,
	  0, 0, 0, 1,
	]
}

function computeMatrix(projection, view, translation, rotation, scale) {
	// projection * view * model (translation * rotation * scale)
	let matrix = new Matrix4()
	matrix = m4.multiply(projection, view)
    matrix = m4.multiply(matrix, modelMatrix(translation, rotation, scale))
	
    return matrix
}

function modelMatrix(translation, rotation, scale, identity) {
	let matrix = identity || m4.identity()
		matrix = m4.translate(matrix, translation)
        matrix = m4.xRotate(matrix, rotation[0])
        matrix = m4.yRotate(matrix, rotation[1])
        matrix = m4.yRotate(matrix, rotation[2])
        matrix = m4.scale(matrix, scale)

	return matrix
}

const objToJson = async (url, file, current = 'objects') => {
	const data = await fetch(url + file)
		.then(response => response.text())

	let json = {
		[current]: {}
	}

	// remove comments
	const comment = '#'
	const lines = data.split('\n')
        .filter(line => {
            if (line === '' || line.startsWith(comment)) return false
            else return true
        })
        .map(line => {
            line = line.split('').reverse()
            for (let i = 0; i < line.length; i++) {
                if (line[i] === comment) {
                    line = line.slice(i + 1)
                    break
                }
            }
            return line.reverse().join('').trim()
        })

	await Promise.all(lines.map(async line => {
		const parts = {
			name: line.split(' ')[0],
			data: line.split(' ').slice(1)
		}

		const currentObjectName = Object.keys(json[current])[Object.keys(json[current]).length - 1]
		const currentObject = json[current][currentObjectName]

		switch (parts.name) {
			case 'mtllib':
				const value = await objToJson(url, parts.data, 'materials')
				json = {
					...json,
					...value
				}
				break;
			case 'newmtl':
				if (!json[current][parts.data]) json[current][parts.data] = { }
				break;
			case 'Ns':
				currentObject['shininess'] = parts.data.map(parseFloat)
				break;
			case 'Ka':
				currentObject['ambient'] = parts.data.map(parseFloat)
				break;
			case 'Kd':
				currentObject['diffuse'] = parts.data.map(parseFloat)
				break;
			case 'Ks':
				currentObject['specular'] = parts.data.map(parseFloat)
				break;
			case 'Ke':
				currentObject['emissive'] = parts.data.map(parseFloat)
				break;
			case 'Ni':
				currentObject['opticalDensity'] = parts.data.map(parseFloat)
				break;
			case 'd':
				currentObject['opacity'] = parts.data.map(parseFloat)
				break;
			case 'illum':
				currentObject['illum'] = parts.data.map(parseFloat)
				break;
			case 'o':
				if (!json[current][parts.data]) json[current][parts.data] = { }
				break;
			case 'v':
				if (!currentObject['geometric_vertices']) currentObject['geometric_vertices'] = []
				currentObject['geometric_vertices'].push(parts.data.map(parseFloat))
				break;
			case 'vn':
				if (!currentObject['vertex_normals']) currentObject['vertex_normals'] = []
				currentObject['vertex_normals'].push(parts.data.map(parseFloat))
				break;
			case 'vt':
				if (!currentObject['texture_coordinates']) currentObject['texture_coordinates'] = []
				currentObject['texture_coordinates'].push(parts.data.map(parseFloat))
				break;
			case 'usemtl':
				currentObject['material'] = parts.data.join('')
				break;
			case 'f':
				if (!currentObject['polygonal_face']) currentObject['polygonal_face'] = []
				currentObject['polygonal_face'].push(parts.data.map(value => value.split('/').map(parseFloat)))
				break;
			default:
				break;
		}
	}))

	return json
}

const loadObj = (scene, url, object) => {
	const collection = new Collection(object.split('.')[0])
	let materials = { }
	let maxIndex = [ 1, 1, 1 ]
	let vertexData = [ [], [], [] ]
	objToJson(url, object)
		.then(json => {
			Object.keys(json.materials).map(key => {
				const currentMaterial = json.materials[key]
				const material = new Material(currentMaterial)
				materials = {
					...materials,
					[key]: material
				}
			})
			Object.keys(json.objects).map(key => {
				// reset
				vertexData = [ [], [], [] ]

				const currentObject = json.objects[key]
				const objVertexData = [
					json.objects[key]['geometric_vertices'],
					json.objects[key]['texture_coordinates'],
					json.objects[key]['vertex_normals'],
				]
				
				currentObject.polygonal_face.map(parts => {
					const addVertex = (vert) => {
						// vert[0] -> vertices
						// vert[1] -> texture
						// vert[2] -> normals
						vert.forEach((objIndexStr, i) => {
							const objIndex = parseInt(objIndexStr) - maxIndex[i]
							vertexData[i].push(...objVertexData[i][objIndex])
						})
					}

					// convert quad -> tri or tri -> tri
					const numTriangles = parts.length - 2
						for (let tri = 0; tri < numTriangles; tri++) {
							addVertex(parts[0])
							addVertex(parts[tri + 1])
							addVertex(parts[tri + 2])
						}
					})
				
				// config
				maxIndex[0] += objVertexData[0].length
				maxIndex[1] += objVertexData[1].length
				maxIndex[2] += objVertexData[2].length

				const geometry = new Geometry(scene.gl)
				geometry.setAttribute('position', new Float32Array(vertexData[0]), { size: 3 })
				geometry.setAttribute('normal', new Float32Array(vertexData[2]))
				geometry.setAttribute('texcoord', new Float32Array(vertexData[1]), { size: 2 })
				const mesh = new Mesh(geometry, materials[currentObject.material])
				const object = new _Object(scene, mesh, key)
				mesh.scale = [ 25, 25, 25 ]
				object.init()
				collection.objects.push(object)
			})
		})

	return collection
}

(function() {
	if (!Math.floorDecimal) {
		Math.floorDecimal = function(value, exp) {
			let decimal = 1
			for (let i = 0; i < exp; i++) {
				decimal*=10
			}
			return Math.floor(value * decimal) / decimal
		}
	}

	if (!Math.degreeToRadians) {
		Math.degreeToRadians = function(degree) {
			return (degree * Math.PI) / 180
		} 
	}
	
	if (!Math.radiansToDegree) {
		Math.radiansToDegree = function(radians) {
			return (radians * 180) / Math.PI
		}
	}

	if (!Math.convertToUnitCirle) {
		Math.convertToUnitCirle = function(radians) {
			return [ Math.cos(radians), Math.sin(radians) ]
		}
	}

	if (!HTMLElement.appendDOM) {
		HTMLElement.prototype.appendDOM = function(stringHtml, position = 'beforeend') {
			this.insertAdjacentHTML(position, stringHtml.trim())
			if (position === 'beforeend') return this.lastElementChild
			else if (position === 'afterbegin') return this.firstElementChild
			else return this
		}
	}
})()

const saveblob = (blob, filename) => {
	const a = document.createElement('a')
	document.body.appendChild(a)
	a.style.display = 'none'
	const url = window.URL.createObjectURL(blob)
	a.href = url
	a.download = filename
	a.click()
}

export { makeZToWMatrix, computeMatrix, modelMatrix, saveblob, loadObj }