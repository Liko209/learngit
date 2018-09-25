#!/usr/local/bin/bash

echo '====Start Init'
# Define folder var
cd ../
export project=`pwd`
export autoDevOps=${project}/autoDevOps
export application=${project}/application
export demo=${project}/demo

# # go to the project root first
cd $project

# # 0. Setup Variable
. $autoDevOps/0.SetupVariable.sh

echo "Generate subDomain: $subDomain"
echo "linkDomain: $linkDomain"

# Init blank parameters
addEnv SAResult='Not Lint yet'
addEnv UTResult='Not UT yet'
addEnv E2EResult='Not E2E yet'
