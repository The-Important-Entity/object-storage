#!/bin/bash
sudo docker ps -f name=dev-postgres -aq | sudo xargs docker rm -f
sudo rm -r $1