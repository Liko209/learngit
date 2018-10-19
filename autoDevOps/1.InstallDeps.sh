#!/usr/local/bin/bash
echo '====Start Install Deps'

npm i --ci
npm run bt --hoist

exitCode=$?
if [ $exitCode -ne 0 ]; then
    exit 1
fi
