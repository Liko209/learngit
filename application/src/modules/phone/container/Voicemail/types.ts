/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-28 13:54:11
 * Copyright © RingCentral. All rights reserved.
 */
import { FetchSortableDataListHandler } from '@/store/base/fetch';
// import { VoicemailListHandler } from './VoicemailListHandler';
import { Voicemail } from 'sdk/module/RCItems/voicemail/entity/Voicemail';

type VoicemailProps = {};
type VoicemailViewProps = {
  listHandler: FetchSortableDataListHandler<Voicemail>;
};

export { VoicemailProps, VoicemailViewProps };
