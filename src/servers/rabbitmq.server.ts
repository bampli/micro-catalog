import {Binding, Context, inject} from "@loopback/context";
import {Application, CoreBindings, Server} from "@loopback/core";
import {repository} from "@loopback/repository";
import {Channel, ConfirmChannel, Message, Options} from "amqplib";
import {RabbitmqBindings} from '../keys';
import {CategoryRepository} from "../repositories";
import {AmqpConnectionManager, AmqpConnectionManagerOptions, ChannelWrapper, connect} from 'amqp-connection-manager';
import {MetadataInspector} from '@loopback/metadata';
import {RabbitmqSubscribeMetadata, RABBITMQ_SUBSCRIBE_DECORATOR} from '../decorators/rabbitmq-subscribe.decorator';

export enum ResponseEnum {
  ACK = 0,
  REQUEUE = 1,
  NACK = 2
}

export interface RabbitmqConfig {
  uri: string;
  connOptions?: AmqpConnectionManagerOptions;
  exchanges?: {
    name: string;
    type: string;
    options?: Options.AssertExchange
  }[];
  queues?: {
    name: string;
    options?: Options.AssertQueue;
    exchange?: {name: string, routingKey: string};
  }[];
  defaultHandlerError?: ResponseEnum;
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
    await this.setupQueues();
    await this.bindSubscribers();
  }

  private async setupExchanges() {
    return this.channelManager.addSetup(async (channel: ConfirmChannel) => {
      if (!this.config.exchanges) {
        return;
      }
      await Promise.all(this.config.exchanges.map((exchange) => (
        channel.assertExchange(
          exchange.name,
          exchange.type,
          exchange.options
        )
      )))
    })
  }

  private async setupQueues() {
    return this.channelManager.addSetup(async (channel: ConfirmChannel) => {
      if (!this.config.queues) {
        return;
      }
      await Promise.all(
        this.config.queues.map(async (queue) => {
          await channel.assertQueue(queue.name, queue.options);
          if (!queue.exchange) {
            return;
          }
          await channel.bindQueue(
            queue.name,
            queue.exchange.name,
            queue.exchange.routingKey
          );
        }),
      );
    })
  }

  private async bindSubscribers() {
    this
      .getSubscribers()
      .map(async (item) => {
        await this.channelManager.addSetup(async (channel: ConfirmChannel) => {
          const {exchange, queue, routingKey, queueOptions} = item.metadata;
          const assertQueue = await channel.assertQueue(
            queue ?? '',
            queueOptions ?? undefined
          );

          const routingKeys = Array.isArray(routingKey) ? routingKey : [routingKey];

          await Promise.all(
            routingKeys.map((x) =>
              channel.bindQueue(assertQueue.queue, exchange, x),
            )
          );
          await this.consume({
            channel,
            queue: assertQueue.queue,
            method: item.method
          });

        });
      })
  }

  private getSubscribers(): {method: Function, metadata: RabbitmqSubscribeMetadata}[] {
    const bindings: Array<Readonly<Binding>> = this.find('services.*');

    //service1, service2, service3
    //[methods that use the decorator], [], []
    return bindings
      .map(
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
      )
      .reduce((collection: any, item: any) => {
        collection.push(...item);
        return collection;
      }, [])
  }

  private async consume({channel, queue, method}: {
    channel: ConfirmChannel,
    queue: string,
    method: Function
  }) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await channel.consume(queue, async (message) => {
      try {
        if (!message) {
          throw new Error('Received null message');
        }

        const content = message.content;
        if (content) {
          let data;
          try {
            data = JSON.parse(content.toString());
          } catch (e) {
            data = null;
          }
          //console.log("Message->", data);
          const responseType = await method({data, message, channel});
          this.dispatchResponse(channel, message, responseType);
        }
      } catch (e) {
        console.error(e);
        if (!message) {
          return;
        }
        this.dispatchResponse(channel, message, this.config?.defaultHandlerError);
      }
    });
  }

  private dispatchResponse(channel: Channel, message: Message, responseType?: ResponseEnum) {
    switch (responseType) {
      case ResponseEnum.REQUEUE:
        channel.nack(message, false, true);
        break;
      case ResponseEnum.NACK:
        channel.nack(message, false, false);
        break;
      case ResponseEnum.ACK:
      default:
        channel.ack(message);
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

// console.log("Subscribers->", this.getSubscribers());
// console.log("Subscribers-0->", this.getSubscribers()[0][0]['method']());
// console.log("Subscribers-1->", this.getSubscribers()[0][1]['method']());
// this.boot();

// async boot() {
//   // @ts-ignore
//   this.channel = await this._conn.createChannel();
//   const queue: Replies.AssertQueue = await this.channel.assertQueue('micro-catalog/sync-videos');
//   const exchange: Replies.AssertExchange = await this.channel.assertExchange('amq.topic', 'topic');

//   await this.channel.bindQueue(queue.queue, exchange.exchange, 'model.*.*');

//   this.channel.consume(queue.queue, (message) => {
//     if (!message) {return };
//     //console.log(message);
//     const data: Category = JSON.parse(message.content.toString());
//     const [model, event] = message.fields.routingKey.split('.').slice(1);
//     this
//       .sync({model, event, data})
//       .then(() => this.channel.ack(message))
//       .catch(() => this.channel.reject(message, false));
//     //console.log(model, event);
//   })
//     .then(() => { })
//     .catch(() => { });
// }

// async sync({model, event, data}: {model: string, event: string, data: Category}) {
//   if (model === 'category') {
//     switch (event) {
//       case 'created':
//         await this.categoryRepo.create({
//           ...data,
//           // eslint-disable-next-line @typescript-eslint/naming-convention
//           created_at: new Date().toISOString(),
//           // eslint-disable-next-line @typescript-eslint/naming-convention
//           updated_at: new Date().toISOString()
//         });
//         break;
//       case 'updated':
//         await this.categoryRepo.updateById(data.id, data);
//         break;
//       case 'deleted':
//         await this.categoryRepo.deleteById(data.id);
//         break;
//     }
//   }
// }


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
