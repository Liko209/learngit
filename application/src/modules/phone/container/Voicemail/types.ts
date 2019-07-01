/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-28 13:54:11
 * Copyright © RingCentral. All rights reserved.
 */
import { QUERY_DIRECTION } from 'sdk/dao';
import { Voicemail } from 'sdk/module/RCItems/voicemail/entity/Voicemail';
import {
  ISortableModel,
  FetchSortableDataListHandler,
} from '@/store/base/fetch';

type VoicemailProps = {};

type VoicemailViewProps = {
  isError: boolean;
  onErrorReload: () => void;
  listHandler: FetchSortableDataListHandler<Voicemail>;
};

type FetchVoicemailData = (
  direction: QUERY_DIRECTION,
  pageSize: number,
  anchor?: ISortableModel,
) => Promise<{ data: Voicemail[]; hasMore: boolean }>;

export { FetchVoicemailData, VoicemailProps, VoicemailViewProps };
