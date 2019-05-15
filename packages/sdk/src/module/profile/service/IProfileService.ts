/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-12 13:18:31
 * Copyright © RingCentral. All rights reserved.
 */

import { PhoneNumberModel } from 'sdk/module/person/entity';
import { SettingOption } from '../types';

interface IProfileService {
  getDefaultCaller(): Promise<PhoneNumberModel | undefined>;
  updateSettingOptions(options: SettingOption[]): Promise<void>;
}

export { IProfileService };
