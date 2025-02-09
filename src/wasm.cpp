#include "wasm.h"

#ifdef USE_WASM
    EXPORT("_exit")
    void m_exit() {
        // Call atexit functions, destructors, stdio cleanup, etc
        __wasm_call_dtors();
    }
#endif