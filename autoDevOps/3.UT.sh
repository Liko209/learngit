#!/usr/local/bin/bash
echo '====Start UT'

CI=true node $project/scripts/test.js --env=jsdom 2>&1 | awk '/Summary of all failing/,0'

if [ "$gitlabActionType" == 'MERGE' ]; then
    npm run test:cover && npm run raise-coverage && git add config/coverage-threshold.json && git stash
    if [ $? -eq 1 ]; then
        echo "Coverage Not met"
        coverageFolder=coverage/$subDomain/$BUILD_NUMBER
        syncFolderToServer $project/coverage/ $coverageFolder
        UTUrl=https://coverage.fiji.gliprc.com/$subDomain/$BUILD_NUMBER/lcov-report/index.html
        addEnv UTResult="> **UT Coverage Failed. Report Url**: $UTUrl"
        exit 1
    else
        addEnv UTResult="> **UT Coverage Success."
    fi
fi