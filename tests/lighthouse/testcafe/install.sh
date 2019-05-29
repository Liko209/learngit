tempd=$(mktemp -d)
curl $APP_DOWNLOAD_URL > $tempd/pkg.dmg
listing=$(hdiutil attach $tempd/pkg.dmg | grep Volumes)
echo "$listing"
volume=$(echo "$listing" | awk -F "\t" '{print $3}')
cp -rf "$volume"/*.app ./Applications
hdiutil detach "$volume"
rm -rf $tempd
