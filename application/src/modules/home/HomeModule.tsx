/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-08 17:08:34
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractModule, inject, Jupiter } from 'framework';
import { IHomeService } from './interface/IHomeService';
import { config } from './home.config';
import { service } from 'sdk';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
import { IMessageService } from '@/modules/message/interface';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';

class HomeModule extends AbstractModule {
  @IHomeService private _homeService: IHomeService;
  @inject(Jupiter) private _jupiter: Jupiter;
  private _subModuleRegistered: boolean = false;
  get _featuresFlagsService() {
    return this._jupiter.get(FeaturesFlagsService);
  }

  async bootstrap() {
    // load subModule
    const { notificationCenter, SERVICE } = service;
    notificationCenter.on(SERVICE.RC_LOGIN, async () => {
      await this._initialSubModules();
    });
    notificationCenter.on(SERVICE.GLIP_LOGIN, async (success: boolean) => {
      success && (await this._initialSubModules());
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

  addAsyncModuleOnInitializedListener() {
    if (this._homeService.hasModules(['message', 'telephony'])) {
      this._jupiter.onInitialized(
        [IMessageService, TELEPHONY_SERVICE],
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
