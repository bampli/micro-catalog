import {DefaultCrudRepository, EntityNotFoundError} from "@loopback/repository";
import {Message} from 'amqplib';
import {pick} from 'lodash';
import {ValidatorService} from './validator.service';

export interface SyncOptions {
  repo: DefaultCrudRepository<any, any>;
  data: any;
  message: Message;
};

export interface SyncRelationOptions {
  id: string;
  relation: string;
  relationIds: string[];
  repo: DefaultCrudRepository<any, any>;
  repoRelation: DefaultCrudRepository<any, any>;
};

export abstract class BaseModelSyncService {

  constructor(
    public validateService: ValidatorService
  ) {

  }

  protected async sync({repo, data, message}: SyncOptions) {
    //console.log("Sync->", message.content.toString());
    const {id} = data || {};
    const action = this.getAction(message);
    const entity = this.createEntity(data, repo);
    switch (action) {
      case 'created':
        await this.validateService.validate({
          data: entity,
          entityClass: repo.entityClass
        });
        await repo.create(entity);
        break;
      case 'updated':
        await this.updateOrCreate({repo, id, entity});
        break;
      case 'deleted':
        await repo.deleteById(id);
        break;
    }
  }

  protected getAction(message: Message) {
    return message.fields.routingKey.split('.').slice(2)[0];
  }

  protected createEntity(data: any, repo: DefaultCrudRepository<any, any>) {
    return pick(data, Object.keys(repo.entityClass.definition.properties));
  }

  protected async updateOrCreate({repo, id, entity}: {
    repo: DefaultCrudRepository<any, any>,
    id: string,
    entity: any
  }) {
    const exists = await repo.exists(id);
    await this.validateService.validate({
      data: entity,
      entityClass: repo.entityClass,
      ...(exists && {options: {partial: true}})
    });
    return exists ? repo.updateById(id, entity) : repo.create(entity);
  }

  async syncRelation({
    id,
    relation,
    relationIds,
    repo,
    repoRelation
  }: SyncRelationOptions) {
    const fieldsRelation = this.extractFieldsRelation(repo, relation);

    const collection = await repoRelation.find({
      where: {
        or: relationIds.map(idRelation => ({id: idRelation})) // [{id: 'id1'}, {id: 'id2'}]
      },
      fields: fieldsRelation, // select only relation fields
    });

    // console.log("FIELDSRELATION", fieldsRelation);
    // console.log("COLLECTION", collection);

    if (!collection.length) {
      const error = new EntityNotFoundError(
        repoRelation.entityClass,
        relationIds
      );
      error.name = 'EntityNotFound';
      throw error;
    }

    await repo.updateById(id, {[relation]: collection});
  }

  protected extractFieldsRelation(
    repo: DefaultCrudRepository<any, any>,
    relation: string
  ) {
    return Object.keys(
      repo.modelClass.definition.properties[relation]
        .jsonSchema.items.properties
    ).reduce((obj: any, field: string) => {
      obj[field] = true;
      return obj;
    }, {})
  }
}

// repo.modelClass.definition.properties[relation]
// {
//   type: [Function: Object],
//   jsonSchema: {
//     type: 'array',
//     items: {
//       type: 'object',
//       properties: {
//         id: { type: 'string' },
//         name: { type: 'string' },
//         is_active: { type: 'boolean' }
//       }
//     },
//     uniqueItems: true
//   }
// }

// FIELDSRELATION { id: true, name: true, is_active: true }
// COLLECTION [
//   Category {
//     id: '047dfb69-73e6-4685-aa63-4a963e3502fb',
//     name: 'Lavenderaaaa 345',
//     description: undefined,
//     is_active: true,
//     created_at: undefined,
//     updated_at: undefined
//   }
// ]

// ElasticSearch
// {
//   "_index" : "catalog",
//   "_type" : "_doc",
//   "_id" : "f97284b0-40b8-4195-bff9-b3e9a0d96792",
//   "_score" : 1.0,
//   "_source" : {
//     "is_active" : true,
//     "updated_at" : "2022-03-22T16:28:02.000Z",
//     "docType" : "Genre",
//     "name" : "novo genero",
//     "created_at" : "2022-03-22T16:28:02.000Z",
//     "id" : "f97284b0-40b8-4195-bff9-b3e9a0d96792",
//     "categories" : [
//       {
//         "is_active" : true,
//         "name" : "Lavenderaaaa 345",
//         "id" : "047dfb69-73e6-4685-aa63-4a963e3502fb"
//       }
//     ]
//   }
// }
