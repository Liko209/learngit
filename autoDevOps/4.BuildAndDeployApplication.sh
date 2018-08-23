echo '====Start Build application'
cd $project/application
npm i
npm run build

syncFolderToServer $project/application/build $subDomain