/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

import GroupModel from '@/store/models/Group';

type ProfileDialogGroupProps = {
  id: number;
  dismiss: () => void;
};

type ProfileDialogGroupViewProps = {
  id: number;
  group: GroupModel;
  dismiss: () => void;
};

export { ProfileDialogGroupProps, ProfileDialogGroupViewProps };
