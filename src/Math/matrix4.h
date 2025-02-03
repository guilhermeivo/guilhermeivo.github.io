#ifndef MATRIX4_CLASS_HEADER
#define MATRIX4_CLASS_HEADER  

#define _USE_MATH_DEFINES
#include <string>
#include <cmath>
#include <ostream>
#include "real_t.h"
#include "vector3.h"
#include "../common/ansi.h"

#define MATRIX4_REPRESENTATION_OPENGL_ES
#if !(defined(MATRIX4_REPRESENTATION_OPENGL_ES) || defined(MATRIX4_REPRESENTATION_MATHEMATICAL))
#error It is necessary to define the representation mode of matrices
#endif

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
#define printMatrix(name) __printMatrix(std::cout, &name, #name)
constexpr int MATRIX4_LINES = 4;
constexpr int MATRIX4_COLUMNS = 4;

template<typename Type>
constexpr Type MATRIX4_DEFAULT_VALUE = static_cast<Type>(0.0);

template<typename Type = real_t>
struct matrix4 {
    Type elements[MATRIX4_LINES * MATRIX4_COLUMNS];

    matrix4() {
        identity();
    }

    matrix4(Type k) {
        for (int i = 0; i < MATRIX4_LINES * MATRIX4_COLUMNS; i++) {
            elements[i] = k;
        }
    };

    matrix4(Type* matrix) {
        for (int i = 0; i < MATRIX4_LINES * MATRIX4_COLUMNS; i++) {
            elements[i] = matrix[i];
        }
    };

    matrix4(
        Type n11, Type n12, Type n13, Type n14, 
        Type n21, Type n22, Type n23, Type n24, 
        Type n31, Type n32, Type n33, Type n34, 
        Type n41, Type n42, Type n43, Type n44) {
            elements[0]  = n11; elements[1]  = n12; elements[2]  = n13; elements[3]  = n14;
            elements[4]  = n21; elements[5]  = n22; elements[6]  = n23; elements[7]  = n24;
            elements[8]  = n31; elements[9]  = n32; elements[10] = n33; elements[11] = n34;
            elements[12] = n41; elements[13] = n42; elements[14] = n43; elements[15] = n44;
    };

    inline void identity() {
        set(1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1);
    }

    inline void unit() {
        set(1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1);
    }

    inline void zero() {
        set(0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0);
    }

    /// Projection Matrix
	// A matrix that converts a frustum of space into clip space or some orthographic space into clip space.
    
    inline void projection(Type width, Type height, Type depth) {
        set( 2/width,         0,       0, 0,
	               0, -2/height,       0, 0,
		           0,         0, 2/depth, 0,
		          -1,         1,       0, 1);
    }

    inline void perspective(Type fieldOfViewInRadians, Type aspect, Type near, Type far) {
        Type f = tan(M_PI * 0.5 - 0.5 * fieldOfViewInRadians);
	    Type rangeInv = 1 / (near - far);

        set(f/aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0);
    }

    inline void orthographic(Type left, Type right, Type bottom, Type top, Type near, Type far) {
        set(2 / (right - left), 0, 0, 0,
            0, 2 / (top - bottom), 0, 0,
            0, 0, 2 / (near - far), 0,
            (left + right) / (left - right),
            (bottom + top) / (bottom - top),
            (near + far) / (near - far),
            1);
    }

    inline void set(
        Type n11, Type n12, Type n13, Type n14, 
        Type n21, Type n22, Type n23, Type n24, 
        Type n31, Type n32, Type n33, Type n34, 
        Type n41, Type n42, Type n43, Type n44) {
            elements[0]  = n11; elements[1]  = n12; elements[2]  = n13; elements[3]  = n14;
            elements[4]  = n21; elements[5]  = n22; elements[6]  = n23; elements[7]  = n24;
            elements[8]  = n31; elements[9]  = n32; elements[10] = n33; elements[11] = n34;
            elements[12] = n41; elements[13] = n42; elements[14] = n43; elements[15] = n44;
    }

    inline matrix4<Type> operator+(const matrix4<Type>& matrix) const {
        return matrix4<Type>(
            elements[0] + matrix.elements[0], elements[1] + matrix.elements[1], elements[2] + matrix.elements[2], elements[3] + matrix.elements[3],
            elements[4] + matrix.elements[4], elements[5] + matrix.elements[5], elements[6] + matrix.elements[6], elements[7] + matrix.elements[7],
            elements[8] + matrix.elements[8], elements[9] + matrix.elements[9], elements[10] + matrix.elements[10], elements[11] + matrix.elements[11],
            elements[12] + matrix.elements[12], elements[13] + matrix.elements[13], elements[14] + matrix.elements[14], elements[15] + matrix.elements[15]);
    }

