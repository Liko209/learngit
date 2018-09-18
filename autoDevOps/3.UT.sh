#!/usr/local/bin/bash
echo '====Start UT'

CI=true node $project/scripts/test.js --env=jsdom 2>&1 | awk '/Summary of all failing/,0'

if [gitlabActionType = 'MERGE']
    npm run test:cover && npm run raise-coverage && git add config/coverage-threshold.json
    if [ $? -eq 1 ]; then
        echo "Coverage Not met"
         coverageFolder=coverage/$subDomain/$BUILD_NUMBER
        syncFolderToServer $project/coverage/ $coverageFolder
        UTUrl=https://coverage.fiji.gliprc.com/$subDomain/$BUILD_NUMBER/lcov-report/index.html
        addEnv UTResult="> **UT Coverage Failed. Report Url**: $UTUrl"
    else
        addEnv UTResult="> **UT Coverage Success. Report Url**: $UTUrl"
        # git commit -m "feat(CICD): raised coverage test threshold"
        # git push
    fi
fi