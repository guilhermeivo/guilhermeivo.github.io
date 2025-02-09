#ifndef ANSI_HEADER
#define ANSI_HEADER

#include <ostream>
#include "../wasm.h"

namespace ansi {
    enum ControlSequenceIntroducer {
    CURSOR_UP = 'A',
    CURSOR_DOWN = 'B',
    CURSOR_FORWARD = 'C',
    CURSOR_BACK = 'D',

    #ifndef ANSI_SYS
        CURSOR_NEXT_LINE = 'E',
        CURSOR_PREVIOUS_LINE = 'F',
        CURSOR_HORIZONTAL_ABSOLUTE = 'G',
    #endif /*ANSI_SYS*/	

        CURSOR_POSITION = 'H',
        ERASE_DISPLAY = 'J',
        ERASE_LINE = 'K',

    #ifndef ANSI_SYS			            
        SCROLL_UP = 'S',
        SCROLL_DOWN = 'T',
    #endif /*ANSI_SYS*/

        SELECT_GRAPHIC_RENDITION = 'm',
        SAVE_CURRENT_CURSOR_POSITION = 's',
        RESTORE_CURRENT_CURSOR_POSITION = 'u',
        SHOWS_CURSOR = 'h',
        HIDE_CURSOR = 'l'
    };

    enum SelectGraphicRenditionParameters {
        RESET = 0,
        BOLD = 1,
        FAINT = 2,
        ITALIC = 3,
        UNDERLINE = 4,
        SLOW_BLINK = 5,
        RAPID_BLINK = 6,
        SWAP_COLOR = 7,
        CONCEAL = 8,
        CROSSED_OUT = 9,
        PRIMARY_FONT = 10,
        FRAKTUR = 20,
        RESET_BOLD = 21,
        RESET_COLOR = 22,
        RESET_ITALIC = 23,
        RESET_UNDERLINE = 24,
        RESET_BLINKING = 25,
        RESET_INVERSE = 27,
        REVEAL = 28,
        RESET_STRIKETHROUGH = 29,
        FOREGROUND_COLOR = 30,
        DEFAULT_FOREGROUND_COLOR = 39,
        BACKGROUND_COLOR = 40,
        DEFAULT_BACKGROUND_COLOR = 49,
        DISABLE_PROPORTIONAL_SPCING = 50,
        FRAMED = 51,
        ENCIRCLED = 52,
        OVERLINED = 53,
        RESET_FRAMED = 54,
        RESET_OVERLINED = 55,
        FOREGROUND_BRIGHT = 90,
        BACKGROUND_BRIGHT = 100
    };

    enum Color3Bit {
        BLACK,
        RED, 
        GREEN,
        YELLOW,
        BLUE,
        MAGENTA,
        CYAN,
        WHITE,
        GRAY = 60
    }; 

    struct _CSI {
        int n;
        char m;
    };

    struct _SGR : _CSI {
        char m = SELECT_GRAPHIC_RENDITION;
    };

    std::ostream& operator<<(std::ostream& os, const _CSI& csi) {
        #ifndef USE_WASM
            os << "\033[" << csi.n << csi.m;
        #endif
        return os;
    }

    std::ostream& operator<<(std::ostream& os, const _SGR& sgr) {
        #ifndef USE_WASM
            os << "\033[" << sgr.n << sgr.m;
        #endif
        return os;
    }
}

#endif /* ANSI_HEADER */