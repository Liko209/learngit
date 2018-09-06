#!/bin/bash
echo '====Start Build application'
cd $project/application

npm run build
syncFolderToServer $project/application/build $subDomain
if [[ ! -z "$linkDomain" ]]; then
  updateLinkDomainOnServer $subDomain $linkDomain
else
  echo "Not need to update linked Domain"
fi
