#!/usr/local/bin/bash
echo '====Start E2E===='

cd $project/tests/e2e/testcafe
git clean -xdf
npm i

export SITE_URL=$appUrl
export SCREENSHOTS_PATH=./screenshots

echo "Following options are used by E2E framework"
echo $SELENIUM_SERVER
echo $BROWSERS
echo $RC_PLATFORM_APP_KEY
echo $RC_PLATFORM_APP_SECRET
echo $SITE_URL
echo $ACTION
echo $BRANCH
echo $SCREENSHOTS_PATH

echo "gitlabActionType: ${gitlabActionType}"
echo "gitlabMergeRequestId: ${gitlabMergeRequestId}"
echo "gitlabMergeRequestState: ${gitlabMergeRequestState}"
echo "gitlabBranch: ${gitlabBranch}"
echo "gitlabSourceName: ${gitlabSourceName}"
echo "gitlabSourceBranch: ${gitlabSourceBranch}"
echo "gitlabTargetBranch: ${gitlabTargetBranch}"

export SELENIUM_SERVER=$SELENIUM_SERVER
export BROWSERS=$BROWSERS
export RC_PLATFORM_APP_KEY=$RC_PLATFORM_APP_KEY
export RC_PLATFORM_APP_SECRET=$RC_PLATFORM_APP_SECRET
export ACTION=$ACTION
export BRANCH=$BRANCH
export ENABLE_REMOTE_DASHBOARD=true

mkdir -p $SCREENSHOTS_PATH
npx ts-node create-run-id.ts
npx ts-node multi-run.ts
e2eResult=$?

export REPORT_URL=`cat ./reportUrl`
addEnv E2EResult="> **E2E Url**: $REPORT_URL"

echo "E2E Result: $e2eResult"
