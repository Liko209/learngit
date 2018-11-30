/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-30 18:29:41
 * Copyright © RingCentral. All rights reserved.
 */

import PersonModel from '@/store/models/Person';

type ActivityData = {
  [index: string]: any;
};

type TeamProps = {
  id: number;
};

type TeamViewProps = {
  activityData: ActivityData;
  createdAt: string;
  getPerson: (id: number) => PersonModel;
};

export { TeamProps, TeamViewProps };
