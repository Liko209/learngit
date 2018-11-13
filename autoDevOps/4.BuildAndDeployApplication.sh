#!/usr/local/bin/bash
echo '====Init build version info'
cd $project/application/src/containers/VersionInfo/
ts-node GitRepo.ts

echo '====Start Build application'
cd $project/application

npm run build

if [ $? -eq 0 ]; then
    echo "Build successed"
    syncFolderToServer $project/application/build $subDomain
    if [ ! -z "$linkDomain" ]; then
        updateLinkDomainOnServer $subDomain $linkDomain
    else
        echo "Not need to update linked Domain"
    fi
else
    addEnv BUILD_ERROR=1
fi
