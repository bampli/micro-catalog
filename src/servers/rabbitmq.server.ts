import {Context, inject} from "@loopback/context";
import {ApplicationConfig, CoreBindings, Server} from "@loopback/core";
import {repository} from "@loopback/repository";
import {Channel, Connection, Replies} from "amqplib";
import {RabbitmqBindings} from '../keys';
import {Category} from '../models';
import {CategoryRepository} from "../repositories";
import {AmqpConnectionManager, AmqpConnectionManagerOptions, ChannelWrapper, connect} from 'amqp-connection-manager';

export interface RabbitmqConfig {
  uri: string;
  connOptions?: AmqpConnectionManagerOptions;
}
export class RabbitmqServer extends Context implements Server {
  private _listening: boolean;
  private _conn: AmqpConnectionManager;
  private _channelManager: ChannelWrapper;
  channel: Channel;

  constructor(
    @repository(CategoryRepository) private categoryRepo: CategoryRepository,
    @inject(RabbitmqBindings.CONFIG) private config: RabbitmqConfig
  ) {
    super();
    console.log("Config->", config);
    //console.log(this.categoryRepo);
  }

  async start(): Promise<void> {
    this._conn = connect([this.config.uri], this.config.connOptions);
    this._channelManager = this.conn.createChannel();
    this._channelManager.on('connect', () => {
      this._listening = true;
      console.log('Successful connection to RabbitMQ channel');
    });
    this._channelManager.on('error', (err, {name}) => {
      this._listening = false;
      console.log(`Failed connection to RabbitMQ channel - name: ${name} | error: ${err.message}`);
    });
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    //this.boot();
  }

  async boot() {
    // @ts-ignore
    this.channel = await this._conn.createChannel();
    const queue: Replies.AssertQueue = await this.channel.assertQueue('micro-catalog/sync-videos');
    const exchange: Replies.AssertExchange = await this.channel.assertExchange('amq.topic', 'topic');

    await this.channel.bindQueue(queue.queue, exchange.exchange, 'model.*.*');

    this.channel.consume(queue.queue, (message) => {
      if (!message) {return };
      //console.log(message);
      const data: Category = JSON.parse(message.content.toString());
      const [model, event] = message.fields.routingKey.split('.').slice(1);
      this
        .sync({model, event, data})
        .then(() => this.channel.ack(message))
        .catch(() => this.channel.reject(message, false));
      //console.log(model, event);
    })
      .then(() => { })
      .catch(() => { });
  }

  async sync({model, event, data}: {model: string, event: string, data: Category}) {
    if (model === 'category') {
      switch (event) {
        case 'created':
          await this.categoryRepo.create({
            ...data,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            created_at: new Date().toISOString(),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            updated_at: new Date().toISOString()
          });
          break;
        case 'updated':
          await this.categoryRepo.updateById(data.id, data);
          break;
        case 'deleted':
          await this.categoryRepo.deleteById(data.id);
          break;
      }
    }
  }

  async stop(): Promise<void> {
    await this._conn.close();
    this._listening = false;
  }

  get listening(): boolean {
    return this._listening
  }

  get conn(): AmqpConnectionManager {
    return this._conn;
  }
}

// A comunicação Codeflix utilizando Rabbitmq consiste em:
// - disparar uma mensagem em cada evento de cada model do Laravel:
//     - criar, editar, excluir, relacionamentos
// - microserviços poderão ser notificados:
//     - de todos os eventos ocorridos
//     - de apenas alguns eventos ocorridos
//         - somente em caso de novos uploads
//
// Status:
//   - ack:     acknowledged
//   - nack:    rejected
//   - unacked: waiting for acknowledgement/rejection
//
// Samples:
//   - {"id": "uuid2", "name": "novo nome 2", "created_at": "2020-01-01T00:00","updated_at": "2020-01-01T00:01"}


