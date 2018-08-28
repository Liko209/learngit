#!/bin/bash
echo '====Start UT'

CI=true node $project/scripts/test.js --env=jsdom 2>&1 | awk '/Summary of all failing/,0'

yarn run test:cover

coverageFolder=coverage/$subDomain/$BUILD_NUMBER
syncFolderToServer $project/coverage/ $coverageFolder

UTUrl=https://coverage.fiji.gliprc.com/$subDomain/$BUILD_NUMBER/lcov-report/index.html
addEnv UTResult="> **UT Coverage Report Url**: $UTUrl"
