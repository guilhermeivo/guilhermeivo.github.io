#!/bin/bash
set -e

SOURCE_PATH=src
EXPORT_PATH=assets

WASI_SDK_PATH=`pwd`/dependencies/wasi-sdk
WABT_PATH=dependencies/wabt/build
CC="${WASI_SDK_PATH}/bin/clang --sysroot=${WASI_SDK_PATH}/share/wasi-sysroot"
CXX="${WASI_SDK_PATH}/bin/clang++ --sysroot=${WASI_SDK_PATH}/share/wasi-sysroot"
#$CC -D USE_WASM `ls $SOURCE_PATH/*.c` -o $EXPORT_PATH/main.wasm
$CXX -D USE_WASM \
    -fno-exceptions \
    `find "$SOURCE_PATH" -type f -name "*.cpp"` \
    `find "$SOURCE_PATH" -type f -name "*.c"` \
    -O3 -o $EXPORT_PATH/main.wasm

$WABT_PATH/wasm2wat $EXPORT_PATH/main.wasm -o $EXPORT_PATH/main.wat

# npm run build
bundle exec jekyll build

exit 0