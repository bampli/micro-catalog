import {Entity, model, property} from '@loopback/repository';
//import {getModelSchemaRef} from '@loopback/rest';
import {SmallCategory} from '.';

@model({settings: {strict: false}}) // metadata decorator
export class Genre extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      minLength: 1,
      maxLength: 255
    }
  })
  name: string;

  @property({
    type: 'boolean',
    required: false,
    default: true
  })
  is_active: boolean;

  @property({
    type: 'date',
    required: true,
  })
  created_at: string; // ISO 8601 YYYY-MM-DDT00:00:00

  @property({
    type: 'date',
    required: true,
  })
  updated_at: string; // ISO 8601 YYYY-MM-DDT00:00:00

  @property({
    type: 'object',
    jsonSchema: {
      type: 'array',
      items: {
        type: "object",
        properties: {
          id: {
            type: "string"
          },
          name: {
            type: "string"
          },
          is_active: {
            type: "boolean"
          }
        }
      },
      uniqueItems: true   // automatically invalidates repeated items
    }
  })
  categories: SmallCategory;

  constructor(data?: Partial<Genre>) {
    super(data);
  }
}

export interface GenreRelations {
  // describe navigational properties here
}

export type GenreWithRelations = Genre & GenreRelations;

// console.dir(getModelSchemaRef(Genre), {depth: 8});

// {
//   '$ref': '#/components/schemas/Genre',
//   definitions: {
//     Genre: {
//       title: 'Genre',
//       type: 'object',
//       properties: {
//         id: { type: 'string' },
//         name: { type: 'string', minLength: 1, maxLength: 255 },
//         is_active: { type: 'boolean' },
//         created_at: { type: 'string', format: 'date-time' },
//         updated_at: { type: 'string', format: 'date-time' },
//         categories: {
//           type: 'array',
//           items: {
//             type: 'object',
//             properties: {
//               id: { type: 'string' },
//               name: { type: 'string' },
//               is_active: { type: 'boolean' }
//             }
//           },
//           uniqueItems: true
//         }
//       },
//       required: [ 'id', 'name', 'created_at', 'updated_at' ],
//       additionalProperties: true
//     }
//   }
// }

