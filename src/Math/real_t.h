#ifndef REAL_T_HEADER
#define REAL_T_HEADER  

/**
 * @brief Tipagem padrão usada no programa
 */
using real_t = float;

constexpr real_t operator""_r(unsigned long long int n) {
    return static_cast<real_t>(n);
}

constexpr real_t operator""_r(long double n) {
    return static_cast<real_t>(n);
}

#endif /* REAL_T_HEADER */