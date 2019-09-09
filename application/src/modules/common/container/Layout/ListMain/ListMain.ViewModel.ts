/*
 * @Author: isaac.liu
 * @Date: 2019-06-03 13:42:18
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, action } from 'mobx';
import { FetchSortableDataListHandler } from '@/store/base';

import { HoverControllerViewModel } from '../HoverController';
import { ListMainProps } from './types';

class ListMainViewModel extends HoverControllerViewModel<ListMainProps> {
  @observable isError = false;
  @observable searchKey: string;
  @observable listHandler: FetchSortableDataListHandler<any>;

  constructor(props: ListMainProps) {
    super(props);
    if (props.filter && props.filter.initFilterKey) {
      this.searchKey = props.filter.initFilterKey();
    }

    this.reaction(
      () => this.searchKey,
      (searchKey: string) => {
        this._createHandler(searchKey);
      },
      { fireImmediately: true },
    );
  }

  private _createHandler(searchKey: string) {
    try {
      const ret = this.props.createHandler(searchKey);
      if (ret instanceof Promise) {
        ret.then((handler: FetchSortableDataListHandler<any>) => {
          this.listHandler = handler;
        });
      } else {
        this.listHandler = ret;
      }
    } catch (e) {
      this.isError = true;
    }
  }

  @action
  setSearchKey = (value: string) => {
    const filter = this.props.filter;
    this.searchKey = value;
    if (filter && filter.onChange) {
      filter.onChange(value);
    }
  };

  @action
  onErrorReload = () => {
    this.isError = false;
    this._createHandler(this.searchKey);
  };
}

export { ListMainViewModel };
