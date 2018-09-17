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
                        ./application/build/ $theServer:$theFolder/feature-fiji-$ID
                ssh $theServer "chown -R root:root $theFolder/feature-fiji-$ID && cd $theFolder/feature-fiji-$ID; pwd; ls -al"
                echo "Success build application and deploy to https://feature-fiji-$ID.fiji.gliprc.com"
        ;;
        "sbs" | "story-book-sync")
                echo 'Which ID do you want to upload? (Only the number, ${ID})'
                read ID
                echo $ID
                subDomain=storybooks-$ID
                cd packages/ui-components && npm run build-storybook
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
