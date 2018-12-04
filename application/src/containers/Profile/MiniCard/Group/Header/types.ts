/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

import GroupModel from '@/store/models/Group';

type ProfileMiniCardGroupHeaderProps = {
  id: number;
};

type ProfileMiniCardGroupHeaderViewProps = {
  id: number;
  group: GroupModel;
};

export { ProfileMiniCardGroupHeaderProps, ProfileMiniCardGroupHeaderViewProps };
