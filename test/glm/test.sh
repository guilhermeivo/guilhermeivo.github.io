#!/bin/bash
set -e

source ../include.bash "glm"

max=${1:-5000}

data_path=data
tests=("USE_GLM" "USE_DEFAULT")

if [ ! -d "/usr/include/glm/" ]; then
    echo "/usr/include/glm/ does not exist. (If there is, remove this check)"
    echo "Tip: apt install libglm-dev"
fi

exec_test() {
    test=$1
    level=3
    filename="$test.dat"
    g++ -O$level -D$test test.cpp 
    echo "time" > $data_path/$filename
    for i in $(seq $max)
    do
        echo "$(./a.out) " >> $data_path/$filename
        #sleep 0.01
    done
    echo "" >> $data_path/$filename
}

mkdir -p data

echo "$max" > $data_path/max.txt

for test in ${tests[@]}; do
    exec_test $test
done
rm -f a.out

mkdir -p generated
R -e "source('script.R')"

exit 0