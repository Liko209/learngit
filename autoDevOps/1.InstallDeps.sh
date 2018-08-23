echo '====Start Install Deps'

rm -rf $project/**/package-lock.json 
npm i
yarn bt && yarn build:packages && yarn bt

echo $?