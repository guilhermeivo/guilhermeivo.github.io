import Vector3 from "./Vector3.js";

const amountOfLines = 4
const amountOfColumns = 4

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

export default class Matrix4 {
    constructor() {
		this.amountOfLines = 4
		this.amountOfColumns = 4

        this.identity()
    }

	identity() {
		this.elements = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]
	}

	unit = () => {
		this.elements = [
			1, 1, 1, 1,
			1, 1, 1, 1,
			1, 1, 1, 1,
			1, 1, 1, 1,
		]
	}

	zero = () => {
		this.elements = [
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0
		]
	}

    set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
        const te = this.elements

		te[0] = n11; te[1] = n12; te[2] = n13; te[3] = n14;
		te[4] = n21; te[5] = n22; te[6] = n23; te[7] = n24;
		te[8] = n31; te[9] = n32; te[10] = n33; te[11] = n34;
		te[12] = n41; te[13] = n42; te[14] = n43; te[15] = n44;
    }

	multiply(m) {
        this.elements = Matrix4.multiplyMatrices(this, m)
	}

    static multiplyMatrices(a, b) {
		let matrixA = a.elements
		let matrixB = b.elements
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

		return temp
	}

	scalarMultiply(value) {
		let temp = [ 
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0
		]

		for (let i = 0; i < temp.length; i+=this.amountOfLines) { // line
			for (let j = 0; j < this.amountOfColumns; j++) { // column
				temp[i + j] = this.elements[i + j] * value
			}
		}

		this.elements = temp
		temp = null
	}

    invert(m) {
		const matrix = m.elements

		let m00 = matrix[0 * 4 + 0]
		let m01 = matrix[0 * 4 + 1]
		let m02 = matrix[0 * 4 + 2]
		let m03 = matrix[0 * 4 + 3]
		let m10 = matrix[1 * 4 + 0]
		let m11 = matrix[1 * 4 + 1]
		let m12 = matrix[1 * 4 + 2]
		let m13 = matrix[1 * 4 + 3]
		let m20 = matrix[2 * 4 + 0]
		let m21 = matrix[2 * 4 + 1]
		let m22 = matrix[2 * 4 + 2]
		let m23 = matrix[2 * 4 + 3]
		let m30 = matrix[3 * 4 + 0]
		let m31 = matrix[3 * 4 + 1]
		let m32 = matrix[3 * 4 + 2]
		let m33 = matrix[3 * 4 + 3]
		let tmp_0  = m22 * m33
		let tmp_1  = m32 * m23
		let tmp_2  = m12 * m33
		let tmp_3  = m32 * m13
		let tmp_4  = m12 * m23
		let tmp_5  = m22 * m13
		let tmp_6  = m02 * m33
		let tmp_7  = m32 * m03
		let tmp_8  = m02 * m23
		let tmp_9  = m22 * m03
		let tmp_10 = m02 * m13
		let tmp_11 = m12 * m03
		let tmp_12 = m20 * m31
		let tmp_13 = m30 * m21
		let tmp_14 = m10 * m31
		let tmp_15 = m30 * m11
		let tmp_16 = m10 * m21
		let tmp_17 = m20 * m11
		let tmp_18 = m00 * m31
		let tmp_19 = m30 * m01
		let tmp_20 = m00 * m21
		let tmp_21 = m20 * m01
		let tmp_22 = m00 * m11
		let tmp_23 = m10 * m01
	
		let t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
				 (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31)
		let t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
				 (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31)
		let t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
				 (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31)
		let t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
				 (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21)
	
		const d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3)
	
		this.set(
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
		)
	}

	/// World Matrix
	// A matrix that takes the vertices of a model and moves them to world space

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
	translate(position) {
		// newX = x + tx
		// newY = y + ty
		// newZ = z + tz
		const t = position.elements
		tmp.set(
			1,    0,    0,    0,
			0,    1,    0,    0,
			0,    0,    1,    0,
		 	t[0], t[1], t[2], 1,
		)

		this.multiply(tmp)
	}

	xRotate(angleInRadians) {
		const c = Math.cos(angleInRadians)
		const s = Math.sin(angleInRadians)

		tmp.set(
			1,  0, 0, 0,
			0,  c, s, 0,
			0, -s, c, 0,
			0,  0, 0, 1,
		)

		this.multiply(tmp)
	}

	yRotate(angleInRadians) {
		const c = Math.cos(angleInRadians)
		const s = Math.sin(angleInRadians)

		tmp.set(
			c, 0, -s, 0,
			0, 1,  0, 0,
			s, 0,  c, 0,
			0, 0,  0, 1,
		)

		this.multiply(tmp)
	}

	zRotate(angleInRadians) {
		const c = Math.cos(angleInRadians)
		const s = Math.sin(angleInRadians)

		tmp.set(
			c, s, 0, 0,
		   -s, c, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1,
		)

		this.multiply(tmp)
	}
	
	rotate(rotation) {
		// unit circle
		this.xRotate(rotation.elements[0])
        this.yRotate(rotation.elements[1])
        this.zRotate(rotation.elements[2])
	}

	scale(scaling) {
		const s = scaling.elements

		// newX = x * sx
		// newY = y * sy
		// newZ = z * sz
		tmp.set(
			s[0],    0,    0,  0,
			   0, s[1],    0,  0,
			   0,    0, s[2],  0,
			   0,    0,    0,  1,
		)

		this.multiply(tmp)
	}

	/// Projection Matrix
	// A matrix that converts a frustum of space into clip space or some orthographic space into clip space.

	projection(width, height, depth) {
		// Note: This matrix flips the Y axis so 0 is at the top.
		this.set(
		2 / width,           0,         0, 0,
				0, -2 / height,         0, 0,
				0,           0, 2 / depth, 0,
			-1,           1,         0, 1,
		)
	}

	perspective(fieldOfViewInRadians, aspect, near, far) {
		const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians)
		const rangeInv = 1.0 / (near - far)

		this.set(
			f / aspect, 0, 0, 0,
			0, f, 0, 0,
			0, 0, (near + far) * rangeInv, -1,
			0, 0, near * far * rangeInv * 2, 0
		)
	}

	orthographic(left, right, bottom, top, near, far) {
		this.set(
			2 / (right - left), 0, 0, 0,
			0, 2 / (top - bottom), 0, 0,
			0, 0, 2 / (near - far), 0,
			(left + right) / (left - right),
			(bottom + top) / (bottom - top),
			(near + far) / (near - far),
			1,
		)
	}

	lookAt(position, target, yAxis) {
		const front = Vector3.normalize(Vector3.subtract(position, target))
		const right = Vector3.normalize(Vector3.cross(yAxis, front))
		const up = Vector3.normalize(Vector3.cross(front, right))

		this.set(
			right[0], right[1], right[2], 0,
			up[0], up[1], up[2], 0,
			front[0], front[1], front[2], 0,
			position[0], position[1], position[2], 1
		)
	}
}

const tmp = new Matrix4()