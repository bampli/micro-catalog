# micro-catalog

Fc2 micro-catalog api backend

## Setup

Generated with latest LTS version.

```
# Install nvm & node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
nvm install --lts
node -v
v16.14.0

# Install Loopback 4
npm i -g @loopback/cli

# Create app accepting all defaults
lb4

# Enable write to Elastic data
chmod 777 .docker/elasticdata

```

## Templates

```
docker logs -f --tail 100 micro-catalog-app

lb4 datasource

# debug with loopback cli
export DEBUG=loopback:cli:utils

```

## Versions

```

# Custom Loopback connector by codeedu
loopback-connector-esv6 "https://github.com/codeedu/loopback-connector-elastic-search/tarball/master"

amqplib @0.8.0
@types/amqplib @0.8.2

```
