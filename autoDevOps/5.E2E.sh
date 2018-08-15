echo '====Start E2E'

cd $project/tests/e2e/testcafe

yarn

# SELENIUM_SERVER is setup in jenkins as we may want to change it any time without update the code
echo $SELENIUM_SERVER
npm run testcafe selenium:chrome ./fixtures/*

localFolder=$project/tests/e2e/testcafe/allure/allure-results
remoteFolder=e2e/$subDomain/$BUILD_NUMBER
syncFolderToServer $localFolder $remoteFolder

addEnv E2EUrl=https://e2e.fiji.gliprc.com/$subDomain/$BUILD_NUMBER/index.html

# TODO: exit 1 while failed