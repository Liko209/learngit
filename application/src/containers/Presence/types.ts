/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-16 15:13:14
 * Copyright © RingCentral. All rights reserved.
 */
import PresenceModel from '@/store/models/Presence';

type PresenceProps = {
  id: number;
};

type PresenceViewProps = {
  presence: PresenceModel['presence'];
};

export { PresenceProps, PresenceViewProps };
