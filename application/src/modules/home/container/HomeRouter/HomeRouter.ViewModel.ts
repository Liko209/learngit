/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 12:28:12
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { container } from 'framework/ioc';
import { computed } from 'mobx';

import { HomeStore } from '../../store';
import { HomeRouterProps, HomeRouterViewProps } from './types';

class HomeRouterViewModel extends StoreViewModel<HomeRouterProps>
  implements HomeRouterViewProps {
  private _homeStore: HomeStore = container.get(HomeStore);

  @computed
  get defaultRouterPath() {
    return this._homeStore.defaultRouterPath;
  }

  @computed
  get routes() {
    return this._homeStore.subRoutes;
  }
}

export { HomeRouterViewModel };
