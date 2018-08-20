echo '====Start Build application'
yarn build:app

if ($?){
  exist $?
}

syncFolderToServer $project/application/build $subDomain