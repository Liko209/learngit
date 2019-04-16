echo $1

theServer=docker-rc-office
theFolder=/srv/docker-compose-nginx/html
DATE_WITH_TIME=`date "+%Y%m%d-%H%M%S"`
case "$1" in
    "as" | "app-sync")
        echo 'Which ID do you want to upload? (Only the number, FIJI-${ID})'
        read ID
        echo $ID
        npm run build:app
        rsync -azPv \
        --delete --progress \
        ./application/build/ $theServer:$theFolder/mr-bug-fiji-$ID
        ssh $theServer "chown -R root:root $theFolder/mr-bug-fiji-$ID && cd $theFolder/mr-bug-fiji-$ID; pwd; ls -al"
        echo "Success build application and deploy to https://mr-bug-fiji-$ID.fiji.gliprc.com"
    ;;
    "ads" | "app-develop-sync")
        npm run build:app
        rsync -azPv \
        --delete --progress \
        ./application/build/ $theServer:$theFolder/develop
        ssh $theServer "chown -R root:root $theFolder/develop && cd $theFolder/develop; pwd; ls -al"
        echo "Success build application and deploy to https://develop.fiji.gliprc.com"
    ;;
    "sbs" | "story-book-sync")
        echo 'Which ID do you want to upload? (Only the number, ${ID})'
        read ID
        echo $ID
        subDomain=jui-$ID
        cd packages/jui && npm run build-storybook
        rsync -azPv \
        --delete --progress \
        ./storybook-static/ $theServer:$theFolder/$subDomain
        ssh $theServer "chown -R root:root $theFolder/$subDomain && cd $theFolder/$subDomain; pwd; ls -al"
        echo "Success build storybook and deploy to https://$subDomain.fiji.gliprc.com"
    ;;
    "h" | "html")
        ssh $theServer  -t "cd $theFolder/html; pwd; ls -al; bash"
    ;;
    *)
        echo 'do nothing'
    ;;
esac
