if [ ! -d "node_modules" ]; then
    echo "Install Deps: @replay/server"
    npm install
else
    echo "Install Subdeps: @replay/server"
    cd node_modules/@replay/common
    npm install
fi