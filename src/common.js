import Collection from "./Collection.js"
import Geometry from "./Core/Geometry.js"
import Material from "./Core/Material.js"
import Mesh from "./Mesh.js"
import _Object from "./_Object.js"
import Texture from "./Textures/Texture.js"

const makeZToWMatrix = (fudgeFactor) => {
	return [
	  1, 0, 0, 0,
	  0, 1, 0, 0,
	  0, 0, 1, fudgeFactor,
	  0, 0, 0, 1,
	]
}

function computeMatrix(output, projection, view, translation, rotation, scale) {
	// projection * view * model (translation * rotation * scale)
	m4.multiply(output, projection, view)
    m4.multiply(output, matrix, modelMatrix(translation, rotation, scale))
}

function modelMatrix(output, translation, rotation, scale, identity) {
	m4.identity(output)
	
	m4.translate(output, output, translation)
	m4.xRotate(output, output, rotation[0])
	m4.yRotate(output, output, rotation[1])
	m4.yRotate(output, output, rotation[2])
	m4.scale(output, output, scale)
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
		let tempImage = null

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
			case 'map_Kd':
				tempImage = new Image()
				tempImage.src = url + parts.data
				currentObject['diffuseMap'] = tempImage
				break;
			case 'map_Bump':
				tempImage = new Image()
				tempImage.src = url + parts.data
				currentObject['normalMap'] = tempImage
				break;
			case 'map_Ns':
				tempImage = new Image()
				tempImage.src = url + parts.data
				currentObject['specularMap'] = tempImage
				break;
			case 'map_d':
				tempImage = new Image()
				tempImage.src = url + parts.data
				currentObject['opacityMap'] = tempImage
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

const loadObj = (scene, url, object, transform = { }) => {
	const collection = new Collection(object.split('.')[0])
	let materials = { }
	let maxIndex = [ 1, 1, 1 ]
	let vertexData = [ [], [], [] ]
	
	objToJson(url, object)
		.then(json => {
			Object.keys(json.materials).map(key => {
				const currentMaterial = json.materials[key]
				const material = new Material(currentMaterial)
				material.defineSampler('diffuseMap', new Texture(scene.gl, currentMaterial.diffuseMap))
				material.defineSampler('specularMap', new Texture(scene.gl, currentMaterial.specularMap))
				material.defineSampler('normalMap', new Texture(scene.gl, currentMaterial.normalMap))
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
					json.objects[key]['vertex_normals']
				]
				
				currentObject.polygonal_face.map(parts => {
					const addVertex = (vert) => {
						// vert[0] -> vertices
						// vert[1] -> texture
						// vert[2] -> normals
						// vert[3] -> colors
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

				const geometry = new Geometry()
				geometry.setAttribute('position', new Float32Array(vertexData[0]), { size: 3 })
				geometry.setAttribute('normal', new Float32Array(vertexData[2]))
				geometry.setAttribute('texcoord', new Float32Array(vertexData[1]), { size: 2, normalize: false })
				const mesh = new Mesh(geometry, materials[currentObject.material])
				const object = new _Object(scene, mesh, key)
				mesh.location = transform.location || [ 0, 0, 0 ]
				mesh.rotation = transform.rotation || [ 0, 0, 0 ]
				mesh.scale = transform.scale || [ 25, 25, 25 ]
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

export { makeZToWMatrix, computeMatrix, modelMatrix, loadObj }