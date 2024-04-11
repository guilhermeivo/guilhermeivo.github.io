export default class Matrix4 {
    constructor() {
        this.elements = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]
    }

    set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
        const te = this.elements

		te[0] = n11; te[4] = n12; te[8] = n13; te[12] = n14;
		te[1] = n21; te[5] = n22; te[9] = n23; te[13] = n24;
		te[2] = n31; te[6] = n32; te[10] = n33; te[14] = n34;
		te[3] = n41; te[7] = n42; te[11] = n43; te[15] = n44;
    }

    multiply(m) {
        this.multiplyMatrices(this, m)
	}

    multiplyMatrices(a, b) {
		const ae = a.elements
		const be = b.elements
		const te = this.elements

		const a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12]
		const a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13]
		const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14]
		const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15]

		const b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12]
		const b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13]
		const b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14]
		const b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15]

		te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41
		te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42
		te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43
		te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44

		te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41
		te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42
		te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43
		te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44

		te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41
		te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42
		te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43
		te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44

		te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41
		te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42
		te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43
		te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44
	}

    invert() {
        const te = this.elements

		m00 = te[0 * 4 + 0]; m01 = te[0 * 4 + 1]; m02 = te[0 * 4 + 2]; m03 = te[0 * 4 + 3]
		m10 = te[1 * 4 + 0]; m11 = te[1 * 4 + 1]; m12 = te[1 * 4 + 2]; m13 = te[1 * 4 + 3]
		m20 = te[2 * 4 + 0]; m21 = te[2 * 4 + 1]; m22 = te[2 * 4 + 2]; m23 = te[2 * 4 + 3]
		m30 = te[3 * 4 + 0]; m31 = te[3 * 4 + 1]; m32 = te[3 * 4 + 2]; m33 = te[3 * 4 + 3]
        
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
	
        te[0] = d * t0
        te[1] = d * t1
        te[2] = d * t2
        te[3] = d * t3
        te[4] = d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) - (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30))
        te[5] = d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) - (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30))
        te[6] = d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) - (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30))
        te[7] = d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) - (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20))
        te[8] = d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33))
        te[9] = d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33))
        te[10] = d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33))
        te[11] = d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23))
        te[12] = d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22))
        te[13] = d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02))
        te[14] = d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12))
        te[15] = d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
	}

	scale(v) {

		const te = this.elements
		const x = v.x, y = v.y, z = v.z

		te[0] *= x; te[4] *= y; te[8] *= z
		te[1] *= x; te[5] *= y; te[9] *= z
		te[2] *= x; te[6] *= y; te[10] *= z
		te[3] *= x; te[7] *= y; te[11] *= z

		return this
	}
}