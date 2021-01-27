#!/bin/bash
# run this on your ECS instance

# update
sudo yum update -y

# install git
sudo yum install -y git
git config --global pull.rebase true

# clone this repo
git clone https://github.com/rolule/ba.git

# install k6
wget https://bintray.com/loadimpact/rpm/rpm -O bintray-loadimpact-rpm.repo
sudo mv bintray-loadimpact-rpm.repo /etc/yum.repos.d/
sudo yum install -y k6


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
sudo echo -e 'ZONE="Europe/Berlin"\nUTC=true' | sudo tee /etc/sysconfig/clock
sudo ln -sf /usr/share/zoneinfo/Europe/Berlin /etc/localtime