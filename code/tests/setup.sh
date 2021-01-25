#!/bin/bash
# run this on your ECS instance

sudo yum update -y
sudo yum install -y k6 git

# install docker
sudo amazon-linux-extras install docker
sudo yum install docker
sudo service docker start
sudo usermod -a -G docker ec2-user


# install node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install node

# install python
sudo yum install -y python3
python3 -m venv pandas/venv
source pandas/venv/bin/activate
pip install pip --upgrade
pip install pandas matplotlib openpyxl