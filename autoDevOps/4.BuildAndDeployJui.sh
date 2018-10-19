#!/usr/local/bin/bash
echo '====Start Build Jui'
npm run build:ui

syncFolderToServer $project/packages/jui/storybook-static $subDomain-jui
