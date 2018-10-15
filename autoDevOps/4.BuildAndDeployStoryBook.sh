#!/usr/local/bin/bash
echo '====Start Build Jui'
cd $project/packages/jui

npm run build-storybook
syncFolderToServer $project/packages/jui/storybook-static jui-$subDomain
if [[ ! -z "$linkDomain" ]]; then
    updateLinkDomainOnServer jui-$subDomain $linkDomain
