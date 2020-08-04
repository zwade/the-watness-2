#!/bin/bash

docker build . -t watness-solver
docker run -it watness-solver