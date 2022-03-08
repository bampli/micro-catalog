import {Binding, Context, inject} from "@loopback/context";
import {Application, ApplicationConfig, CoreBindings, Server} from "@loopback/core";
import {repository} from "@loopback/repository";
import {Channel, ConfirmChannel, Connection, Options, Replies} from "amqplib";
import {RabbitmqBindings} from '../keys';
import {Category} from '../models';
import {CategoryRepository} from "../repositories";
import {AmqpConnectionManager, AmqpConnectionManagerOptions, ChannelWrapper, connect} from 'amqp-connection-manager';
import {MetadataInspector} from '@loopback/metadata';
import {RabbitmqSubscribeMetadata, RABBITMQ_SUBSCRIBE_DECORATOR} from '../decorators/rabbitmq-subscribe.decorator';
import {CategorySyncService} from '../services';

export interface RabbitmqConfig {
  uri: string;
  connOptions?: AmqpConnectionManagerOptions;
  exchanges?: {name: string, type: string, options?: Options.AssertExchange}[];
}
export class RabbitmqServer extends Context implements Server {
  private _listening: boolean;
  private _conn: AmqpConnectionManager;
  private _channelManager: ChannelWrapper;
  channel: Channel;

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) public app: Application,
    @repository(CategoryRepository) private categoryRepo: CategoryRepository,
    @inject(RabbitmqBindings.CONFIG) private config: RabbitmqConfig
  ) {
    super(app);
    console.log("Config->", config);
    //console.log("Category->", this.categoryRepo);
  }

  async start(): Promise<void> {
    this._conn = connect([this.config.uri], this.config.connOptions);
    this._channelManager = this.conn.createChannel();

    this.channelManager.on('connect', () => {
      this._listening = true;
      console.log('Successful connection to RabbitMQ channel');
    });
    this.channelManager.on('error', (err, {name}) => {
      this._listening = false;
      console.log(`Failed connection to RabbitMQ channel - name: ${name} | error: ${err.message}`);
    });
    await this.setupExchanges();

    //console.log("Subscribers->", this.getSubscribers());
    // @ts-ignore
    console.log("Subscribers-0->", this.getSubscribers()[0][0]['method']());
    // @ts-ignore
    console.log("Subscribers-1->", this.getSubscribers()[0][1]['method']());

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    //this.boot();
  }

  private async setupExchanges() {
    return this.channelManager.addSetup(async (channel: ConfirmChannel) => {
      if (!this.config.exchanges) {
        return;
      }
      await Promise.all(this.config.exchanges.map((exchange) => (
        channel.assertExchange(exchange.name, exchange.type, exchange.options)
      )))
    })
  }

  private getSubscribers() {
    const bindings: Array<Readonly<Binding>> = this.find('services.*');

    //service1, service2, service3
    //[methods that use the decorator], [], []
    return bindings.map(
      binding => {
        const metadata = MetadataInspector.getAllMethodMetadata<RabbitmqSubscribeMetadata>(
          RABBITMQ_SUBSCRIBE_DECORATOR,
          binding.valueConstructor?.prototype
        );
        if (!metadata) {  //{methodname1: {}, methodname2: {}}
          return [];
        }
        const methods = [];
        for (const methodName in metadata) {
          if (!Object.prototype.hasOwnProperty.call(metadata, methodName)) {
            return;
          }
          const service = this.getSync(binding.key) as any;

          methods.push({
            method: service[methodName].bind(service),
            metadata: metadata[methodName]
          })
        }
        return methods;
      }
    );

    // const service = this.getSync<CategorySyncService>('services.CategorySyncService');

    // console.log("Metadata->", metadata);
    // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // console.log("Handler->", (metadata as any)['handler'].exchange);

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

  get channelManager(): ChannelWrapper {
    return this._channelManager;
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


// Services-> [
//   Binding {
//     _events: [Object: null prototype] { changed: [Function (anonymous)] },
//     _eventsCount: 1,
//     _maxListeners: undefined,
//     isLocked: false,
//     tagMap: {
//       type: 'service',
//       service: 'service',
//       serviceInterface: [class CategorySyncService]
//     },
//     key: 'services.CategorySyncService',
//     _source: { type: 'Class', value: [class CategorySyncService] },
//     _getValue: [Function (anonymous)],
//     _scope: 'Transient',
//     [Symbol(kCapture)]: false
//   }
// ]
