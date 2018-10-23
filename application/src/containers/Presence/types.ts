/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-16 15:13:14
 * Copyright © RingCentral. All rights reserved.
 */
import { JuiPresenceProps } from 'jui/components/Presence';
import PresenceModel from '@/store/models/Presence';

type PresenceProps = JuiPresenceProps & {
  uid: number;
};

type PresenceViewProps = JuiPresenceProps & {
  presence: PresenceModel['presence'];
};

export { PresenceProps, PresenceViewProps };
