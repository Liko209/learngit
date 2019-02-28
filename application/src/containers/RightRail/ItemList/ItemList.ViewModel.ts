/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { computed, observable, comparer } from 'mobx';

import { ItemListDataSource } from './ItemList.DataSource';
import { Props, ViewProps } from './types';

class ItemListViewModel extends StoreViewModel<Props> implements ViewProps {
  @observable
  private _dataSource: ItemListDataSource;
  constructor(props: Props) {
    super(props);
    this.reaction(
      () => ({ groupId: this.props.groupId, type: this.props.type }),
      (data: Props) => {
        const { groupId, type } = data;
        if (this._dataSource) {
          this._dataSource.dispose();
        }
        this._dataSource = new ItemListDataSource({ groupId, type });
      },
      { fireImmediately: true, equals: comparer.structural },
    );
  }

  @computed
  get dataSource() {
    return this._dataSource;
  }

  @computed
  get width() {
    return this.props.width;
  }

  @computed
  get height() {
    return this.props.height;
  }

  dispose = () => {
    this._dataSource.dispose();
  }
}

export { ItemListViewModel };
