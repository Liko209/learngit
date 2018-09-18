#!/usr/local/bin/bash
echo '====Start Build application'
cd $project/application

npm run build

if [ $? -eq 0 ]; then
    echo "Build successed"
    addEnv BuildResult="> **Build App successfully**"
    syncFolderToServer $project/application/build $subDomain
    if [ ! -z "$linkDomain" ]; then
        updateLinkDomainOnServer $subDomain $linkDomain
    else
        echo "Not need to update linked Domain"
    fi
else
    echo "Not need to update linked Domain"
fi
