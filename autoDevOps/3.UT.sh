echo '====Start UT'

yarn run test:cover

coverageFolder=coverage/$subDomain/$BUILD_NUMBER
syncFolderToServer $project/coverage/ $coverageFolder

addEnv UTUrl=https://coverage.fiji.gliprc.com/$subDomain/$BUILD_NUMBER/lcov-report/index.html
