#!/usr/local/bin/bash

if [ "$gitlabTargetBranch" == "$gitlabSourceBranch" ]
then
  echo "Skip e2e for action : ${gitlabActionType}"
  exit 0
fi

echo '====Start E2E===='
cd $project/tests/e2e/testcafe
git clean -xdf -e node_modules
npm i

export HOST_NAME=`hostname -f`
export START_TIME=`TZ=UTC-8 date +'%F %T'`
export SITE_URL=$appUrl
export SCREENSHOTS_PATH=./screenshots
export SELENIUM_SERVER=$SELENIUM_SERVER
export RC_PLATFORM_APP_KEY=$RC_PLATFORM_APP_KEY
export RC_PLATFORM_APP_SECRET=$RC_PLATFORM_APP_SECRET
export ACTION="ON_MERGE"
export BRANCH="${gitlabBranch}"
export ENABLE_REMOTE_DASHBOARD=true
export DEBUG_MODE=false
export QUARANTINE_MODE=true
export RUN_NAME="[Pipeline][Merge][${START_TIME}][${gitlabBranch}][${gitlabMergeRequestLastCommit}]"


echo "Following environment variables are used by e2e tests to define test scope:"
echo $SELENIUM_SERVER
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