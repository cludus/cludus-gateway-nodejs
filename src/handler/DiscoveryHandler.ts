import Consul from 'consul';
import { DiscoveryHandler } from './types';
import appConfig from '../config';

type ConsulRegister = {
  errno?: number | undefined;
  code?: string | undefined;
};

export class ConsulDiscoveryHandler implements DiscoveryHandler {
  readonly client?: Consul.Consul;

  constructor() {
    if (appConfig.discoveryHost) {
      this.client = new Consul({
        host: appConfig.discoveryHost,
        port: String(appConfig.discoveryPort),
      });
    }
  }

  async init(): Promise<void> {
    if (this.client && URL.canParse(appConfig.serverHost)) {
      const serverHostUrl = new URL(appConfig.serverHost);
      console.debug('Connecting discovery with Consul at: %s', serverHostUrl);
      try {
        const register = await this.client.agent.service.register<ConsulRegister>({
          name: appConfig.discoveryName,
          address: serverHostUrl.hostname,
          port: appConfig.serverPort,
          check: {
            http: `${appConfig.serverHost}:${appConfig.serverPort}/health`,
            interval: '60s',
            status: 'passing',
          },
        });
        if (register && register.errno != 0) {
          console.error('Error connecting discovery at %s, %s', serverHostUrl, register.code ?? register.errno ?? 'Unknown');
        } else {
          console.info(' - Service registered with Consul: %s', register);
        }
      } catch (e) {
        console.error('Error connecting discovery at %s, %s', serverHostUrl, e);
      }
    }
    // const services = await this.client.agent.service.list();
    // console.log(`=================================== Found services ${services}`);
  }
}
