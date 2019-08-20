/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-14 18:36:30
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable, action } from 'mobx';
import { NetworkBanner } from '../container/TopBanner/Banners/NetworkBanner';
import { TopBannerConfig, BannerType } from '../container/TopBanner/types';
import { ElectronUpgradeBanner } from '../container/TopBanner/Banners/ElectronUpgradeBanner';
import { NotificationEnableBanner } from '../container/TopBanner/Banners/NotificationEnableBanner';
import { SwitchCallBanner } from '../container/TopBanner/Banners/SwitchCallBanner';
import { DndBanner } from '../container/TopBanner/Banners/DndBanner';

class AppStore {
  readonly name = process.env.APP_NAME || '';

  @observable
  topBanners: TopBannerConfig[] = [
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
    {
      priority: 200,
      Component: DndBanner,
      props: {},
      isShow: true,
    },
    {
      priority: 300,
      Component: SwitchCallBanner,
      props: {},
      isShow: true,
    },
    {
      priority: 400,
      Component: NotificationEnableBanner,
      props: {},
      isShow: true,
    },
  ];

  @observable
  private _messageUmi: number = 0;
  @observable
  private _phoneUmi: number = 0;

  @observable
  private _globalLoading: boolean = false;

  @computed
  get umi() {
    return this._messageUmi + this._phoneUmi;
  }

  @action
  setMessageUmi(umi: number) {
    this._messageUmi = umi;
  }

  @action
  setPhoneUmi(umi: number) {
    this._phoneUmi = umi;
  }

  @computed
  get globalLoading() {
    return this._globalLoading;
  }

  @action
  setGlobalLoading(globalLoading: boolean) {
    this._globalLoading = globalLoading;
  }

  @action
  showBanner(Comp: BannerType, props: object = {}) {
    const config = this.topBanners.find(({ Component }) => Component === Comp);
    if (config) {
      config.props = props;
      config.isShow = true;
    }
  }

  @action
  hideBanner(Comp: BannerType) {
    const config = this.topBanners.find(({ Component }) => Component === Comp);
    if (config) {
      config.isShow = false;
    }
  }
}

export { AppStore };
