import Consul from 'consul';
import { DiscoveryHandler } from './types';
import appConfig from '../config';

export class ConsulDiscoveryHandler implements DiscoveryHandler {
  readonly client: Consul.Consul;

  constructor() {
    this.client = new Consul({ host: 'localhost' }); // todo: config
  }

  async init(): Promise<void> {
    await this.client.agent.service.register({
      name: 'cludus-gateway-nodejs', // todo: config
      address: 'host.docker.internal', // todo: config
      port: appConfig.serverPort,
      check: {
        http: `http://host.docker.internal:${appConfig.serverPort}/health`, // todo: config
        interval: '10s',
        status: 'passing',
      },
    });
    console.info(' - Service registered with Consul');

    // const services = await this.client.agent.service.list();
    // console.log(`=================================== Found services ${services}`);
  }
}
