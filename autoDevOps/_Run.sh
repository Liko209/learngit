#!/usr/local/bin/bash

echo '====Start Run'
. ./_Init.sh

. $autoDevOps/1.InstallDeps.sh

n_procs=(
    ". $autoDevOps/2.SA.sh"
    ". $autoDevOps/3.UT.sh"
    ". $autoDevOps/4.BuildAndDeployApplication.sh"
    ". $autoDevOps/4.BuildAndDeployJui.sh"
    # ". $autoDevOps/5.E2E.sh"
    #". $autoDevOps/6.Puppeteer.sh"
)

# run processes and store pids in array
for i in $n_procs; do
    eval $n_procs[${i}] &
    pids[${i}]=$!
done

# wait for all pids
for pid in ${pids[*]}; do
    echo "waiting for sub process $pid"
    wait $pid
done

addEnv hasLintError=$hasLintError
