/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-13 09:53:17
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractViewModel } from '@/base';
import { GroupSettingsProps, GroupSettingsViewProps } from './types';

class GroupSettingsViewModel extends AbstractViewModel<GroupSettingsProps>
  implements GroupSettingsViewProps {}

export { GroupSettingsViewModel };
