/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-13 10:50:35
 * Copyright © RingCentral. All rights reserved.
 */
import { CONVERSATION_TYPES } from '@/constants';

type MenuProps = {
  id: number;
};

type MenuViewProps = {
  profileId: number;
  isAdmin: boolean;
  isCompanyTeam: boolean;
  groupType: CONVERSATION_TYPES;
};

export { MenuProps, MenuViewProps };
