#!/bin/bash         

echo "building local server"

yarn ng build
echo "starting local server.."
yarn start
