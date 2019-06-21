/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-30 16:04:11
 * Copyright © RingCentral. All rights reserved.
 */

import { IFetchSortableDataProvider, ISortableModel } from '@/store/base/fetch';
import { QUERY_DIRECTION } from 'sdk/dao';
import { VoicemailService } from 'sdk/module/RCItems/voicemail';
import { Voicemail } from 'sdk/module/RCItems/voicemail/entity/Voicemail';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { catchError } from '@/common/catchError';

class VoicemailDataProvider implements IFetchSortableDataProvider<Voicemail> {
  @catchError.flash({
    network: 'phone.prompt.notAbleToLoadVoicemailsForNetworkIssue',
    server: 'phone.prompt.notAbleToLoadVoicemailsForServerIssue',
  })
  async fetchData(
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor?: ISortableModel,
  ): Promise<{ data: Voicemail[]; hasMore: boolean }> {
    const voicemailService = ServiceLoader.getInstance<VoicemailService>(
      ServiceConfig.VOICEMAIL_SERVICE,
    );
    const realDirection =
      direction === QUERY_DIRECTION.NEWER
        ? QUERY_DIRECTION.OLDER
        : QUERY_DIRECTION.NEWER;
    return await voicemailService.fetchVoicemails(
      pageSize,
      realDirection,
      anchor && anchor.id,
    );
  }
}

export { VoicemailDataProvider };
