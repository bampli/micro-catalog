import {inject} from '@loopback/core';
//import {DefaultCrudRepository} from '@loopback/repository';
import {Esv7DataSource} from '../datasources';
import {CastMember, CastMemberRelations} from '../models';
import {BaseRepository} from './base.repository';

export class CastMemberRepository extends BaseRepository<
  CastMember,
  typeof CastMember.prototype.id,
  CastMemberRelations
> {
  constructor(
    @inject('datasources.esv7') dataSource: Esv7DataSource,
  ) {
    super(CastMember, dataSource);
  }
}
