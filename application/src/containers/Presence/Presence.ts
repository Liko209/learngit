/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-16 10:56:55
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { PresenceView } from './Presence.View';
import { PresenceViewModel } from './Presence.ViewModel';
import { PresenceProps } from './types';

const Presence = buildContainer<PresenceProps>({
  ViewModel: PresenceViewModel,
  View: PresenceView,
});

export { Presence, PresenceProps };
