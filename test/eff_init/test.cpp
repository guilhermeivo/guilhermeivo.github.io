#include <iostream>
#include <fstream>
#include <chrono>
#if defined(__DEBUG__)
#include <string>
#endif

#define DEFAULT_VALUE 1.0f

int main() {
    std::ofstream version_file("data/version.txt");
    version_file << __cplusplus << std::endl;
    version_file.close();

    auto begin = std::chrono::high_resolution_clock::now();
    
    #if defined(TEST_1)
        float elements[16];
        for (int i = 0; i < 16; i++) {
            elements[i] = DEFAULT_VALUE;
        }
    #elif defined(TEST_2)
        float elements[16];
        elements[0]  = DEFAULT_VALUE; elements[1]  = DEFAULT_VALUE; elements[2]  = DEFAULT_VALUE; elements[3]  = DEFAULT_VALUE;
        elements[4]  = DEFAULT_VALUE; elements[5]  = DEFAULT_VALUE; elements[6]  = DEFAULT_VALUE; elements[7]  = DEFAULT_VALUE;
        elements[8]  = DEFAULT_VALUE; elements[9]  = DEFAULT_VALUE; elements[10] = DEFAULT_VALUE; elements[11] = DEFAULT_VALUE;
        elements[12] = DEFAULT_VALUE; elements[13] = DEFAULT_VALUE; elements[14] = DEFAULT_VALUE; elements[15] = DEFAULT_VALUE;
    #elif defined(TEST_3)
        float elements[16]{
            DEFAULT_VALUE,DEFAULT_VALUE,DEFAULT_VALUE,DEFAULT_VALUE,
            DEFAULT_VALUE,DEFAULT_VALUE,DEFAULT_VALUE,DEFAULT_VALUE,
            DEFAULT_VALUE,DEFAULT_VALUE,DEFAULT_VALUE,DEFAULT_VALUE,
            DEFAULT_VALUE,DEFAULT_VALUE,DEFAULT_VALUE,DEFAULT_VALUE};
    #elif defined(TEST_4)
        float elements[16] = {
            DEFAULT_VALUE,DEFAULT_VALUE,DEFAULT_VALUE,DEFAULT_VALUE,
            DEFAULT_VALUE,DEFAULT_VALUE,DEFAULT_VALUE,DEFAULT_VALUE,
            DEFAULT_VALUE,DEFAULT_VALUE,DEFAULT_VALUE,DEFAULT_VALUE,
            DEFAULT_VALUE,DEFAULT_VALUE,DEFAULT_VALUE,DEFAULT_VALUE
        };
    #endif
    
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << std::chrono::duration_cast<std::chrono::nanoseconds>(end-begin).count();

    #if defined(__DEBUG__)
        std::cout << "\n";
        for (int i = 0; i < 16; i++) {
            std::cout <<  std::to_string(elements[i]) << " ";
            if (!((i+1)%4)) std::cout << "\n";
        }
    #endif

    return 0;
}
