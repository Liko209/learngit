/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-16 15:13:14
 * Copyright © RingCentral. All rights reserved.
 */
// import { JuiPresenceProps } from 'jui/components/Presence';
import { PRESENCE } from 'sdk/src/service';

type PresenceProps = {
  uid: number;
  size?: 'small' | 'medium' | 'large' | 'profile';
  borderSize?: 'small' | 'medium' | 'large' | 'profile';
};

type PresenceViewProps = {
  presence: PRESENCE;
  size?: 'small' | 'medium' | 'large' | 'profile';
  borderSize?: 'small' | 'medium' | 'large' | 'profile';
};

export { PresenceProps, PresenceViewProps };
