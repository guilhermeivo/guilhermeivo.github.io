export default class Vector3 {
    constructor(n1 = 0, n2 = 0, n3 = 0) {
        this.elements = [
			n1, n2, n3
		]
    }

	set(n1 = 0, n2 = 0, n3 = 0) {
        this.elements = [
			n1, n2, n3
		]
    }

    static subtract(vectorA, vectorB) {
        let temp = [ 0, 0, 0 ]

		for (let i = 0; i < temp.length; i++) {
			temp[i] = vectorA[i] - vectorB[i]
		}

		return temp
    }

    static cross(vectorA, vectorB) {
		let temp = [ 0, 0, 0 ]

		temp[0] = vectorA[1] * vectorB[2] - vectorA[2] * vectorB[1]
		temp[1] = vectorA[2] * vectorB[0] - vectorA[0] * vectorB[2]
		temp[2] = vectorA[0] * vectorB[1] - vectorA[1] * vectorB[0]
        
		return temp
	}

    static normalize(vector) {
        let temp = [ 0, 0, 0 ]
        
		let magnitude = 0
		for (let i = 0; i < vector.length; i++) {
			magnitude += vector[i] * vector[i]
		}
		magnitude = Math.sqrt(magnitude)
		
		if (magnitude <= 0) return vector

		for (let i = 0; i < vector.length; i++) {
			temp[i] = vector[i] / magnitude
		}

        return temp
	}
}