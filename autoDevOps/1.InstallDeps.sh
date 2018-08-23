echo '====Start Install Deps'

npm i

exitCode=$?
if [ $exitCode -ne 0 ]; then
  exit 1
fi