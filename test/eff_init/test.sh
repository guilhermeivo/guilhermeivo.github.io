#!/bin/bash
set -e

source ../include.bash "eff_init"

max=${1:-5000}

sleep_time=0.01
data_path=data
levels=("0" "3" "s")
tests=("TEST_1" "TEST_2" "TEST_3" "TEST_4")

exec_test() {
    test=$1
    level=$2
    filename="$1__$2.dat"
    g++ -O$level -D $test test.cpp 
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

echo "size" > $data_path/size.dat
for test in ${tests[@]}; do
    for level in ${levels[@]}; do
        g++ -O$level -D $test test.cpp

        memory=$(ls -l a.out | cut -d" " -f5)
        echo "$memory " >> $data_path/size.dat
    done
done
echo "" >> $data_path/size.dat
rm -f a.out

for level in ${levels[@]}; do
    for test in ${tests[@]}; do
        exec_test $test $level
    done
done

rm -f a.out

mkdir -p generated
R -e "source('script.R')"

exit 0