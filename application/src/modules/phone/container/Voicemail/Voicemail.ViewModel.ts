/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-30 16:53:54
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, action, computed } from 'mobx';
import { QUERY_DIRECTION } from 'sdk/dao';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { VoicemailService } from 'sdk/module/RCItems/voicemail';
import { StoreViewModel } from '@/store/ViewModel';
import {
  FetchVoicemailData,
  VoicemailProps,
  VoicemailViewProps,
} from './types';
import { VoicemailListHandler } from './VoicemailListHandler';

class VoicemailViewModel extends StoreViewModel<VoicemailProps>
  implements VoicemailViewProps {
  @observable
  isError = false;

  private _service = ServiceLoader.getInstance<VoicemailService>(
    ServiceConfig.VOICEMAIL_SERVICE,
  );

  @computed
  private get _handler() {
    return new VoicemailListHandler(this._fetchData);
  }

  @computed
  get listHandler() {
    return this._handler.fetchSortableDataListHandler;
  }

  @action
  private _fetchData: FetchVoicemailData = async (
    direction,
    pageSize,
    anchor,
  ) => {
    const realDirection =
      direction === QUERY_DIRECTION.NEWER
        ? QUERY_DIRECTION.OLDER
        : QUERY_DIRECTION.NEWER;

    try {
      return await this._service.fetchVoicemails(
        pageSize,
        realDirection,
        anchor && anchor.id,
      );
    } catch (error) {
      this.isError = true;

      return { data: [], hasMore: true };
    }
  }

  @action
  onErrorReload = () => {
    this.isError = false;
  }
}

export { VoicemailViewModel };
