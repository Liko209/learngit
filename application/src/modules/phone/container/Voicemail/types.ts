/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-28 13:54:11
 * Copyright © RingCentral. All rights reserved.
 */
import { QUERY_DIRECTION } from 'sdk/dao';
import { Voicemail } from 'sdk/module/RCItems/voicemail/entity/Voicemail';
import { FetchDataOptions } from 'sdk/module/RCItems/types';
import {
  ISortableModel,
  FetchSortableDataListHandler,
} from '@/store/base/fetch';
import { IJuiChangePhoneFilter } from 'jui/pattern/Phone/Filter';

type VoicemailProps = {};

type ActiveVoicemailId = number | null;

type VoicemailViewProps = {
  isError: boolean;
  filterValue: string;
  activeVoicemailId: ActiveVoicemailId;
  onFilterChange: IJuiChangePhoneFilter;
  onVoicemailPlay: (id: ActiveVoicemailId) => void;
  onErrorReload: () => void;
  listHandler: FetchSortableDataListHandler<Voicemail>;
};

type FetchVoicemailData = (
  direction: QUERY_DIRECTION,
  pageSize: number,
  anchor?: ISortableModel,
) => Promise<{ data: Voicemail[]; hasMore: boolean }>;

type VoicemailFilterOptions = FetchDataOptions<Voicemail>;

type VoicemailFilterFunc = null | ((data: Voicemail) => boolean);

export {
  ActiveVoicemailId,
  FetchVoicemailData,
  VoicemailFilterFunc,
  VoicemailFilterOptions,
  VoicemailProps,
  VoicemailViewProps,
};
