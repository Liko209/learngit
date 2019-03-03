import { GlobalConfig } from '../../module/config';

import { CONFIG_KEYS } from './configKeys';

class NewGlobalConfig extends GlobalConfig {
  static moduleName = 'config';

  static setAccountType(accountType: string) {
    this.put(CONFIG_KEYS.ACCOUNT_TYPE, accountType);
  }

  static getAccountType() {
    return this.get(CONFIG_KEYS.ACCOUNT_TYPE);
  }

  static getSocketServerHost() {
    return this.get(CONFIG_KEYS.SOCKET_SERVER_HOST);
  }

  static setSocketServerHost(server: string) {
    this.put(CONFIG_KEYS.SOCKET_SERVER_HOST, server);
  }

  static getStaticHttpServer() {
    return this.get(CONFIG_KEYS.STATIC_HTTP_SERVER);
  }

  static setStaticHttpServer(server: string) {
    this.put(CONFIG_KEYS.STATIC_HTTP_SERVER, server);
  }

  static getEnv() {
    return this.get(CONFIG_KEYS.ENV);
  }

  static setEnv(env: string) {
    this.put(CONFIG_KEYS.ENV, env);
  }

  static getLastIndexTimestamp() {
    return this.get(CONFIG_KEYS.LAST_INDEX_TIMESTAMP);
  }

  static setLastIndexTimestamp(timestamp: any) {
    this.put(CONFIG_KEYS.LAST_INDEX_TIMESTAMP, timestamp);
  }

  static removeLastIndexTimestamp() {
    this.remove(CONFIG_KEYS.LAST_INDEX_TIMESTAMP);
  }

  static setDBSchemaVersion(version: number) {
    this.put(CONFIG_KEYS.DB_SCHEMA_VERSION, version);
  }

  static getDBSchemaVersion() {
    return this.get(CONFIG_KEYS.DB_SCHEMA_VERSION);
  }

  static putConfig(key: string, value: any) {
    this.put(key, value);
  }

  static getConfig(key: string) {
    return this.get(key);
  }

  static removeConfig(key: string) {
    this.remove(key);
  }
}

export { NewGlobalConfig };
