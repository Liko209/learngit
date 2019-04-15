/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-10-23 18:25:27
 * Copyright © RingCentral. All rights reserved.
 */
import { Post } from 'sdk/module/post/entity';
import { ISortableModel, ISortableModelWithData } from '@/store/base';
import { QUERY_DIRECTION } from 'sdk/dao';

interface IPostHandler {
  /**
   * On post added
   */
  onAdded(
    direction: QUERY_DIRECTION,
    addedItems: ISortableModelWithData<Post>[],
    allItems: ISortableModelWithData<Post>[],
    hasMore: boolean,
  ): void;
  /**
   * On post deleted
   */
  onDeleted(deletedItems: number[], allItems: ISortableModel[]): void;
}

export { IPostHandler };
