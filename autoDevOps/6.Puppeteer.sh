#!/usr/local/bin/bash
echo '====Start Puppeteer'

cd $project/tests/puppeteer

yarn

echo $appUrl

appUrl=$appUrl npm run app

result=$?

reportFiles=$project/tests/puppeteer/report

localFolder=$reportFiles
remoteFolder=puppeteer/$subDomain/$BUILD_NUMBER
syncFolderToServer $localFolder $remoteFolder

Url=https://e2e.fiji.gliprc.com/$subDomain/$BUILD_NUMBER/index.html
addEnv PuppeteerResult="> **Puppeteer Url**: $Url"

echo "Result: $result"
