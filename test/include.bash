#!/bin/bash
set -e

title=$1

printf "\n\n"
printf "=%.0s" $(seq 1 $(tput cols))
printf "\n\n"
printf "%*s$title" $(( ($(tput cols) / 2) - ${#title} ))
printf "\n\n"
printf "=%.0s" $(seq 1 $(tput cols))
printf "\n\n"