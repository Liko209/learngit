echo $1

theServer=docker-rc-office
theFolder=/srv/docker-compose-nginx/html
DATE_WITH_TIME=`date "+%Y%m%d-%H%M%S"`
case "$1" in
        "as" | "app-sync")
                echo 'Which ID do you want to upload? (Only the number, FIJI-${ID})'
                read ID
                echo $ID
                rsync -azPv \
                        --delete --progress \
                        ./application/build/ $theServer:$theFolder/application-fiji-$ID
                ssh $theServer "chown -R root:root $theFolder/application-fiji-$ID && cd $theFolder/application-fiji-$ID; pwd; ls -al" 
        ;;
        "h" | "html")
                ssh $theServer  -t "cd $theFolder/html; pwd; ls -al; bash"
        ;;
	*)
                 echo 'do nothing'
	;;
esac