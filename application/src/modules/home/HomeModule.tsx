/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-08 17:08:34
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractModule, inject, Jupiter } from 'framework';
import { HomeService } from './service';
import { config } from './home.config';

import { service } from 'sdk';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';

import { FeaturesFlagsService } from '@/modules/featuresFlags/service';

import { MESSAGE_SERVICE } from '@/modules/message/interface/constant';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';

class HomeModule extends AbstractModule {
  @inject(HomeService) private _homeService: HomeService;
  @inject(FeaturesFlagsService)
  private _featuresFlagsService: FeaturesFlagsService;
  @inject(Jupiter) private _jupiter: Jupiter;
  private _subModuleRegistered: boolean = false;

  async bootstrap() {
    this._homeService.setDefaultRouterPaths(config.defaultRouterPaths);

    // load subModule
    const { notificationCenter, SERVICE } = service;
    notificationCenter.on(SERVICE.LOGIN, async () => {
      await this._initialSubModules();
      notificationCenter.on(
        SERVICE.FETCH_INDEX_DATA_DONE,
        this._initialSubModules,
      );
    });
  }

  private _initialSubModules = async () => {
    const accountService = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    );

    if (accountService.isAccountReady()) {
      if (!this._subModuleRegistered) {
        const moduleNames = await this._featuresFlagsService.getSupportFeatureModules();

        this._homeService.registerSubModules(moduleNames);

        this.addAsyncModuleOnInitializedListener();

        // Avoid duplicate register
        this._subModuleRegistered = true;
      }
    }
  }

  addAsyncModuleOnInitializedListener() {
    if (this._homeService.hasModules(['message', 'telephony'])) {
      this._jupiter.onInitialized(
        [MESSAGE_SERVICE, TELEPHONY_SERVICE],
        async (MessageService, TelephonyService) => {
          // TODO create Call HOC in telephony module and add Call component in home module
          const { Call } = await TelephonyService.callComponent();
          MessageService.registerConversationHeaderExtension(Call); // [TelephonyButton, MeetingButton]
        },
      );
    }
  }
}

export { HomeModule };
