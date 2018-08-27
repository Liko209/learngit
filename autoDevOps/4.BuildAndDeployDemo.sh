#!/bin/bash
echo '====Start Build demo'
yarn build:demo

syncFolderToServer $project/demo/build $subDomain