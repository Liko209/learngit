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
    if [ "$gitlabActionType" == 'MERGE' ]; then
        git checkout $gitlabSourceBranch && git stash pop && git commit -m "feat(CICD): raised coverage test threshold" && git push
    fi
else
    echo "Not need to update linked Domain"
fi
