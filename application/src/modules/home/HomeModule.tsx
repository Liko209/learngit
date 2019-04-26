/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-08 17:08:34
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractModule, inject, ModuleManager } from 'framework';
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
  @inject(ModuleManager) private _moduleManager: ModuleManager;
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

    // featuresFlag changed
    // setTimeout(() => {
    //   // Remove Telephony Feature Flag => unRegister telephony module
    //   console.log('---[HomeModule]: unRegister telephony');
    //   this._homeService.unRegisterModule('telephony');
    // },         20000);
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
      this._moduleManager.onInitialized(
        [MESSAGE_SERVICE, TELEPHONY_SERVICE],
        async (MessageService, TelephonyService) => {
          console.log(
            '---[ModuleManager]: MESSAGE_SERVICE TELEPHONY_SERVICE is initialed',
            MessageService,
            TelephonyService,
          );
          // TODO
          // create Call HOC in telephony module and add Call component in home module
          const { Call } = await TelephonyService.callComponent();
          MessageService.registerConversationHeaderExtension(Call); // [TelephonyButton, MeetingButton]
        },
      );

      this._moduleManager.onDisposed(TELEPHONY_SERVICE, () => {
        console.log('---[ModuleManager]: TELEPHONY_SERVICE is disposed');
      });
    }
  }
}

export { HomeModule };
