import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}}) // metadata decorator
export class Category extends Entity {
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
  })
  name: string;

  @property({
    type: 'string',
    required: false,
    default: ''
  })
  description: string;

  @property({
    type: 'boolean',
    required: false,
    default: true
  })
  // eslint-disable-next-line @typescript-eslint/naming-convention
  is_active: boolean;

  @property({
    type: 'date',
    required: true,
  })
  // eslint-disable-next-line @typescript-eslint/naming-convention
  created_at: string; // ISO 8601 YYYY-MM-DDT00:00:00

  @property({
    type: 'date',
    required: true,
  })
  // eslint-disable-next-line @typescript-eslint/naming-convention
  updated_at: string; // ISO 8601 YYYY-MM-DDT00:00:00

  constructor(data?: Partial<Category>) {
    super(data);
  }
}

export interface CategoryRelations {
  // describe navigational properties here
}

export type CategoryWithRelations = Category & CategoryRelations;
