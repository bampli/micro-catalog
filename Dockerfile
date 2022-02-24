# Check out https://hub.docker.com/_/node to select a new base image
FROM node:16.14.0-alpine3.15

RUN apk add --no-cache bash
RUN touch /root/.bashrc | echo "PS1='\w\$ '" >> /root/.bashrc

RUN npm install -g nodemon
RUN npm install -g @loopback/cli

RUN mkdir -p /home/node/app
user node
WORKDIR /home/node/app
