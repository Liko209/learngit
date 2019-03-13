/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-13 09:50:58
 * Copyright © RingCentral. All rights reserved.
 */

import GroupModel from '@/store/models/Group';

type ConvertToTeamProps = {
  id: number; // group id
};

type ConvertToTeamViewProps = {
  saving: boolean;
  group: GroupModel;
};

export { ConvertToTeamProps, ConvertToTeamViewProps };
