echo '====Start Install Deps'

npm i --unsafe-perm

exitCode=$?
if [ $exitCode -ne 0 ]; then
  exit 1
fi