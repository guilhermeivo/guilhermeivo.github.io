extern "C" {
    #ifdef USE_WASM
        #include <wasi/api.h>
        extern void __wasm_call_ctors(void);
        extern void __wasm_call_dtors(void);

        #define EXPORT(NAME) \
            __attribute__((export_name(NAME)))

        EXPORT("_exit") void m_exit();
    
    #else
        #define EXPORT(NAME)
    #endif
};