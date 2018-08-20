echo '====Start Build demo'
yarn build:demo

if ($?){
  exist $?
}

syncFolderToServer $project/demo/build $subDomain