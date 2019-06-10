/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:22:04
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { VoicemailActionsView } from './VoicemailActions.View';
import { VoicemailActionsViewModel } from './VoicemailActions.ViewModel';
import { VoicemailActionsProps } from './types';

const VoicemailActions = buildContainer<VoicemailActionsProps>({
  View: VoicemailActionsView,
  ViewModel: VoicemailActionsViewModel,
});

export { VoicemailActions };
