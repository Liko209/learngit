#!/bin/bash
echo '====Start Setup Variable'
rm -rf $project/build.properties
# gitlabActionType
# gitlabMergeRequestId
# gitlabMergeRequestIid
# gitlabSourceName
# gitlabSourceRepository
# gitlabSourceBranch
# gitlabTargetBranch
# gitlabTitle
# gitlabDescription
# gitlabSourceProjectId
# gitlabTargetProjectId
# gitlabLastCommitId

function addEnv(){
  echo $1 >> $project/build.properties
  # echo 'writing env'
  # echo $1
  # cat $project/build.properties
  # echo 'end'
}

# Define server information
export theServer=root@xia01-i01-dkr61.lab.rcch.ringcentral.com
export serverRootFolder=/srv/docker-compose-nginx/html
export sshKey=$jupiterMacProPrivateKey
export sshPort=2222

echo "gitlabActionType: ${gitlabActionType}"
echo "gitlabMergeRequestId: ${gitlabMergeRequestId}"
echo "gitlabMergeRequestState: ${gitlabMergeRequestState}"
echo "gitlabBranch: ${gitlabBranch}"
echo "gitlabSourceName: ${gitlabSourceName}"
echo "gitlabSourceBranch: ${gitlabSourceBranch}"
echo "gitlabTargetBranch: ${gitlabTargetBranch}"
# Generate the subDomain
subDomain=${gitlabSourceBranch//[\/\.]/$'-'} # "/."" => "-""
subDomain=${subDomain,,} # Uppercase becomes Lowercase

if [[ $gitlabSourceBranch == "master" ]]; then
  linkDomain="release"
elif [[ $gitlabSourceBranch == stage\/* ]]; then
  linkDomain="stage"
else
  linkDomain=""
fi

if [ "$gitlabTargetBranch" != "$gitlabSourceBranch" ]; then
  echo 'A Merge Request Event'
  subDomain=mr-${subDomain}
  linkDomain=""
  addEnv RECIPIENT_LIST=jupiter_mr_ci@ringcentral.glip.com
else
  case $gitlabSourceBranch in
    develop)
      addEnv RECIPIENT_LIST=jupiter_develop_ci@ringcentral.glip.com
    ;;
    master)
      addEnv RECIPIENT_LIST=jupiter_master_ci@ringcentral.glip.com
    ;;
    *)
      addEnv RECIPIENT_LIST=jupiter_push_ci@ringcentral.glip.com
    ;;
  esac
fi

demoHasUpdate="$(git diff HEAD^ HEAD  ${project}/demo)"
# demoHasUpdate=1
if  [ "$demoHasUpdate" ]; then
  subDomain=demo-${subDomain}
  addEnv projectName='Fiji Demo'
else
  addEnv projectName='Jupiter Application'
fi

export demoHasUpdate
export subDomain
export linkDomain
export appUrl=https://${subDomain}.fiji.gliprc.com
addEnv appUrl=$appUrl

function syncFolderToServer(){
  localFolder=$1
  remoteFolder=$2
  echo '=====Start sync files'
  echo $localFolder
  echo $remoteFolder
  ssh -i $sshKey -p $sshPort -o StrictHostKeyChecking=no $theServer "mkdir -p $serverRootFolder/$remoteFolder"
  rsync -azPq --delete --progress \
    -e "ssh -i $sshKey -p $sshPort -o StrictHostKeyChecking=no" \
    $localFolder/ $theServer:$serverRootFolder/$remoteFolder
  ssh -i $sshKey -p $sshPort -o StrictHostKeyChecking=no $theServer "chown -R root:root $serverRootFolder/$remoteFolder"
}

function updateLinkDomainOnServer(){
  sourceFolder=$1
  linkFolder=$2
  echo '=====Start linking domain'
  echo $sourceFolder
  echo $linkFolder
  ssh -i $sshKey -p $sshPort -o StrictHostKeyChecking=no $theServer "link -s $serverRootFolder/$sourceFolder $serverRootFolder/$linkFolder"
}

alias syncFolderToServer=syncFolderToServer
alias updateLinkDomainOnServer=updateLinkDomainOnServer
