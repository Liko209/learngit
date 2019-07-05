/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-12 13:18:31
 * Copyright © RingCentral. All rights reserved.
 */

import { SettingOption } from '../types';
import { Profile } from '../entity';

interface IProfileService {
  updateSettingOptions(options: SettingOption[]): Promise<void>;
  getProfile(): Promise<Profile>;
}

export { IProfileService };
