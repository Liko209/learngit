#!/bin/bash
echo '====Start Install Deps'

/usr/bin/npm i
/usr/bin/npm run postinstall

exitCode=$?
if [ $exitCode -ne 0 ]; then
  exit 1
fi
