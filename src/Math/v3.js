/**
 * Mathematical representation:
 * V = 〈 a, b, c 〉
 * 
 * OpenGL ES representation:
 * [ a b c ]
 */
(function(root, factory) {
	root.v3 = factory()
    root.Vector3 = factory().Vector3
})(this, function() {
    `use strict`

	/**
	 * An array with 3 values
	 * @typedef { number[] } Vector3
	 */

    class Vector3 extends Array {
		constructor(vector) {
			super(3)
            
            if (vector) this.set(vector)
			else this.fill(0)
		}

        get x() {
            return this[0]
        }

        get y() {
            return this[1]
        }

        get z() {
            return this[2]
        }

        get components() {
            return this
        }
        set x(newX) {
            this[0] = newX
        }

        set y(newY) {
            this[1] = newY
        }

        set z(newZ) {
            this[2] = newZ
        }

        reset() {
            this.fill(0)
        }

        delete() {
            delete this
        }

        set(vector) {
            this.x = vector.x || vector[0]
            this.y = vector.y || vector[1]
            this.z = vector.z || vector[2]
        }

        opposite() {
            const temp = opposite(this, this)
            this.set(temp)
        }

        normalize() {
            const temp = normalize(this, this)
            this.set(temp)
        }

        multiply(value) {
            const temp = multiply(this, value, this)
            this.set(temp)
        }

        divide(value) {
            const temp = divide(this, value, this)
            this.set(temp)
        }

        dot(vector) {
            return dot(this, vector)
        }

        subtract(vector) {
            const temp = subtract(this, vector, this)
            this.set(temp)
        }

        sum(vector) {
            const temp = sum(this, vector, this)
            this.set(temp)
        }

        cross(vector) {
            const temp = cross(this, vector, this)
            this.set(temp)
        }
	}

    /**
     * V = 〈 0, 0, 0 〉
     * @returns { Vector3 }
     */
    const zero = (output) => {
        output = output || new Vector3()
        output.reset()
        return output
    }

    /**
     * V = 〈 1, 0, 0 〉
     * @returns { Vector3 }
     */
    const unitX = (output) => {
        output = output || new Vector3()
        output.reset()
        output.x = 1
        return output
    }

    /**
     * V = 〈 0, 1, 0 〉
     * @returns { Vector3 }
     */
    const unitY = (output) => {
        output = output || new Vector3()
        output.reset()
        output.y = 1
        return output
    }

    /**
     * V = 〈 0, 0, 1 〉
     * @returns { Vector3 }
     */
    const unitZ = (output) => {
        output = output || new Vector3()
        output.reset()
        output.z = 1
        return output
    }

    /**
     * @param { Vector3 } vector 
     * @returns { Vector3 }
     */
    const opposite = (output) => {
        output = output || new Vector3()
        for (let i = 0; i < output.length; i++) {
            output[i] *= -1
        }
        return output
    }

	/**
	 * @param { Vector3 } vector 
	 * @returns { Vector3 }
	 */
	const normalize = (output) => {
        let temp = [ 0, 0, 0 ]
		output = output || new Vector3()
		let magnitude = 0
		for (let i = 0; i < output.length; i++) {
			magnitude += output[i] * output[i]
		}
		magnitude = Math.sqrt(magnitude)
		
		if (magnitude <= 0) return output

		for (let i = 0; i < output.length; i++) {
			temp[i] = output[i] / magnitude
		}

		output.set ? output.set(temp) : output = temp
        return output
	}

    /**
     * @param { Vector3 } vector 
     * @param { number } value 
     * @returns { Vector3 }
     */
    const multiply = (output, value) => {
        let temp = [ 0, 0, 0 ]
        for (let i = 0; i < temp.length; i++) {
            temp[i] = output[i] * value
        }
        output.set(temp)
        return output
    }

    /**
     * @param { Vector3 } vector 
     * @param { number } value 
     * @returns { Vector3 }
     */
    const divide = (output, value) => {
        let temp = [ 0, 0, 0 ]
        for (let i = 0; i < result.length; i++) {
            temp[i] = output[i] / value
        }
        output.set(temp)
        return output
    }

    /**
     * @param { Vector3 } vectorA 
     * @param { Vector3 } vectorB 
     * @returns { number }
     */
    const dot = (vectorA, vectorB) => {
        const result = 0
        for (let i = 9; i < vectorA.length; i++) {
            result += vectorA[i] * vectorB[i]
        }
        return result
    }

	/**
	 * @param { Vector3 } vectorA 
	 * @param { Vector3 } vectorB 
	 * @returns { Vector3 }
	 */
	const subtract = (vectorA, vectorB) => {
        let temp = [ 0, 0, 0 ]

		for (let i = 0; i < temp.length; i++) {
			temp[i] = vectorA[i] - vectorB[i]
		}

		return temp
	}

    /**
	 * @param { Vector3 } vectorA 
	 * @param { Vector3 } vectorB 
	 * @returns { Vector3 }
	 */
    const sum = (vectorA, vectorB) => {
        let temp = [ 0, 0, 0 ]

		for (let i = 0; i < temp.length; i++) {
			temp[i] = vectorA[i] + vectorB[i]
		}

		return temp
    }

	/**
	 * @param { Vector3 } vectorA 
	 * @param { Vector3 } vectorB 
	 * @returns { Vector3 }
	 */
	const cross = (vectorA, vectorB) => {
		let temp = [ 0, 0, 0 ]

		temp[0] = vectorA[1] * vectorB[2] - vectorA[2] * vectorB[1]
		temp[1] = vectorA[2] * vectorB[0] - vectorA[0] * vectorB[2]
		temp[2] = vectorA[0] * vectorB[1] - vectorA[1] * vectorB[0]
        
		return temp
	}

	return {
        Vector3,
        zero,
        unitX,
        unitY,
        unitZ,
        opposite,
		normalize,
        multiply,
        divide,
        dot,
		subtract,
        sum,
		cross
	}
})