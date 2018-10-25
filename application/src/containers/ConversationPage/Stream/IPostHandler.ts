/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-10-23 18:25:27
 * Copyright © RingCentral. All rights reserved.
 */
import { FetchDataDirection, ISortableModel } from '@/store/base';

interface IPostHandler {
  /**
   * On post added
   */
  onAdded(
    direction: FetchDataDirection,
    addedItems: ISortableModel[],
    allItems: ISortableModel[],
  ): void;
  /**
   * On post deleted
   */
  onDeleted(deletedItems: number[], allItems: ISortableModel[]): void;
}

export { IPostHandler };
