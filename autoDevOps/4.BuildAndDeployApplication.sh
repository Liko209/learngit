#!/bin/bash
echo '====Start Build application'
cd $project/application

syncFolderToServer $project/application/build $subDomain