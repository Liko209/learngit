echo '====Start SA'
rm -rf $project/lint
mkdir -p $project/lint
./node_modules/.bin/tslint --project $project/application --out $project/lint/application.txt
# ./node_modules/.bin/tslint --project $project/demo --out $project/lint/demo.txt
./node_modules/.bin/tslint --project $project/packages/foundation --out $project/lint/foundation.txt
./node_modules/.bin/tslint --project $project/packages/sdk --out $project/lint/sdk.txt
./node_modules/.bin/tslint --project $project/packages/ui --out $project/lint/ui.txt

hasLintError=0

lintFolder=lint/$subDomain/$BUILD_NUMBER

applicationLintError=$(<lint/application.txt)
if [ "$applicationLintError" ]; then
  echo 'Application Has Lint Error'
  echo "<a href=https://lint.fiji.gliprc.com/$subDomain/$BUILD_NUMBER/application.txt>Application Lint Result</a><br />" >> $project/lint/index.html
  cat $project/lint/application.txt >> $project/lint/index.txt
  hasLintError=1
fi

# demoLintError=$(<lint/demo.txt)
# if [ "$demoLintError" ]; then
#   echo 'Demo Has Lint Error'
#   echo "<a href=https://lint.fiji.gliprc.com/$subDomain/$BUILD_NUMBER/demo.txt>demo Lint Result</a><br />" >> $project/lint/index.html
#   cat $project/lint/demo.txt >> $project/lint/index.txt
#   hasLintError=1
# fi

foundationLintError=$(<lint/foundation.txt)
if [ "$foundationLintError" ]; then
  echo 'Foundation Has Lint Error'
  echo "<a href=https://lint.fiji.gliprc.com/$subDomain/$BUILD_NUMBER/foundation.txt>Foundation Lint Result</a><br />" >> $project/lint/index.html
  cat $project/lint/foundation.txt >> $project/lint/index.txt
  hasLintError=1
fi

sdkLintError=$(<lint/sdk.txt)
if [ "$sdkLintError" ]; then
  echo 'SDK Has Lint Error'
  echo "<a href=https://lint.fiji.gliprc.com/$subDomain/$BUILD_NUMBER/sdk.txt>SDK Lint Result</a><br />" >> $project/lint/index.html
  cat $project/lint/sdk.txt >> $project/lint/index.txt
  hasLintError=1
fi

uiLintError=$(<lint/ui.txt)
if [ "$uiLintError" ]; then
  echo 'UI Has Lint Error'
  echo "<a href=https://lint.fiji.gliprc.com/$subDomain/$BUILD_NUMBER/ui.txt>UI Lint Result</a><br />" >> $project/lint/index.html
  cat $project/lint/ui.txt >> $project/lint/index.txt
  hasLintError=1
fi

echo "hasLintError: $hasLintError"
if [ "$hasLintError" = 1 ]; then
  echo '<pre>' >> $project/lint/index.html
  cat $project/lint/index.txt >> $project/lint/index.html
  echo '</pre>' >> $project/lint/index.html
  rm -rf $project/lint/index.txt
  syncFolderToServer $project/lint/ $lintFolder
  lintErrorUrl=https://lint.fiji.gliprc.com/$subDomain/$BUILD_NUMBER/index.html
  addEnv SAResult="> **SA Error**: $lintErrorUrl"
  exit 1
fi