    inline matrix4<Type> operator-(const matrix4<Type>& matrix) const {
        return matrix4<Type>(
            elements[0] - matrix.elements[0], elements[1] - matrix.elements[1], elements[2] - matrix.elements[2], elements[3] - matrix.elements[3],
            elements[4] - matrix.elements[4], elements[5] - matrix.elements[5], elements[6] - matrix.elements[6], elements[7] - matrix.elements[7],
            elements[8] - matrix.elements[8], elements[9] - matrix.elements[9], elements[10] - matrix.elements[10], elements[11] - matrix.elements[11],
            elements[12] - matrix.elements[12], elements[13] - matrix.elements[13], elements[14] - matrix.elements[14], elements[15] - matrix.elements[15]);
    }

    inline matrix4<Type> operator*(const Type& k) const {
        matrix4<Type> mat(0.0_r);
        int i;
        for (i = 0; i < MATRIX4_LINES * MATRIX4_COLUMNS; i++) {
            mat.elements[i] = elements[i] * k;
        }
        return mat;
    }

    inline matrix4<Type> operator*(const matrix4<Type>& matrix) const {
        matrix4<Type> mat(0.0_r);
        int ib, jb, ja;
        /*
        * Solution found for multiplication using the OpenGL ES matrix pattern is to transform A*B into B*A
        * maintaining the mathematical matrix multiplication algorithm
        *
        *    b                 a                        result
        * ⎡ a  b  ⋯ ⎤     ⎡ e  f  ⋯ ⎤     ⎡ a*e+b*g+⋯  a*f+b*h+⋯  ⋯ ⎤
        * ⎢ c  d  ⋯ ⎥  *  ⎢ g  h  ⋯ ⎥  =  ⎢ c*e+d*g+⋯  c*f+d*g+⋯  ⋯ ⎥
        * ⎣ ⋮ ⋮  ⋱ ⎦     ⎣ ⋮ ⋮ ⋱ ⎦     ⎣    ⋮          ⋮       ⋱ ⎦
        *    4x4            4x4                           4x4
        */
        #ifdef MATRIX4_REPRESENTATION_OPENGL_ES
            for (ib = 0; ib < MATRIX4_LINES * MATRIX4_COLUMNS; ib += MATRIX4_LINES) { // line
                for (jb = 0; jb < MATRIX4_COLUMNS; jb++) { // column
                    float valueB = matrix.elements[ib + jb];
                    for (ja = 0; ja < MATRIX4_COLUMNS; ja++) { // column
                        float valueA = elements[jb * MATRIX4_LINES + ja];
                        mat.elements[ib + ja] += valueA * valueB;
                    }
                }
            }
        #else
            // TODO: make multiplication in mathematical representation
        #endif
        return mat;
    }

    /// World Matrix
    // A matrix that takes the vertices of a model and moves them to world space

    inline matrix4<Type> translate(const vector3<Type>& t) const {
        #ifdef MATRIX4_REPRESENTATION_OPENGL_ES
            matrix4<Type> aux{
                1.0f, 0.0f, 0.0f, 0.0f,
                0.0f, 1.0f, 0.0f, 0.0f,
                0.0f, 0.0f, 1.0f, 0.0f,
                t.x, t.y, t.z,    1};
        #else
            matrix4<Type> aux{
                1.0f, 0.0f, 0.0f, t.x,
                0.0f, 1.0f, 0.0f, t.y,
                0.0f, 0.0f, 1.0f, t.z,
                0.0f, 0.0f, 0.0f, 1.0f};
        #endif
        return (*this) * aux;
    }

    inline matrix4<Type> xRotate(const Type& angleInRadians) const {
        Type c = cos(angleInRadians);
	    Type s = sin(angleInRadians);
        #ifdef MATRIX4_REPRESENTATION_OPENGL_ES
            matrix4<Type> aux{
                1.0f,  0.0f, 0.0f, 0.0f,
                0.0f,     c,    s, 0.0f,
                0.0f,    -s,    c, 0.0f,
                0.0f,  0.0f, 0.0f, 1.0f};
        #else
            matrix4<Type> aux{
                1.0f, 0.0f,  0.0f, 0.0f,
                0.0f,    c,    -s, 0.0f,
                0.0f,    s,     c, 0.0f,
                0.0f, 0.0f,  0.0f, 1.0f};
        #endif
        return (*this) * aux;
    }

