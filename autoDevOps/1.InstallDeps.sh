#!/bin/bash
echo '====Start Install Deps'

npm i
npm run postinstall

exitCode=$?
if [ $exitCode -ne 0 ]; then
  exit 1
fi