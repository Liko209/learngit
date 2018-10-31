/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-10-23 18:25:27
 * Copyright © RingCentral. All rights reserved.
 */
import { observable } from 'mobx';
import { Post } from 'sdk/src/models';
import { FetchDataDirection, ISortableModel } from '@/store/base';
import { DateSeparator } from './types';
import { ISeparatorHandler } from './ISeparatorHandler';

// TODO
class DateSeparatorHandler implements ISeparatorHandler {
  priority: number;
  @observable
  separatorMap: Map<number, DateSeparator>;

  onAdded(
    direction: FetchDataDirection,
    addedItems: ISortableModel<Post>[],
    allItems: ISortableModel<Post>[],
  ): void {
    throw new Error('Method not implemented.');
  }

  onDeleted(deletedItems: number[], allItems: ISortableModel<any>[]): void {
    throw new Error('Method not implemented.');
  }
}

export { DateSeparatorHandler };
