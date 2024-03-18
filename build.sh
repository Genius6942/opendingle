# Load environment variables from .env file
if [ -f .env ]
then
	export $(cat .env | sed 's/#.*//g' | xargs)
fi

rm -rf build
echo 'deleted build'
mkdir build

# we dont do the following anymore :(
# cp -r cold-clear build/cold-clear
# echo 'copied cold-clear engine'

npx tsc
echo 'compiled typescript'
cp cold-clear/target/x86_64-unknown-linux-musl/release build/main/game/cold-clear/bin-linux -r
# cp cold-clear/target/release build/main/game/cold-clear/bin-linux-test -r
echo 'copied cold-clear build'

cp -r tetr-node/server/content build/main/server
cp -r tetr-node/status/content build/main/status
cp serviceAccount.json build
echo 'copied server files'


find build/main/server/content -type f | xargs sed -i "s|<SITE_URL>|${SITE_URL}|g"

npm run build-vite

# if [ "$MODE" = "production" ]; then
# 	echo "In production, deleteing unnecessary crap"
# 	find . -type d ! -name "build" ! -name "node_modules" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
# 	echo "ready for deploy"
# fi

echo 'build complete'