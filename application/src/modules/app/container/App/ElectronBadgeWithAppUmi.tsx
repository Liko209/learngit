/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-14 19:24:18
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { container } from 'framework/ioc';
import { ElectronBadge } from '@/modules/electron/container/ElectronBadge';
import { AppStore } from '../../store';

@observer
class ElectronBadgeWithAppUmi extends React.Component {
  private _appStore = container.get(AppStore);

  render() {
    return <ElectronBadge>{this._appStore.umi}</ElectronBadge>;
  }
}

export { ElectronBadgeWithAppUmi };
