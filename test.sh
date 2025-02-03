#!/bin/bash
set -e

./build.sh

TEST_PATH=test
SOURCE_PATH=src

echo "$(find "$SOURCE_PATH" -type f -name "*.cpp" -not -path "$SOURCE_PATH/main.cpp")"

g++ -Wall \
    $TEST_PATH/test.cpp \
    `find "$SOURCE_PATH" -type f -name "*.cpp" -not -path "$SOURCE_PATH/main.cpp"` \
    -O3 -o $TEST_PATH/test.out

echo "./$TEST_PATH/test.out"

./$TEST_PATH/test.out

valgrind --track-origins=yes --leak-check=full -s ./$TEST_PATH/test.out

exit 0

TESTS=("eff_init" "time_run" "glm")

cd test
for test in ${TESTS[@]}; do
    cd $test
    ./test.sh 5000
    cd ..
done
cd ..

exit 0