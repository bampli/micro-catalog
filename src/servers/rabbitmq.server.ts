import {Context} from "@loopback/context";
import {Server} from "@loopback/core";
import {Channel, connect, Connection} from "amqplib";

// Comunicação usando rabbitmq:
// - disparar uma mensagem a cada evento de cada model do Laravel:
//     createInflateRaw, editar, excluir, relacionamentos
// - vários microserviços poderão ser notificados dos eventos que ocorreram
// - alguns microserviços poderão querer ser notificados somente de alguns eventos:
//    "somente quando tiver novos uploads"

export class RabbitmqServer extends Context implements Server {
  private _listening: boolean;
  conn: Connection;

  async start(): Promise<void> {
    this.conn = await connect({
      hostname: 'rabbitmq',
      username: 'admin',
      password: 'admin'
    });
    this._listening = true;
    this.boot();
  }

  async boot() {
    const channel: Channel = await this.conn.createChannel();
    const queue = await channel.assertQueue('first-queue');
    const exchange = await channel.assertExchange('amq-direct', 'direct');

    await channel.bindQueue(queue.queue, exchange.exchange, 'my-routing-key');

    //const result = channel.sendToQueue('first-queue', Buffer.from('hello world !'));

    channel.publish('amq-direct', 'my-routing-key', Buffer.from('publicado via routing key'));

    channel.consume(queue.queue, (message) => console.log(message?.content.toString()));
    //console.log(result);
  }

  async stop(): Promise<void> {
    await this.conn.close();
    this._listening = false;
  }

  get listening(): boolean {
    return this._listening
  }
}
