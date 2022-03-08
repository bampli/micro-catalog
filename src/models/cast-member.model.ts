import {Entity, model, property} from '@loopback/repository';

export enum CastMemberType {
  DIRECTOR = 1,
  ACTOR = 2
}

@model({settings: {strict: false}}) // metadata decorator
export class CastMember extends Entity {
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
      minLenght: 1,
      maxLenght: 255
    }
  })
  name: string;

  @property({
    type: 'number',
    required: true
  })
  type: number;

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

  constructor(data?: Partial<CastMember>) {
    super(data);
  }
}

export interface CastMemberRelations {
  // describe navigational properties here
}

export type CastMemberWithRelations = CastMember & CastMemberRelations;
