#!/usr/local/bin/bash
echo '====Start Build application'
cd $project/application

npm run build

if [ $? -eq 0 ]; then
    echo "Build successed"refactor/FIJI-922ssfully**"
    syncFolderToServer $project/application/build $subDomain
    if [ ! -z "$linkDomain" ]; then
        updateLinkDomainOnServer $subDomain $linkDomain
    else
        echo "Not need to update linked Domain"
    fi
    if [ "$gitlabActionType" == 'MERGE' ]; then
        git stash
        git checkout $gitlabSourceBranch
        git reset --hard origin/$gitlabSourceBranch
        cd $project
        git stash pop
        npm run raise-coverage
        if [ "$(git diff ${project}/config)" ]; then
            git add $project/config
            git commit -m 'feat(CICD): raised coverage test threshold' && git push
        fi
    fi
else
    echo "Not need to update linked Domain"
fi
