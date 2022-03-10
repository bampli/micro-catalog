import {bind, /* inject, */ BindingScope} from '@loopback/core';
import {rabbitmqSubscribe} from '../decorators/rabbitmq-subscribe.decorator';
import {repository} from "@loopback/repository";
import {CastMemberRepository} from "../repositories";
import {Message} from 'amqplib';

@bind({scope: BindingScope.SINGLETON})
export class CastMemberSyncService {
  constructor(
    @repository(CastMemberRepository) private repo: CastMemberRepository,
  ) { }

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    queue: 'micro-catalog/sync-videos/cast_member',
    routingKey: 'model.cast_member.*'
  })
  async handler({data, message}: {data: any, message: Message}) {
    const action = message.fields.routingKey.split('.').slice(2)[0];
    switch (action) {
      case 'created':
        await this.repo.create(data);
        break;
      case 'updated':
        await this.repo.updateById(data.id, data);
        break;
      case 'deleted':
        await this.repo.deleteById(data.id);
        break;
    }
  }
}
