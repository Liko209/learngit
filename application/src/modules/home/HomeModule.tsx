/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-08 17:08:34
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractModule, inject } from 'framework';
import { HomeService } from './service';
import { config } from './home.config';

class HomeModule extends AbstractModule {
  @inject(HomeService) private _homeService: HomeService;

  async bootstrap() {
    this._homeService.setDefaultRouterPaths(config.defaultRouterPaths);
  }
}

export { HomeModule };
