#!/bin/bash
# run this on your ECS instance

sudo yum update -y
sudo yum install -y k6 git

# clone this repo
git clone https://github.com/rolule/ba.git

# install docker
sudo amazon-linux-extras install -y docker
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user


# install node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install node

# go into tests folder
cd ba/code/tests

# install node packages
npm install

# install python
sudo yum install -y python3

# create venv and install packages for analysis
python3 -m venv ba/pandas/venv
source ba/pandas/venv/bin/activate
pip install pip --upgrade
pip install pandas matplotlib openpyxl

# setup correct timezone
# sudo echo 'ZONE="Europe/Berlin"
# UTC=true' | sudo tee /etc/sysconfig/clock
# sudo ln -sf /usr/share/zoneinfo/Europe/Berlin /etc/localtime