/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-30 16:53:54
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { VoicemailProps, VoicemailViewProps } from './types';
import { VoicemailListHandler } from './VoicemailListHandler';

class VoicemailViewModel extends StoreViewModel<VoicemailProps>
  implements VoicemailViewProps {
  @computed
  get listHandler() {
    return new VoicemailListHandler().fetchSortableDataListHandler;
  }
}

export { VoicemailViewModel };
