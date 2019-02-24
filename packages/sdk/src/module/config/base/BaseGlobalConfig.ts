import { IGlobalConfigService } from '../service/IGlobalConfigService';

class BaseGlobalConfig {
  constructor(
    private _configService: IGlobalConfigService,
    private _moduleName: string,
  ) {}

  protected get(key: string) {
    return this._configService.get(this._moduleName, key);
  }

  protected put(key: string, value: any) {
    this._configService.put(this._moduleName, key, value);
  }

  protected remove(key: string) {
    this._configService.remove(this._moduleName, key);
  }
}

export { BaseGlobalConfig };
