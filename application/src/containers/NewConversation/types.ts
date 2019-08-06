/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-07-22 10:51:16
 * Copyright © RingCentral. All rights reserved.
 */

import GroupModel from '@/store/models/Group';

type Props = {
  group: GroupModel;
};

type ViewProps = {
  members: (number | string)[];
  loading: boolean;
  disabledOkBtn: boolean;
  handleSearchContactChange: (items: any) => void;
  handleClose: () => void;
  createNewConversation: () => void;
};

export { Props, ViewProps };
