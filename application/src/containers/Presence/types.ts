/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-16 15:13:14
 * Copyright © RingCentral. All rights reserved.
 */
import { PRESENCE } from 'sdk/module/presence/constant';

type PresenceProps = {
  uid: number;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  borderSize?: 'small' | 'medium' | 'large' | 'xlarge';
};

type PresenceViewProps = {
  presence: PRESENCE;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  borderSize?: 'small' | 'medium' | 'large' | 'xlarge';
};

export { PresenceProps, PresenceViewProps };
