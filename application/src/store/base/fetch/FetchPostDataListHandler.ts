/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-03-28 17:25:10
 * Copyright © RingCentral. All rights reserved.
 */

import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
  IFetchSortableDataListHandlerOptions,
} from './FetchSortableDataListHandler';
import { Post } from 'sdk/module/post/entity';
import { SortableListStore } from './SortableListStore';
import { ENTITY, EVENT_TYPES } from 'sdk/service';
import { QUERY_DIRECTION } from 'sdk/dao';
import { mainLogger } from 'foundation/log';
import { ISortableModel } from './types';

const LOG_TAG = 'FetchPostDataListHandler';

class FetchPostDataListHandler extends FetchSortableDataListHandler<
  Post,
  number
> {
  constructor(
    dataProvider: IFetchSortableDataProvider<Post>,
    options: IFetchSortableDataListHandlerOptions<Post>,
    groupId: number,
    listStore: SortableListStore<
      number,
      ISortableModel
    > = new SortableListStore(options.sortFunc),
  ) {
    super(dataProvider, options, listStore);
    this.subscribeNotification(
      `${ENTITY.FOC_RELOAD}.${groupId}`,
      (ids: number[]) => {
        mainLogger.info(LOG_TAG, `reload group ${groupId}`);
        this.handleHasMore({ older: true }, QUERY_DIRECTION.OLDER);
        this.handleDataDeleted({
          type: EVENT_TYPES.DELETE,
          body: { ids },
        });
        this.fetchData(QUERY_DIRECTION.OLDER);
      },
    );
  }
}

export { FetchPostDataListHandler };
