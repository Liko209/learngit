/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-04 15:57:50
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractViewModel } from '@/base';
import { observable } from 'mobx';
import { NetworkBanner } from './Banners/NetworkBanner';
import { TopBannerConfig, BannerType } from './types';
import { ElectronUpgradeBanner } from './Banners/ElectronUpgradeBanner';
class TopBannerViewModel extends AbstractViewModel {
  @observable
  static data: TopBannerConfig[] = [
    {
      priority: 100,
      Component: NetworkBanner,
      props: {},
      isShow: true,
    },
    {
      priority: 200,
      Component: ElectronUpgradeBanner,
      props: {},
      isShow: false,
    },
  ];

  static showBanner(Comp: BannerType) {
    const config = TopBannerViewModel.data.find(
      ({ Component }) => Component === Comp,
    );
    if (config) {
      config.isShow = true;
    }
  }

  static hideBanner(Comp: BannerType) {
    const config = TopBannerViewModel.data.find(
      ({ Component }) => Component === Comp,
    );
    if (config) {
      config.isShow = false;
    }
  }
}

export { TopBannerViewModel };
