/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-01-15 15:03:48
 * Copyright © RingCentral. All rights reserved.
 */
import { WithNamespaces } from 'react-i18next';
import GroupModel from '@/store/models/Group';

type ViewModuleProps = {
  group: GroupModel;
};

type ViewProps = WithNamespaces &
  ViewModuleProps & {
    disabledOkBtn: boolean;
    members: number[];
    addTeamMembers: () => void;
    handleSearchContactChange: (items: any) => void;
  };

export { ViewProps, ViewModuleProps };
