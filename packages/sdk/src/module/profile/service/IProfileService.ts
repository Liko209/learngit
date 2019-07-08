/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-12 13:18:31
 * Copyright © RingCentral. All rights reserved.
 */

import { SettingOption } from '../types';
import { Profile } from '../entity';
import { Nullable } from 'sdk/types';

interface IProfileService {
  updateSettingOptions(options: SettingOption[]): Promise<void>;
  getProfile(): Promise<Nullable<Profile>>;
}

export { IProfileService };