    inline matrix4<Type> yRotate(const Type& angleInRadians) const {
        Type c = cos(angleInRadians);
	    Type s = sin(angleInRadians);
        #ifdef MATRIX4_REPRESENTATION_OPENGL_ES
            matrix4<Type> aux{
                  c, 0.0f,    -s, 0.0f,
                0.0f, 1.0f,  0.0f, 0.0f,
                  s, 0.0f,     c, 0.0f,
                0.0f, 0.0f,  0.0f, 1.0f};
        #else
            matrix4<Type> aux{
                  c, 0.0f,    s, 0.0f,
                0.0f, 1.0f, 0.0f, 0.0f,
                  -s, 0.0f,    c, 0.0f,
                0.0f, 0.0f, 0.0f, 1.0f};
        #endif
        return (*this) * aux;
    }

    inline matrix4<Type> zRotate(const Type& angleInRadians) const {
        Type c = cos(angleInRadians);
	    Type s = sin(angleInRadians);
        #ifdef MATRIX4_REPRESENTATION_OPENGL_ES
            matrix4<Type> aux{
                   c,    s, 0.0f, 0.0f,
                  -s,    c, 0.0f, 0.0f,
                0.0f, 0.0f, 1.0f, 0.0f,
                0.0f, 0.0f, 0.0f, 1.0f};
        #else
            matrix4<Type> aux{
                   c,    -s, 0.0f, 0.0f,
		           s,     c, 0.0f, 0.0f,
                0.0f,  0.0f, 1.0f, 0.0f,
                0.0f,  0.0f, 0.0f, 1.0f};
        #endif
        return (*this) * aux;
    }

    inline matrix4<Type> rotate(const vector3<Type>& rotation) const {
        // unit circle
        matrix4<Type> aux;
        aux = aux.xRotate(rotation.x);
        aux = aux.yRotate(rotation.y);
        aux = aux.zRotate(rotation.z);
        return aux;
    }

    inline matrix4<Type> scale(const vector3<Type>& s) const {
        // newX = x * sx
		// newY = y * sy
		// newZ = z * sz
        matrix4<Type> aux{
             s.x, 0.0f, 0.0f, 0.0f,
            0.0f,  s.y, 0.0f, 0.0f,
            0.0f, 0.0f,  s.z, 0.0f,
            0.0f, 0.0f, 0.0f, 1.0f};
        return (*this) * aux;
    }

    friend std::ostream& operator<<(std::ostream& os, const matrix4<Type>& u) {
        int i, j, k, maxSize;
        maxSize = 0;
        for (i = 0; i < 4 * 4; i += 4) {
            for (j = 0; j < 4; j++) { 
                int actualSize = std::to_string(u.elements[i + j]).size();
                if (actualSize > maxSize) maxSize = actualSize;
            }
        }
        os << "\n";
        for (i = 0; i < 4 * 4; i += 4) {
            ansi::_SGR beginSgr{ansi::FOREGROUND_COLOR + ansi::GRAY};
            ansi::_SGR endSgr{ansi::RESET};
            std::string division = "|";
            if (i == 0) division = "⎡";
            else if (i == (4*4)-4) division = "⎣";
            os << beginSgr << division << endSgr << " ";
            for (j = 0; j < 4; j++) { 
                std::string res = std::to_string(u.elements[i + j]);
                int numberOfSpaces = maxSize - res.size();
                for (k = 0; k < numberOfSpaces; k++) {
                    os << " ";
                }
                os << std::to_string(u.elements[i + j]) << " ";
            }
            if (i == 0) division = "⎤";
            else if (i == (4*4)-4) division = "⎦";
            os << beginSgr << division << endSgr;
            os << "\n";
        }
        return os;  
    }
};

namespace opmat4 {
    template<typename Type>
    inline matrix4<Type> identity() {
        return matrix4<Type>{
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        };
    }

    template<typename Type>
    inline matrix4<Type> unit() {
        return matrix4<Type>{
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,
        };
    }

    template<typename Type>
    inline matrix4<Type> zero() {
        return matrix4<Type>{
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
        };
    }

