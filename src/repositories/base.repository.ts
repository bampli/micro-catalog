import {DefaultCrudRepository, Entity} from '@loopback/repository';
import {Client} from 'es7';
import {pick} from 'lodash';

export class BaseRepository<
  T extends Entity,
  ID,
  Relations extends object = {}
  > extends DefaultCrudRepository<T, ID, Relations> {

  async attachRelation(id: ID, relationName: string, data: object[]) {

    //TODO: check if relationName exists in the model

    const document = {
      index: this.dataSource.settings.index,
      refresh: true,
      body: {
        query: {
          term: {
            _id: id
          }
        },
        script: {
          source: `
              if( !ctx._source.containsKey('${relationName}') ){
          ctx._source['${relationName}'] = []
        }
      for (item in params['${relationName}']) {
        if (ctx._source['${relationName}'].find(i -> i.id == item.id) == null) {
          ctx._source['${relationName}'].add(item)
        }
      }
      `,
          params: {
            [relationName]: data
          }
        }
      }
    };
    const db: Client = this.dataSource.connector?.db;

    await db.update_by_query(document);
  }

  async updateCategories(data: object[]) {
    const fields = Object.keys(
      this.modelClass.definition.properties['categories']
        .jsonSchema.items.properties
    );

    const category = pick(data, fields);

    const document = {
      index: this.dataSource.settings.index,
      refresh: true,
      body: {
        query: {
          bool: {
            must: [
              {
                nested: {
                  path: "categories",
                  query: {
                    exists: {
                      field: "categories"
                    }
                  }
                }
              },
              {
                nested: {
                  path: "categories",
                  query: {
                    term: {"categories.id": '1-cat'}
                  }
                }
              }
            ]
          }
        },
        script: {
          source: `
              ctx._source['categories'].removeIf(i -> i.id == params['category']['id']);
              ctx._source['categories'].add(params['category'])
            `,
          params: {
            category
          }
        }
      }
    };
    const db: Client = this.dataSource.connector?.db;

    await db.update_by_query(document);
  }
}
