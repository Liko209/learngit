#!/bin/bash
echo '====Start Build application'
cd $project/application

npm run build
syncFolderToServer $project/application/build $subDomain