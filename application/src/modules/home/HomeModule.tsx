/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-08 17:08:34
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractModule } from 'framework/AbstractModule';
import { inject } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { IHomeService } from './interface/IHomeService';
import { config } from './home.config';
import { notificationCenter, SERVICE } from 'sdk/service';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
import { IMessageService } from '@/modules/message/interface';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import { MEETING_SERVICE } from '@/modules/meeting/interface/constant';
import _ from 'lodash';
import { analyticsCollector } from '@/AnalyticsCollector';
import { LoginInfo } from 'sdk/types';

class HomeModule extends AbstractModule {
  @IHomeService private _homeService: IHomeService;
  @inject(Jupiter) private _jupiter: Jupiter;
  private _subModuleRegistered: boolean = false;
  get _featuresFlagsService() {
    return this._jupiter.get(FeaturesFlagsService);
  }

  async bootstrap() {
    // load subModule
    notificationCenter.on(SERVICE.RC_LOGIN, async (loginInfo: LoginInfo) => {
      if (loginInfo.isFirstLogin) {
        analyticsCollector.login();
      }
      await this._initialSubModules();
    });
    notificationCenter.on(SERVICE.GLIP_LOGIN, async (loginInfo: LoginInfo) => {
      loginInfo.success && (await this._initialSubModules());
    });
  }

  private _initialSubModules = async () => {
    if (!this._subModuleRegistered) {
      // Avoid duplicate register
      this._subModuleRegistered = true;

      try {
        const moduleNames = await this._featuresFlagsService.getSupportFeatureModules();

        await this._homeService.registerSubModules(moduleNames);

        this._homeService.setDefaultRouterPaths(config.defaultRouterPaths);

        this.addAsyncModuleOnInitializedListener();
      } catch (err) {
        this._subModuleRegistered = false;
        throw err;
      }
    }
  };

  getServices = (moduleNames: any[]) => {
    const serviceList: any[] = [];
    const moduleServiceMap = {
      message: IMessageService,
      telephony: TELEPHONY_SERVICE,
      meeting: MEETING_SERVICE,
    };
    moduleNames.forEach((moduleName: string) => {
      if (this._homeService.hasModules([moduleName])) {
        serviceList.push(moduleServiceMap[moduleName]);
      }
    });
    return serviceList;
  };

  addAsyncModuleOnInitializedListener() {
    // message should be first
    const services = this.getServices(['message', 'telephony', 'meeting']);
    const getComponentClassFromModule = (m: object) => {
      if (m && Object.keys(m).length > 0 && m[Object.keys(m)[0]]) {
        return m[Object.keys(m)[0]];
      }
    };
    this._jupiter.onInitialized(
      services,
      async (MessageService, ...services) => {
        const promises: any[] | Promise<any>[] = services.map(async service => {
          const modules = await Promise.all([].concat(service.getComponent()));
          const ms = modules.map(m => getComponentClassFromModule(m));
          return ms;
        });
        const components = _.flatten(await Promise.all(promises));
        MessageService.registerConversationHeaderExtension(components);
      },
    );
  }
}

export { HomeModule };
