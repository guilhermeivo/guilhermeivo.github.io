#ifndef VECTOR3_CLASS_HEADER
#define VECTOR3_CLASS_HEADER  

#include <string>
#include <cmath>
#include <ostream>
#include "real_t.h"
#include "../common/ansi.h"
#define printVector(name) __printVector(std::cout, name, #name)

constexpr int VECTOR3_SIZE = 3;

template<typename Type>
constexpr Type VECTOR3_DEFAULT_VALUE = static_cast<Type>(0.0);

template<typename Type = real_t>
struct vector3 {
    Type x, y, z;

    vector3() : x(VECTOR3_DEFAULT_VALUE<Type>), y(VECTOR3_DEFAULT_VALUE<Type>), z(VECTOR3_DEFAULT_VALUE<Type>) {};
    vector3(Type k) : x(k), y(k), z(k) {};
    vector3(Type x, Type y, Type z) : x(x), y(y), z(z) {};

    inline vector3<Type> operator+(const Type& k) const {
        return vector3<Type>(x + k, y + k, z + k);
    }

    inline vector3<Type> operator+(const vector3<Type>& u) const {
        return vector3<Type>(x + u.x, y + u.y, z + u.z);
    }

    inline vector3<Type> operator-(const Type& k) const {
        return vector3<Type>(x - k, y - k, z - k);
    }

    inline vector3<Type> operator-(const vector3<Type>& u) const {
        return vector3<Type>(x - u.x, y - u.y, z - u.z);
    }

    inline vector3<Type> operator*(const Type& k) const {
        return vector3<Type>(x * k, y * k, z * k);
    }

    inline vector3<Type> operator/(const Type& k) const {
        return vector3<Type>(x / k, y / k, z / k);
    }

    inline vector3<Type> operator^(const vector3<Type>& u) const { // cross
        return vector3<Type>(
            y * u.z - z * u.y,
            z * u.x - x * u.z,
            x * u.y - y * u.x
        );
    }

    inline const Type operator[](int index) const {
        return (Type)*(&x + index);
    }

    inline Type magnitude() const {
        return std::sqrt((x * x) + (y * y) + (z * z));
    }

    friend std::ostream& operator<<(std::ostream& os, const vector3<Type>& u) {
        ansi::_SGR beginSgr{ansi::FOREGROUND_COLOR + ansi::GRAY};
        ansi::_SGR endSgr{ansi::RESET};
        os << beginSgr << "[ " << endSgr <<
            std::to_string(u.x) << " " << 
            std::to_string(u.y) << " " << 
            std::to_string(u.z) << 
            beginSgr << " ]" << endSgr;
        return os;  
    }
};

namespace opvec3 {
    template<typename Type>
    inline vector3<Type> operator+(const Type& k, const vector3<Type>& u) {
        return vector3<Type>(k + u.x, k + u.y, k + u.z);
    }

    template<typename Type>
    inline vector3<Type> operator-(const Type& k, const vector3<Type>& u) {
        return vector3<Type>(k - u.x, k - u.y, k - u.z);
    }

    template<typename Type>
    inline vector3<Type> operator*(const Type& k, const vector3<Type>& u) {
        return vector3<Type>(k * u.x, k * u.y, k * u.z);
    }

    template<typename Type>
    inline vector3<Type> operator/(const Type& k, const vector3<Type>& u) {
        return vector3<Type>(k / u.x, k / u.y, k / u.z);
    }

    template<typename Type>
    inline vector3<Type> normalize(const vector3<Type>& u) {
        Type magnitude = u.magnitude();
        return u / magnitude;
    }
}

template<typename Type>
void __printVector(std::ostream& os, const vector3<Type>& vector, std::string description) {
    os << description << " = " << vector << "\n";
}

#endif /* VECTOR3_CLASS_HEADER */