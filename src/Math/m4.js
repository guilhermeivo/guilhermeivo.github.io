/*
 * Mathematical representation:
 * ⎡ a b c d ⎤ line 0
 * ⎢ e f g h ⎥ line 1
 * ⎢ i j k l ⎥ line 2 
 * ⎣ m n o p ⎦ line 3
 * 
 * OpenGL ES representation:
 * ⎡ a b c d ⎤ column 0
 * ⎢ e f g h ⎥ column 1
 * ⎢ i j k l ⎥ column 2 
 * ⎣ m n o p ⎦ column 3
 */

(function(root, factory) {
	root.m4 = factory()
	root.Matrix4 = factory().Matrix4
})(this, function() {
	`use strict`
	
	/**
	 * An array with 16 values
	 * @typedef { number[] } Matrix4
	 */

	const amountOfLines = 4
	const amountOfColumns = 4

	class Matrix4 extends Array {
		constructor() {
			super(16)
			this.fill(0)
		}

		get translation() {
			return [ this[12], this[13], this[14] ]
		}

		set(matrix) {
			for (let i = 0; i < this.length; i+=amountOfLines) { // lines
				for (let j = 0; j < amountOfColumns; j++) {
					this[i + j] = matrix[i + j]
				}
			}
		}

		scalarMultiply(value) {
			const temp = scalarMultiply(this, value, this)
            this.set(temp)
		}

		multiply(matrix) {
			const temp = multiply(this, matrix, this)
            this.set(temp)
		}

		inverse() {
			const temp = inverse(this, this)
            this.set(temp)
		}

		reset() {
			this.fill(0)
			// for (let i = 0; i < this.length; i++) this[i] = 0
		}

		delete() {
			delete this
		}
	}

	/**
	 * @returns { Matrix4 }
	 */
	const zero = (output) => {
		output = output || new Matrix4()
		output.reset()
		return output
	}

	/**
	 * 
	 * @param { number } value 
	 * @returns { Matrix4 }
	 */
	const scalar = (output, value) => {
		output = output || new Matrix4()
		output.reset()
		for (let i = 0; i < amountOfLines; i++) {
			output[i * 4 + i] = value
		}
		return output
	}

	/**
	 * @returns { Matrix4 }
	 */
	const identity = (output) => {
		output = output || new Matrix4()
		output.reset()
		for (let i = 0; i < amountOfLines; i++) {
			output[i * 4 + i] = 1
		}
		return output
	}

	/**
	 * @returns { Matrix4 }
	 */
	const unit = (output) => {
		output = output || new Matrix4()
		output.reset()
		output.fill(1)
		return output
	}

	/**
	 * 
	 * @param { Matrix4 } matrix 
	 * @param { number } value 
	 * @returns { Matrix4 }
	 */
	const scalarMultiply = (output, matrix, value) => {
		let temp = [ 
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0
		]

		for (let i = 0; i < temp.length; i+=amountOfLines) { // line
			for (let j = 0; j < amountOfColumns; j++) { // column
				temp[i + j] = matrix[i + j] * value
			}
		}

		output.set(temp)
	}

	/**
     * @param { Matrix4 } matrixA 
     * @param { Matrix4 } matrixB
     * @returns { Matrix4 }
     */
    const multiply = (output, matrixA, matrixB) => {
		let temp = [ 
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0
		]
		/*
		 * Solution found for multiplication using the OpenGL ES matrix pattern is to transform A*B into B*A
		 * maintaining the mathematical matrix multiplication algorithm
		 *
		 *    b             a                   result
		 * ⎡ a b ⋯ ⎤     ⎡ e f ⋯ ⎤     ⎡ a*e+b*g+⋯ a*f+b*h+⋯ ⋯ ⎤
         * ⎢ c d ⋯ ⎥  *  ⎢ g h ⋯ ⎥  =  ⎢ c*e+d*g+⋯ c*f+d*g+⋯ ⋯ ⎥
         * ⎣ ⋮  ⋮ ⋱ ⎦     ⎣ ⋮  ⋮ ⋱ ⎦     ⎣     ⋮          ⋮       ⋱ ⎦
	     *    4x4            4x4                  4x4
		 */
		if (matrixA.length != matrixB.length) return

		for (let ib = 0; ib < matrixA.length; ib+=amountOfLines) { // line
			for (let jb = 0; jb < amountOfColumns; jb++) { // column
				const valueB = matrixB[ib + jb]
				for (let ja = 0; ja < amountOfColumns; ja++) { // column
					const valueA = matrixA[jb * amountOfLines + ja]
					temp[ib + ja] += valueA * valueB
				}
			}
		}

		output.set(temp)
		temp = null
    }

	/**
	 * 
	 * @param { Matrix4 } matrix 
	 * @returns { Matrix4 }
	 */
	const inverse = (matrix) => {
		m00 = matrix[0 * 4 + 0]
		m01 = matrix[0 * 4 + 1]
		m02 = matrix[0 * 4 + 2]
		m03 = matrix[0 * 4 + 3]
		m10 = matrix[1 * 4 + 0]
		m11 = matrix[1 * 4 + 1]
		m12 = matrix[1 * 4 + 2]
		m13 = matrix[1 * 4 + 3]
		m20 = matrix[2 * 4 + 0]
		m21 = matrix[2 * 4 + 1]
		m22 = matrix[2 * 4 + 2]
		m23 = matrix[2 * 4 + 3]
		m30 = matrix[3 * 4 + 0]
		m31 = matrix[3 * 4 + 1]
		m32 = matrix[3 * 4 + 2]
		m33 = matrix[3 * 4 + 3]
		tmp_0  = m22 * m33
		tmp_1  = m32 * m23
		tmp_2  = m12 * m33
		tmp_3  = m32 * m13
		tmp_4  = m12 * m23
		tmp_5  = m22 * m13
		tmp_6  = m02 * m33
		tmp_7  = m32 * m03
		tmp_8  = m02 * m23
		tmp_9  = m22 * m03
		tmp_10 = m02 * m13
		tmp_11 = m12 * m03
		tmp_12 = m20 * m31
		tmp_13 = m30 * m21
		tmp_14 = m10 * m31
		tmp_15 = m30 * m11
		tmp_16 = m10 * m21
		tmp_17 = m20 * m11
		tmp_18 = m00 * m31
		tmp_19 = m30 * m01
		tmp_20 = m00 * m21
		tmp_21 = m20 * m01
		tmp_22 = m00 * m11
		tmp_23 = m10 * m01
	
		t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
				 (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31)
		t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
				 (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31)
		t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
				 (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31)
		t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
				 (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21)
	
		const d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3)
	
		return [
		  d * t0,
		  d * t1,
		  d * t2,
		  d * t3,
		  d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
			   (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
		  d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
			   (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
		  d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
			   (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
		  d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
			   (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
		  d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
			   (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
		  d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
			   (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
		  d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
			   (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
		  d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
			   (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
		  d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
			   (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
		  d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
			   (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
		  d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
			   (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
		  d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
			   (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02)),
		]
	}

	/// World Matrix
	// A matrix that takes the vertices of a model and moves them to world space

	/**
	 * Translation matrice
	 * @param {( number | Array.<number> | { tx: number, ty: number, tz: number, res?: Matrix4 } )} args 
	 * @returns { Matrix4 }
	 */
	const translation = (...args) => {
		/*
		 * OpenGL ES matrix pattern example
		 * Mathematical representation:
		 * ⎡ 1 0 0 x ⎤ line 0
 		 * ⎢ 0 1 0 y ⎥ line 1
 		 * ⎢ 0 0 1 z ⎥ line 2 
 		 * ⎣ 0 0 0 1 ⎦ line 3 
		 *
		 * OpenGL ES representation:
		 * ⎡ 1 0 0 0 ⎤ column 0
 		 * ⎢ 0 1 0 0 ⎥ column 1
 		 * ⎢ 0 0 1 0 ⎥ column 2 
 		 * ⎣ x y z 1 ⎦ column 3 
		 */

		if (args.length <= 0) return
		
		// t[0] = translationX
		// t[1] = translationY
		// t[2] = translationZ
		const t = convertArgsToArray(...args)

		return [
			1,    0,    0,    0,
			0,    1,    0,    0,
			0,    0,    1,    0,
		 	t[0], t[1], t[2],    1,
	 	]
	}

	/**
	 * Rotation X matrice
	 * @param { number } angleInRadians 
	 * @returns { Matrix4 }
	 */
	const xRotation = (angleInRadians) => {
		const c = Math.cos(angleInRadians)
		const s = Math.sin(angleInRadians)

		return [
			1,  0, 0, 0,
			0,  c, s, 0,
			0, -s, c, 0,
			0,  0, 0, 1,
		]
	}

	/**
	 * Rotation Y matrice
	 * @param { number } angleInRadians 
	 * @returns { Matrix4 }
	 */
	const yRotation = (angleInRadians) => {
		const c = Math.cos(angleInRadians)
		const s = Math.sin(angleInRadians)

		return [
			c, 0, -s, 0,
			0, 1,  0, 0,
			s, 0,  c, 0,
			0, 0,  0, 1,
		]
	}

	/**
	 * Rotation Z matrice
	 * @param { number } angleInRadians 
	 * @returns { Matrix4 }
	 */
	const zRotation = (angleInRadians) => {
		const c = Math.cos(angleInRadians)
		const s = Math.sin(angleInRadians)

		return [
			c, s, 0, 0,
		   -s, c, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1,
	   ]
	}

	/**
	 * Scaling matrice
	 * @param {( number | Array.<number> | { sx: number, sy: number, sz: number } )} args 
	 * @returns { Matrix4 }
	 */
	const scaling = (...args) => {
		if (args.length <= 0) return
		
		// t[0] = scalingX
		// t[1] = scalingY
		// t[2] = scalingZ
		const s = convertArgsToArray(...args)

		return [
			s[0],    0,    0,  0,
			   0, s[1],    0,  0,
			   0,    0, s[2],  0,
			   0,    0,    0,  1,
		]
	}

	/**
	 * 
	 * @param { Matrix4 } matrix 
	 * @param {( number | Array.<number> | { tx: number, ty: number, tz: number } )} args 
	 * @returns { Matrix4 }
	 */
	const translate = (output, matrix, ...args) => {
		// newX = x + tx
		// newY = y + ty
		// newZ = z + tz
		multiply(output, matrix, translation(...args))
	}

	/**
	 * 
	 * @param { Matrix4 } matrix 
	 * @param { number } angleInRadians 
	 * @returns { Matrix4 }
	 */
	const xRotate = (output, matrix, angleInRadians) => {
		// unit circle
		multiply(output, matrix, xRotation(angleInRadians))
	}

	/**
	 * 
	 * @param { Matrix4 } matrix 
	 * @param { number } angleInRadians 
	 * @returns { Matrix4 }
	 */
	const yRotate = (output, matrix, angleInRadians) => {
		// unit circle
		multiply(output, matrix, yRotation(angleInRadians))
	}

	/**
	 * 
	 * @param { Matrix4 } matrix 
	 * @param { number } angleInRadians 
	 * @returns { Matrix4 }
	 */
	const zRotate = (output, matrix, angleInRadians) => {
		// unit circle
		multiply(output, matrix, zRotation(angleInRadians))
	}

	/**
	 * 
	 * @param { Matrix4 } matrix 
	 * @param {( number | Array.<number> | { tx: number, ty: number, tz: number } )} args 
	 * @returns { Matrix4 }
	 */
	const scale = (output, matrix, ...args) => {
		// newX = x * sx
		// newY = y * sy
		// newZ = z * sz
		multiply(output, matrix, scaling(...args))
	}

	const computeMatrix = (output, projection, view, translation, rotation, scale) => {
		// projection * view * model (translation * rotation * scale)
		multiply(output, projection, view)
		multiply(output, output, modelMatrix(translation, rotation, scale))
	}
	
	const modelMatrix = (output, translation, rotation, scale, identity) => {
		m4.identity(output)
		
		m4.translate(output, output, translation)
		m4.xRotate(output, output, rotation[0])
		m4.yRotate(output, output, rotation[1])
		m4.yRotate(output, output, rotation[2])
		m4.scale(output, output, scale)
	}

	/// Projection Matrix
	// A matrix that converts a frustum of space into clip space or some orthographic space into clip space.

	const projection = (width, height, depth) => {
		// Note: This matrix flips the Y axis so 0 is at the top.
		return [
		2 / width,           0,         0, 0,
				0, -2 / height,         0, 0,
				0,           0, 2 / depth, 0,
			-1,           1,         0, 1,
		]
	}

	const perspective = (fieldOfViewInRadians, aspect, near, far) => {
		const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians)
		const rangeInv = 1.0 / (near - far)

		return [
			f / aspect, 0, 0, 0,
			0, f, 0, 0,
			0, 0, (near + far) * rangeInv, -1,
			0, 0, near * far * rangeInv * 2, 0
		]
	}
	
	const orthographic = (left, right, bottom, top, near, far) => {
		return [
			2 / (right - left), 0, 0, 0,
			0, 2 / (top - bottom), 0, 0,
			0, 0, 2 / (near - far), 0,
			(left + right) / (left - right),
			(bottom + top) / (bottom - top),
			(near + far) / (near - far),
			1,
		]
	}

	/**
	 * 
	 * @param { Vector3 } position 
	 * @param { Vector3 } target 
	 * @param { Vector3 } yAxis 
	 * @returns { Matrix4 }
	 */
	const lookAt = (position, target, yAxis) => {
		const front = v3.normalize(v3.subtract( position, target))
		const right = v3.normalize(v3.cross( yAxis, front))
		const up = v3.normalize(v3.cross( front, right))

		const result = [
			right[0], right[1], right[2], 0,
			up[0], up[1], up[2], 0,
			front[0], front[1], front[2], 0,
			position[0], position[1], position[2], 1
		]
	
		return result
	}

	const print = (matrix, label = 'Matrix') => {
		let line = ''
		console.group(label)
		for (let i = 0; i < matrix.length; i+=amountOfLines) {
			if (i == 0) line = '⎡ '
			else if (i == matrix.length - amountOfLines) line = '⎣ '
			else line = '⎢ '
			for (let j = 0; j < amountOfColumns; j++) {
				line = `${ line }${ matrix[i + j] }${ (j == amountOfColumns - 1) ? '' : ', ' }`
			}
			if (i == 0) line = `${ line } ⎤`
			else if (i == matrix.length - amountOfLines) line = `${ line } ⎦`
			else line = `${ line } ⎢`
			console.log(line)
		}
		console.groupEnd()
	}

	const convertArgsToArray = (...args) => {
		if (args.length <= 0) return []
	
		if (Array.isArray(args[0])) return args[0]
		else if (typeof args[0] === 'object') {
			const array = []
			const keys = Object.keys(args[0])
			keys.forEach(key => {
				array.push(args[0][key])
			})
			return array
		} 
		else return args
	}

	return {
		Matrix4,
		zero,
		scalar,
		identity, 
		unit,
		translation,
		xRotation,
		yRotation,
		zRotation,
		scaling,
		scalarMultiply,
		multiply,
		translate,
		xRotate,
		yRotate,
		zRotate,
		scale,
		computeMatrix,
		modelMatrix,
		perspective,
		orthographic,
		projection,
		inverse,
		lookAt,
		print
	}
})