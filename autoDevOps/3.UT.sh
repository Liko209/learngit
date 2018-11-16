#!/usr/local/bin/bash
echo '====Start UT'

yarn run test:cover

exitCode=$?
if [ $exitCode -ne 0 ]; then
    addEnv BUILD_ERROR=1
fi

coverageFolder=coverage/$subDomain/$BUILD_NUMBER
syncFolderToServer $project/coverage/ $coverageFolder

UTUrl=https://coverage.fiji.gliprc.com/$subDomain/$BUILD_NUMBER/lcov-report/index.html
addEnv UTResult="> **UT Coverage Report Url**: $UTUrl"
