#!/bin/bash
set -e

source ../include.bash "time_run"

max=${1:-5000}

SOURCE_PATH=src

WASI_SDK_PATH=`pwd`/../../dependencies/wasi-sdk
CXX="${WASI_SDK_PATH}/bin/clang++ --sysroot=${WASI_SDK_PATH}/share/wasi-sysroot"
$CXX -D USE_WASM test.cpp ../../src/wasm.cpp -O3 -o main.wasm

tests=("javascript" "wasm")
data_path=data

mkdir -p data

echo "$max" > $data_path/max.txt

for test in ${tests[@]}; do
    filename="$test.dat"
    echo "time" > $data_path/$filename
    for i in $(seq $max)
    do
        node test.js > output.txt
        sed -i 's/ms//g' output.txt
        sed -i 's/ //g' output.txt
        test_data=$(grep "$test" output.txt | cut -d':' -f2)
        echo "$test_data " >> $data_path/$filename
    done
    echo "" >> $data_path/$filename
done

rm -f output.txt

echo "$(node --version)" > $data_path/version.txt

mkdir -p generated
R -e "source('script.R')"

exit 0
