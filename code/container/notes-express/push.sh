#!/bin/bash
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 270501904710.dkr.ecr.eu-central-1.amazonaws.com
docker tag notes-express:latest 270501904710.dkr.ecr.eu-central-1.amazonaws.com/notes-express:latest
docker push 270501904710.dkr.ecr.eu-central-1.amazonaws.com/notes-express:latest