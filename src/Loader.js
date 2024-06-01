import Collection from "./Core/Collection.js"
import Geometry from "./Core/Geometry.js"
import Material from "./Core/Material.js"
import Vector3 from "./Math/Vector3.js"
import Mesh from "./Core/Mesh.js"
import GLTexture from "./Textures/GLTexture.js"

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
				if (!json.images) json.images = { }
				if (!json.images[`${ url }${ parts.data }`]) {
					json.images[`${ url }${ parts.data }`] = null
				}
				currentObject['diffuseMap'] = `${ url }${ parts.data }`
				break;
			case 'map_Bump':
				if (!json.images) json.images = { }
				if (!json.images[`${ url }${ parts.data }`]) {
					json.images[`${ url }${ parts.data }`] = null
				}
				currentObject['normalMap'] = `${ url }${ parts.data }`
				break;
			case 'map_Ns':
				if (!json.images) json.images = { }
				if (!json.images[`${ url }${ parts.data }`]) {
					json.images[`${ url }${ parts.data }`] = null
				}
				currentObject['specularMap'] = `${ url }${ parts.data }`
				break;
			case 'map_d':
				if (!json.images) json.images = { }
				if (!json.images[`${ url }${ parts.data }`]) {
					json.images[`${ url }${ parts.data }`] = null
				}
				currentObject['opacityMap'] = `${ url }${ parts.data }`
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

const loadObj = async (gl, url, object, transform = { }) => {
	const collection = new Collection()
	let materials = { }
	let maxIndex = [ 1, 1, 1 ]
	let vertexData = [ [], [], [] ]
	
	let textures = { }
	const samplersName = ['diffuseMap','specularMap','normalMap','opacityMap']

	await (objToJson(url, object)
		.then(async json => {
			if (json.images) {
				await Promise.all(Object.keys(json.images).map(url => {
					return new Promise((resolve, reject) => {
						const image = new Image()
	
						image.onload = () => {
							json.images[url] = {
								data: image,
								succeed: true
							}
							resolve()
						}
						image.onerror = () => {
							json.images[url] = {
								data: null,
								succeed: false
							}
							resolve()
						}
	
						image.src = url
					})
				}))
			}

			if (json.materials) {
				Object.keys(json.materials).map(key => {
					if (!Object.keys(materials).includes(key)) {
						const currentMaterial = json.materials[key]
						const material = new Material(currentMaterial)
						material.name = key
	
						samplersName.forEach(async (samplerKey, index) => {
							const name = currentMaterial[samplerKey] || 'empty'
							if (!Object.keys(textures).includes(name) || textures[name].id != index) {
								const texture = new GLTexture(gl)
								texture.id = index

								if (!json.images || !json.images[name]) texture.setEmptyTexture(gl)
								else if (json.images[name].succeed) texture.setImageTexture(gl, json.images[name].data)
								else texture.setErrorTexture(gl)
	
								textures[name] = texture
							}
							material.defineSampler(samplerKey, textures[name])
						})
						materials[key] = material
					}
				})
			}

			if (json.objects) {
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
					mesh.position = transform.position || new Vector3(0, 0, 0)
					mesh.rotation = transform.rotation || new Vector3(0, 0, 0)
					mesh.scale = transform.scale || new Vector3(25, 25, 25)
					mesh.name = key

					collection.add(mesh)
				})
			}
		}))

	return collection
}

export { loadObj }