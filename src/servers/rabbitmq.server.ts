import {Context} from "@loopback/context";
import {Server} from "@loopback/core";
import {repository} from "@loopback/repository";
import {Channel, connect, Connection, Replies} from "amqplib";
import {Category} from '../models';
import {CategoryRepository} from "../repositories";

// Comunicação usando rabbitmq:
// - disparar uma mensagem a cada evento de cada model do Laravel:
//     createInflateRaw, editar, excluir, relacionamentos
// - vários microserviços poderão ser notificados dos eventos que ocorreram
// - alguns microserviços poderão querer ser notificados somente de alguns eventos:
//    "somente quando tiver novos uploads"

export class RabbitmqServer extends Context implements Server {
  private _listening: boolean;
  conn: Connection;

  constructor(@repository(CategoryRepository) private categoryRepo: CategoryRepository) {
    super();
    //console.log(this.categoryRepo);
  }

  async start(): Promise<void> {
    this.conn = await connect({
      hostname: 'rabbitmq',
      username: 'admin',
      password: 'admin'
    });
    this._listening = true;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.boot();
  }

  async boot() {
    const channel: Channel = await this.conn.createChannel();
    const queue: Replies.AssertQueue = await channel.assertQueue('micro-catalog/sync-videos');
    const exchange: Replies.AssertExchange = await channel.assertExchange('amq.topic', 'topic');

    await channel.bindQueue(queue.queue, exchange.exchange, 'model.*.*');

    channel.consume(queue.queue, (message) => {
      if (!message) {return };
      //console.log(message);
      const data: Category = JSON.parse(message.content.toString());
      const [model, event] = message.fields.routingKey.split('.').slice(1);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.sync({model, event, data});
      //console.log(model, event);
    }).then(() => { }).catch(() => { });
    //console.log(result);
  }

  async sync({model, event, data}: {model: string, event: string, data: Category}) {
    if (model === 'category') {
      switch (event) {
        case 'created':
          await this.categoryRepo.create({
            ...data,
            created_at: new Date(),
            updated_at: new Date()
          });
          break;
        case 'deleted':
          console.log("delete a category");
          break;
      }
    }
  }

  async stop(): Promise<void> {
    await this.conn.close();
    this._listening = false;
  }

  get listening(): boolean {
    return this._listening
  }
}
