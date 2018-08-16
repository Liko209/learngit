echo '====Start SA'
rm -rf $project/lint
mkdir -p $project/lint
appLint=$(yarn run lint --project $project/application --out $project/lint/application.txt)
demoLint=$(yarn run lint --project $project/demo --out $project/lint/demo.txt)
foundationLint=$(yarn run lint --project $project/packages/foundation --out $project/lint/foundation.txt)
sdkLint=$(yarn run lint --project $project/packages/sdk --out $project/lint/sdk.txt)

hasLintError=0

lintFolder=lint/$subDomain/$BUILD_NUMBER

applicationLintError=$(<lint/application.txt)
if [ "$applicationLintError" ]; then
  echo "<a href=https://lint.fiji.gliprc.com/$subDomain/$BUILD_NUMBER/application.txt>Application Lint Result</a><br />" >> $project/lint/index.html
  cat $project/lint/application.txt >> $project/lint/index.txt
  hasLintError=1
fi

demoLintError=$(<lint/demo.txt)
if [ "$demoLintError" ]; then
  echo "<a href=https://lint.fiji.gliprc.com/$subDomain/$BUILD_NUMBER/demo.txt>demo Lint Result</a><br />" >> $project/lint/index.html
  cat $project/lint/demo.txt >> $project/lint/index.txt
  hasLintError=1
fi

foundationLintError=$(<lint/foundation.txt)
if [ "$foundationLintError" ]; then
  echo "<a href=https://lint.fiji.gliprc.com/$subDomain/$BUILD_NUMBER/foundation.txt>Foundation Lint Result</a><br />" >> $project/lint/index.html
  cat $project/lint/foundation.txt >> $project/lint/index.txt
  hasLintError=1
fi

sdkLintError=$(<lint/sdk.txt)
if [ "$sdkLintError" ]; then
  echo "<a href=https://lint.fiji.gliprc.com/$subDomain/$BUILD_NUMBER/sdk.txt>SDK Lint Result</a><br />" >> $project/lint/index.html
  cat $project/lint/sdk.txt >> $project/lint/index.txt
  hasLintError=1
fi

if [ "$hasLintError" ]; then
  echo '<pre>' >> $project/lint/index.html
  cat $project/lint/index.txt >> $project/lint/index.html
  echo '</pre>' >> $project/lint/index.html
  rm -rf $project/lint/index.txt
  syncFolderToServer $project/lint/ $lintFolder
  lintErrorUrl=https://lint.fiji.gliprc.com/$subDomain/$BUILD_NUMBER/index.html
  addEnv SAResult="> **SA Error**: $lintErrorUrl"
  exit 1
fi