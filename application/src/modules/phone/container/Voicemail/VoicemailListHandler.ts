/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-30 16:35:54
 * Copyright © RingCentral. All rights reserved.
 */
import {
  FetchSortableDataListHandler,
  ISortableModelWithData,
} from '@/store/base/fetch';
import { ENTITY_NAME } from '@/store/constants';
import { SortUtils } from 'sdk/framework/utils';
import { Voicemail } from 'sdk/module/RCItems/voicemail/entity/Voicemail';

import { VoicemailDataProvider } from './VoicemailDataProvider';
import { MESSAGE_AVAILABILITY } from 'sdk/module/RCItems/constants';
import { ENTITY } from 'sdk/service/eventKey';

class VoicemailListHandler {
  fetchSortableDataListHandler: FetchSortableDataListHandler<Voicemail>;
  constructor() {
    const isMatchFunc = (model: Voicemail) => {
      return !!(model && model.availability === MESSAGE_AVAILABILITY.ALIVE);
    };

    const transformFunc = (
      model: Voicemail,
    ): ISortableModelWithData<string> => {
      return {
        id: model.id,
        sortValue: model.id,
        data: model.creationTime,
      };
    };

    const sortFunc = (
      lhs: ISortableModelWithData<string>,
      rhs: ISortableModelWithData<string>,
    ): number => {
      return SortUtils.sortModelByKey(lhs, rhs, ['data'], true);
    };

    const dataProvider = new VoicemailDataProvider();

    this.fetchSortableDataListHandler = new FetchSortableDataListHandler(
      dataProvider,
      {
        isMatchFunc,
        transformFunc,
        sortFunc,
        entityName: ENTITY_NAME.VOICE_MAIL,
        eventName: ENTITY.VOICE_MAIL,
        hasMoreDown: true,
      },
    );
  }

  dispose() {
    this.fetchSortableDataListHandler.dispose();
  }
}

export { VoicemailListHandler };
