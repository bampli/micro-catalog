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

```

## Versions

```

# Custom Loopback connector by codeedu
loopback-connector-esv6 "https://github.com/codeedu/loopback-connector-elastic-search/tarball/master"

```
