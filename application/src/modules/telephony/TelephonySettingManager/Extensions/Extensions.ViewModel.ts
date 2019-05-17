/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-08 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ERCWebSettingUri } from 'sdk/module/rcInfo/types';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { catchError } from '@/common/catchError';
import { observable } from 'mobx';

class ExtensionsViewModel extends StoreViewModel<{}> {
  @observable
  isLoading: boolean;
  rcInfoService = ServiceLoader.getInstance<RCInfoService>(
    ServiceConfig.RC_INFO_SERVICE,
  );

  @catchError.flash({
    network: 'setting.phone.general.extensions.errorText',
    server: 'setting.phone.general.extensions.errorText',
  })
  generateWebSettingUri = async () => {
    this.isLoading = true;
    const url = await this.rcInfoService
      .generateWebSettingUri(ERCWebSettingUri.EXTENSION_URI)
      .catch(error => {
        this.isLoading = false;
        throw error;
      });
    this.isLoading = false;
    url && window.open(url);
    return url;
  }
}

export { ExtensionsViewModel };
