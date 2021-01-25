#!/bin/bash

# run this on your ECS instance
sudo yum install -y k6 git docker

# install node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install node