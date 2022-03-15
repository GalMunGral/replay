if [ ! -d "node_modules" ]; then
    echo "Install Deps: @replay/dom"
    npm install
else
    echo "Install Subdeps: @replay/dom"
    cd node_modules/@replay/common
    npm install
fi