/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:49:32
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action } from 'mobx';
import { SearchService } from 'sdk/module/search';
import { IndexRange } from 'jui/components/VirtualizedList/types';
import { ItemListViewProps, SearchItemTypes } from './types';
import { SearchCellViewModel } from '../common/SearchCell.ViewModel';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { changeToRecordTypes } from '../common/changeTypes';

class ItemListViewModel extends SearchCellViewModel<ItemListViewProps> {
  @observable startIndex: number = 0;
  @observable stopIndex: number = 0;

  @action
  setRangeIndex = (range: IndexRange) => {
    this.startIndex = range.startIndex;
    this.stopIndex = range.stopIndex;
  }

  @action
  onKeyDown = (list: number[]) => {
    const selectIndex = this.selectIndex;
    const len = list.length - 1;
    this.selectIndex = selectIndex === len ? len : selectIndex + 1;
  }

  @action
  onEnter = (
    e: KeyboardEvent,
    list: number[],
    currentItemType: SearchItemTypes,
  ) => {
    const currentItemValue = list[this.selectIndex];
    this.onSelectItem(e, currentItemValue, currentItemType);
    this.addRecentRecord(currentItemType, currentItemValue);
  }

  addRecentRecord = (
    currentItemType: SearchItemTypes,
    value: number | string,
  ) => {
    const type = changeToRecordTypes(currentItemType);
    const searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );
    searchService.addRecentSearchRecord(type, value);
  }
}

export { ItemListViewModel };
