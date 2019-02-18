/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { computed } from 'mobx';

import { TAB_CONFIG } from './config';
import { ItemListDataSource } from './ItemList.DataSource';
import { Props, ViewProps } from './types';

class ItemListViewModel extends StoreViewModel<Props> implements ViewProps {
  @computed
  get tabConfig() {
    return TAB_CONFIG.find(looper => looper.type === this.props.type)!;
  }

  @computed
  get dataSource() {
    const { groupId, type } = this.props;
    return new ItemListDataSource({ groupId, type });
  }
}

export { ItemListViewModel };
