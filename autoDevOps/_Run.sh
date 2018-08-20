#!/bin/bash

echo '====Start Run'
. ./_Init.sh

# # # 1. Install Deps
. $autoDevOps/1.InstallDeps.sh

# # # # 2. SA
. $autoDevOps/2.SA.sh

# # # # 3. UT
. $autoDevOps/3.UT.sh

# # # 4. Build And Deploy
demoHasUpdate=1
if [ "$demoHasUpdate" ]; then
  . $autoDevOps/4.BuildAndDeployDemo.sh
else
  . $autoDevOps/4.BuildAndDeployApplication.sh
fi

# # 5. E2E
. $autoDevOps/5.E2E.sh