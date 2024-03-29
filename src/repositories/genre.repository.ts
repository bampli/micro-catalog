import {inject} from '@loopback/core';
import {BaseRepository} from './base.repository';
import {Esv7DataSource} from '../datasources';
import {Genre, GenreRelations} from '../models';
// import {Client} from 'es7';
// import {pick} from 'lodash';

export class GenreRepository extends BaseRepository<
  Genre,
  typeof Genre.prototype.id,
  GenreRelations
> {
  constructor(
    @inject('datasources.esv7') dataSource: Esv7DataSource,
  ) {
    super(Genre, dataSource);
  }
}

// async attachCategories(genreId: typeof Genre.prototype.id, data: object[]) {
  //   const document = {
  //     index: this.dataSource.settings.index,
  //     refresh: true,
  //     body: {
  //       query: {
  //         term: {
  //           _id: genreId
  //         }
  //       },
  //       script: {
  //         source: `
  //             if( !ctx._source.containsKey('categories') ){
  //         ctx._source['categories'] = []
  //       }
  //     for (item in params['categories']) {
  //       if (ctx._source['categories'].find(i -> i.id == item.id) == null) {
  //         ctx._source['categories'].add(item)
  //       }
  //     }
  //     `,
  //         params: {
  //           categories: data
  //         }
  //       }
  //     }
  //   };
  //   const db: Client = this.dataSource.connector?.db;

  //   await db.update_by_query(document);
  // }

  // async updateCategories(data: object[]) {
  //   const fields = Object.keys(
  //     this.modelClass.definition.properties['categories']
  //       .jsonSchema.items.properties
  //   );

  //   const category = pick(data, fields);

  //   const document = {
  //     index: this.dataSource.settings.index,
  //     refresh: true,
  //     body: {
  //       query: {
  //         bool: {
  //           must: [
  //             {
  //               nested: {
  //                 path: "categories",
  //                 query: {
  //                   exists: {
  //                     field: "categories"
  //                   }
  //                 }
  //               }
  //             },
  //             {
  //               nested: {
  //                 path: "categories",
  //                 query: {
  //                   term: {"categories.id": '1-cat'}
  //                 }
  //               }
  //             }
  //           ]
  //         }
  //       },
  //       script: {
  //         source: `
  //             ctx._source['categories'].removeIf(i -> i.id == params['category']['id']);
  //             ctx._source['categories'].add(params['category'])
  //           `,
  //         params: {
  //           category
  //         }
  //       }
  //     }
  //   };
  //   const db: Client = this.dataSource.connector?.db;

  //   await db.update_by_query(document);
  // }
