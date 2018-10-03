#!/usr/local/bin/bash
echo '====Start E2E'

cd $project/tests/e2e/testcafe
git clean -xdf
npm i

export SITE_URL=$appUrl
export SCREENSHOTS_PATH=./screenshots
# SELENIUM_SERVER is setup in jenkins as we may want to change it any time without update the code
echo $SELENIUM_SERVER
echo $BROWSERS
echo $RC_PLATFORM_APP_KEY
echo $RC_PLATFORM_APP_SECRET
echo $SITE_URL
echo $ACTION
echo $BRANCH
echo $SCREENSHOTS_PATH

mkdir -p $SCREENSHOTS_PATH
npx ts-node multi-run.ts
rm -r $SCREENSHOTS_PATH

e2eResult=$?

xmlResult=$project/tests/e2e/testcafe/allure/allure-results
htmlResult=$project/tests/e2e/testcafe/allure/html-results
allure generate $xmlResult -o $htmlResult

localFolder=$htmlResult
remoteFolder=e2e/$subDomain/$BUILD_NUMBER
syncFolderToServer $localFolder $remoteFolder

E2EUrl=https://e2e.fiji.gliprc.com/$subDomain/$BUILD_NUMBER/index.html
addEnv E2EResult="> **E2E Url**: $E2EUrl"

echo "E2E Result: $e2eResult"
