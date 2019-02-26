import {
  BaseGlobalConfig,
  IGlobalConfigService,
  GlobalConfigService,
} from '../../module/config';

import { CONFIG_KEYS } from './configKeys';

class NewGlobalConfig extends BaseGlobalConfig {
  private static instance: NewGlobalConfig;

  constructor(configService: IGlobalConfigService) {
    super(configService, 'config');
  }

  public static getInstance() {
    if (!NewGlobalConfig.instance) {
      NewGlobalConfig.instance = new NewGlobalConfig(
        GlobalConfigService.getInstance() as GlobalConfigService,
      );
    }
    return NewGlobalConfig.instance;
  }

  setAccountType(accountType: string) {
    this.put(CONFIG_KEYS.ACCOUNT_TYPE, accountType);
  }

  getAccountType() {
    return this.get(CONFIG_KEYS.ACCOUNT_TYPE);
  }

  getSocketServerHost() {
    return this.get(CONFIG_KEYS.SOCKET_SERVER_HOST);
  }

  setSocketServerHost(server: string) {
    this.put(CONFIG_KEYS.SOCKET_SERVER_HOST, server);
  }

  getStaticHttpServer() {
    return this.get(CONFIG_KEYS.STATIC_HTTP_SERVER);
  }

  setStaticHttpServer(server: string) {
    this.put(CONFIG_KEYS.STATIC_HTTP_SERVER, server);
  }

  getEnv() {
    return this.get(CONFIG_KEYS.ENV);
  }

  setEnv(env: string) {
    this.put(CONFIG_KEYS.ENV, env);
  }

  getLastIndexTimestamp() {
    return this.get(CONFIG_KEYS.LAST_INDEX_TIMESTAMP);
  }

  setLastIndexTimestamp(timestamp: any) {
    this.put(CONFIG_KEYS.LAST_INDEX_TIMESTAMP, timestamp);
  }

  removeLastIndexTimestamp() {
    this.remove(CONFIG_KEYS.LAST_INDEX_TIMESTAMP);
  }

  setDBSchemaVersion(version: number) {
    this.put(CONFIG_KEYS.DB_SCHEMA_VERSION, version);
  }

  getDBSchemaVersion() {
    return this.get(CONFIG_KEYS.DB_SCHEMA_VERSION);
  }

  putConfig(key: string, value: any) {
    this.put(key, value);
  }

  getConfig(key: string) {
    return this.get(key);
  }

  removeConfig(key: string) {
    this.remove(key);
  }
}

export { NewGlobalConfig };
