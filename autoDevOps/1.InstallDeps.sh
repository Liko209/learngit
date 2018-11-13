#!/usr/local/bin/bash
echo '====Start Install Deps'

npm i

exitCode=$?
if [ $exitCode -ne 0 ]; then
    addEnv BUILD_ERROR=1
fi
