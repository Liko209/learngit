#!/usr/local/bin/bash

if [ "MERGE" != "${gitlabActionType}" ]
then
  echo "Skip e2e for action : ${gitlabActionType}"
  exit 0
fi

echo '====Start E2E===='
cd $project/tests/e2e/testcafe
git clean -xdf -e node_modules
npm i

export SITE_URL=$appUrl
export SCREENSHOTS_PATH=./screenshots
export SELENIUM_SERVER=$SELENIUM_SERVER
export BROWSERS=$BROWSERS
export RC_PLATFORM_APP_KEY=$RC_PLATFORM_APP_KEY
export RC_PLATFORM_APP_SECRET=$RC_PLATFORM_APP_SECRET
export ACTION="ON_${gitlabActionType}"
export BRANCH="${gitlabBranch}"
export ENABLE_REMOTE_DASHBOARD=true

echo "Following environment variables are used by e2e tests to define test scope:"
echo $SELENIUM_SERVER
echo $BROWSERS
echo $RC_PLATFORM_APP_KEY
echo $RC_PLATFORM_APP_SECRET
echo $SITE_URL
echo $ACTION
echo $BRANCH
echo $SCREENSHOTS_PATH

mkdir -p $SCREENSHOTS_PATH
npx ts-node create-run-id.ts
npx ts-node multi-run.ts
e2eResult=$?

export REPORT_URL=`cat ./reportUrl`
addEnv E2EResult="> **E2E Url**: $REPORT_URL"

echo "E2E Result: $e2eResult"
exit $e2eResult