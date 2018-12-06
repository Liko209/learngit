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

type ProfileDialogGroupViewProps = ProfileDialogGroupProps & {
  group: GroupModel;
};

export { ProfileDialogGroupProps, ProfileDialogGroupViewProps };
