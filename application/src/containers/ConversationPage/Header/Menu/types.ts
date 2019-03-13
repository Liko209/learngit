/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-13 10:50:35
 * Copyright © RingCentral. All rights reserved.
 */

import GroupModel from '@/store/models/Group';

type MenuProps = {
  id: number;
};

type MenuViewProps = {
  group: GroupModel;
};

export { MenuProps, MenuViewProps };
