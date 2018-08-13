#!/bin/bash

# http://jenkins.lab.rcch.ringcentral.com/job/Jupiter-Only/job/Jupiter-Application-Demo-MR-PUSH/configure
echo '====Start Main'
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

# # # 1. Install Deps
. $autoDevOps/1.InstallDeps.sh

# # # # 2. SA
. $autoDevOps/2.SA.sh

# # # # 3. UT
. $autoDevOps/3.UT.sh

# # # 4. Build And Deploy
if [ "$demoHasUpdate" ]; then
  . $autoDevOps/4.BuildAndDeployDemo.sh
else
  . $autoDevOps/4.BuildAndDeployApplication.sh
fi

# # 5. E2E
. $autoDevOps/5.E2E.sh
