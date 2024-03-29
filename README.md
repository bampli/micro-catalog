# micro-catalog

Fc2 micro-catalog api backend

![Screenshot from 2022-02-28 15-39-41](https://user-images.githubusercontent.com/86032/156039490-7ec5fa96-5a6a-49e1-a53a-c06a6b551de1.png)

![x](https://user-images.githubusercontent.com/86032/159981731-ec19de1b-3ae8-41d4-b39f-879fc4050918.png)

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

npm run clean

lb4 model
lb4 datasource

---------------------------
lb4 repository

? Please select the datasource Esv7Datasource
? Select the model(s) you want to generate a repository for CastMember, Genre
? Please select the repository base class DefaultCrudRepository (Juggler bridge)
   create src/repositories/cast-member.repository.ts
   create src/repositories/genre.repository.ts
   update src/repositories/index.ts
   update src/repositories/index.ts

Repositories CastMemberRepository, GenreRepository was/were created in src/repositories

---------------------------
lb4 service

? Service type: Local service class bound to application context
? Service name: CastMemberSync
   create src/services/cast-member-sync.service.ts
   update src/services/index.ts

Service CastMemberSync was/were created in src/services


---------------------------
lb4 controller

? Controller class name: Category
Controller Category will be created in src/controllers/category.controller.ts

? What kind of controller would you like to generate? REST Controller with CRUD functions
? What is the name of the model to use with this CRUD repository? Category
? What is the name of your CRUD repository? CategoryRepository
? What is the name of ID property? id
? What is the type of your ID? string
? Is the id omitted when creating a new instance? No
? What is the base HTTP path name of the CRUD operations? /categories
   create src/controllers/category.controller.ts
   update src/controllers/index.ts

Controller Category was/were created in src/controllers

---------------------------
lb4 observer UpdateCategoryRelation

? Observer group:
   create src/observers/update-category-relation.observer.ts
   update src/observers/index.ts

Observer UpdateCategoryRelation was/were created in src/observers

---------------------------
export class RabbitmqServer extends Context implements Server {}

# debug with loopback cli
export DEBUG=loopback:cli:utils

```

## Versions

```

# Custom Loopback connector by codeedu
loopback-connector-esv6 "https://github.com/codeedu/loopback-connector-elastic-search/tarball/master"

amqplib @0.8.0
@types/amqplib @0.8.2
amqplib amqp-connection-manager @4.1.1
lodash @4.17.21
class-transformer @0.5.1

```
