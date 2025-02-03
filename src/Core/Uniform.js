export class UniformType {
    static #_FLOAT = 0;
    static #_VEC2 = 1;
    static #_VEC3 = 2;
    static #_VEC4 = 3;
    static #_MAT2 = 4;
    static #_MAT3 = 5;
    static #_MAT4 = 6;
    static #_INT = 7;
    static #_IVEC2 = 8;
    static #_IVEC3 = 9;
    static #_IVEC4 = 10;
    static #_UINT = 11;
    static #_UVEC2 = 12;
    static #_UVEC3 = 13;
    static #_UVEC4 = 14;
    static #_SAMPLER = 15;

    static get FLOAT() { return this.#_FLOAT; }
    static get VEC2() { return this.#_VEC2; }
    static get VEC3() { return this.#_VEC3; }
    static get VEC4() { return this.#_VEC4; }
    static get MAT2() { return this.#_MAT2; }
    static get MAT3() { return this.#_MAT3; }
    static get MAT4() { return this.#_MAT4; }
    static get INT() { return this.#_INT; }
    static get IVEC2() { return this.#_IVEC2; }
    static get IVEC3() { return this.#_IVEC3; }
    static get IVEC4() { return this.#_IVEC4; }
    static get UINT() { return this.#_UINT; }
    static get UVEC2() { return this.#_UVEC2; }
    static get UVEC3() { return this.#_UVEC3; }
    static get UVEC4() { return this.#_UVEC4; }
    static get SAMPLER() { return this.#_SAMPLER; }

    static to_string(uniformType) {
        switch (uniformType) {
            case UniformType.FLOAT: return "Float"
            case UniformType.VEC2: return "Vec2"
            case UniformType.VEC3: return "Vec3"
            case UniformType.VEC4: return "Vec4"
            case UniformType.MAT2: return "Mat2"
            case UniformType.MAT3: return "Mat3"
            case UniformType.MAT4: return "Mat4"
            case UniformType.INT: return "Int"
            case UniformType.IVEC2: return "IVec2"
            case UniformType.IVEC3: return "IVec3"
            case UniformType.IVEC4: return "IVec4"
            case UniformType.UINT: return "UInt"
            case UniformType.UVEC2: return "UVec2"
            case UniformType.UVEC3: return "UVec3"
            case UniformType.UVEC4: return "UVec4"
            case UniformType.SAMPLER: return "Sampler"
        }
        return ""
    }
}

export class Uniform {
    /**
     * @param {UniformType} type 
     */
    constructor(location, value, type) {
        this.location = location
        this.value = value
        this.type = type
    }
}