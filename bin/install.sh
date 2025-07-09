#!/bin/bash
set -e

bundle install

mkdir -p dependencies
cd dependencies

# wasi-sdk
[ -e wasi-sdk ] && rm -r wasi-sdk

WASI_OS=linux
WASI_ARCH=x86_64
WASI_VERSION=24
WASI_VERSION_FULL=${WASI_VERSION}.0
wget https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-${WASI_VERSION}/wasi-sdk-${WASI_VERSION_FULL}-${WASI_ARCH}-${WASI_OS}.tar.gz
tar xvf wasi-sdk-${WASI_VERSION_FULL}-${WASI_ARCH}-${WASI_OS}.tar.gz
rm wasi-sdk-${WASI_VERSION_FULL}-${WASI_ARCH}-${WASI_OS}.tar.gz
mv wasi-sdk-${WASI_VERSION_FULL}-${WASI_ARCH}-${WASI_OS} wasi-sdk

# wabt
[ -e wabt ] && sudo rm -r wabt

git clone --recursive https://github.com/WebAssembly/wabt
cd wabt
git submodule update --init

mkdir build
cd build
cmake ..
cmake --build .

npm install

exit 0