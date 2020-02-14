#!/bin/bash
CWD=$(cd "$(dirname $0)";pwd)

export NODE_PATH=${CWD}
export PATH=${CWD}/node_modules/.bin:${PATH}
chmod +x "${CWD}/node_modules/.bin/node"

node app.js