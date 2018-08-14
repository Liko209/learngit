echo '====Start Build application'
yarn build:app

syncFolderToServer $project/application/build $subDomain