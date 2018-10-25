/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-10-23 18:25:27
 * Copyright © RingCentral. All rights reserved.
 */
import { Post } from 'sdk/src/models';
import { FetchDataDirection, ISortableModel } from '@/store/base';

interface IPostHandler {
  /**
   * On post added
   */
  onAdded(
    direction: FetchDataDirection,
    addedItems: ISortableModel<Post>[],
    allItems: ISortableModel<Post>[],
  ): void;
  /**
   * On post deleted
   */
  onDeleted(deletedItems: number[], allItems: ISortableModel[]): void;
}

export { IPostHandler };