    // TODO: make invert method to mathematical representation
    template<typename Type>
    #ifdef FORCE_INLINE
    inline 
    #endif
    matrix4<Type> invert(const matrix4<Type>& matrix) {
        float m00 = matrix.elements[0 * 4 + 0]; float m01 = matrix.elements[0 * 4 + 1]; float m02 = matrix.elements[0 * 4 + 2]; float m03 = matrix.elements[0 * 4 + 3];
        float m10 = matrix.elements[1 * 4 + 0]; float m11 = matrix.elements[1 * 4 + 1]; float m12 = matrix.elements[1 * 4 + 2]; float m13 = matrix.elements[1 * 4 + 3];
        float m20 = matrix.elements[2 * 4 + 0]; float m21 = matrix.elements[2 * 4 + 1]; float m22 = matrix.elements[2 * 4 + 2]; float m23 = matrix.elements[2 * 4 + 3];
        float m30 = matrix.elements[3 * 4 + 0]; float m31 = matrix.elements[3 * 4 + 1]; float m32 = matrix.elements[3 * 4 + 2]; float m33 = matrix.elements[3 * 4 + 3];
        
        float tmp_0  = m22 * m33;
        float tmp_1  = m32 * m23;
        float tmp_2  = m12 * m33;
        float tmp_3  = m32 * m13;
        float tmp_4  = m12 * m23;
        float tmp_5  = m22 * m13;
        float tmp_6  = m02 * m33;
        float tmp_7  = m32 * m03;
        float tmp_8  = m02 * m23;
        float tmp_9  = m22 * m03;
        float tmp_10 = m02 * m13;
        float tmp_11 = m12 * m03;
        float tmp_12 = m20 * m31;
        float tmp_13 = m30 * m21;
        float tmp_14 = m10 * m31;
        float tmp_15 = m30 * m11;
        float tmp_16 = m10 * m21;
        float tmp_17 = m20 * m11;
        float tmp_18 = m00 * m31;
        float tmp_19 = m30 * m01;
        float tmp_20 = m00 * m21;
        float tmp_21 = m20 * m01;
        float tmp_22 = m00 * m11;
        float tmp_23 = m10 * m01;
        
        float t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
                    (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        float t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
                    (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        float t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
                    (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        float t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
                    (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);
        
        float d = 1.0f / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

        return matrix4<Type>{
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
                    (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
        };
    }

    template<typename Type>
    inline matrix4<Type> lookAt(const vector3<Type>& position, const vector3<Type>& target, const vector3<Type>& yAxis) {
        vector3<Type> front = position - target;
        front = opvec3::normalize(front);
        vector3<Type> right = yAxis ^ front;
        right = opvec3::normalize(right);
        vector3<Type> up = front ^ right;
        up = opvec3::normalize(up);

        return matrix4<Type>{
            right.x, right.y, right.z, 0,
            up.x, up.y, up.z, 0,
            front.x, front.y, front.z, 0,
            position.x, position.y, position.z, 1};
    }
}

template<typename Type>
void __printMatrix(std::ostream& os, matrix4<Type>* matrix, std::string description) {
    int i, j, k, maxSize, initialSpaces;
    maxSize = 0;
    initialSpaces = description.size();
    for (i = 0; i < 4 * 4; i += 4) {
        for (j = 0; j < 4; j++) { 
            int actualSize = std::to_string(matrix->elements[i + j]).size();
            if (actualSize > maxSize) maxSize = actualSize;
        }
    }
    os << "\n";
    for (i = 0; i < 4 * 4; i += 4) {
        if (initialSpaces != 0) {
            if (i == 4) {
                os << description << " = ";
            } else {
                for (k = 0; k < initialSpaces + 3; k++) {
                    os << " ";
                }
            }
        }
        ansi::_SGR beginSgr{ansi::FOREGROUND_COLOR + ansi::GRAY};
        ansi::_SGR endSgr{ansi::RESET};
        std::string division = "|";
        if (i == 0) division = "⎡";
        else if (i == (4*4)-4) division = "⎣";
        os << beginSgr << division << endSgr << " ";
        for (j = 0; j < 4; j++) { 
            std::string res = std::to_string(matrix->elements[i + j]);
            int numberOfSpaces = maxSize - res.size();
            for (k = 0; k < numberOfSpaces; k++) {
                os << " ";
            }
            os << std::to_string(matrix->elements[i + j]) << " ";
        }
        if (i == 0) division = "⎤";
        else if (i == (4*4)-4) division = "⎦";
        os << beginSgr << division << endSgr;
        os << "\n";
    }
};

#endif /* MATRIX4_CLASS_HEADER */