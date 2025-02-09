// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
// https://learn.microsoft.com/en-us/cpp/cpp/data-type-ranges
export const int = Int32Array
export const uint = Uint32Array
export const char = Int8Array
export const uchar = Uint8Array
export const short = Int16Array
export const ushort = Uint16Array
export const long = BigInt64Array
export const ulong = BigUint64Array

export const float = Float32Array
export const double = Float64Array

/**
 * 
 * @param {int|uint|char|uchar|short|ushort|long|ulong|float|double} type
 */
export function sizeof(type) {
    return type.BYTES_PER_ELEMENT
}