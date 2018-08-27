#!/bin/bash

echo '====Start Run'
. ./_Init.sh

# # # 1. Install Deps
. $autoDevOps/1.InstallDeps.sh

# # # # 2. SA
. $autoDevOps/2.SA.sh

if [ "$hasLintError" != 1 ]; then
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

  # # 6. Puppeteer
  # . $autoDevOps/6.Puppeteer.sh
else
  addEnv hasLintError=1
fi