/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-07-18 10:13:13
 * Copyright Â© RingCentral. All rights reserved.
 */

import { TelephonyDataCollectionInfoConfigType } from '../types';
import { Call } from '../entity';

export interface ITelephonyService {
  getVoipCallPermission: () => Promise<boolean>;
  getRingerDevicesList: () => MediaDeviceInfo[];
  isEmergencyAddrConfirmed: () => boolean;
  setDataCollectionInfoConfig: (
    info: TelephonyDataCollectionInfoConfigType,
  ) => void;
  getAllCallCount: () => number;
  getById(id: number): Promise<Call | null>;
  hasActiveDL(): boolean;
}
