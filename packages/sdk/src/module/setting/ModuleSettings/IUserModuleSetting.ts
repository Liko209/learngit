/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-02 16:02:59
 * Copyright © RingCentral. All rights reserved.
 */

import { UserSettingEntity } from '../entity';
interface IUserModuleSetting {
  parentModelId?: string;
  id(): number;
  buildSettingItem: () =>
    | Promise<UserSettingEntity<any>>
    | UserSettingEntity<any>;
  getSections?: () => UserSettingEntity<any>[];
  dispose?: () => void;
}
export { IUserModuleSetting };
