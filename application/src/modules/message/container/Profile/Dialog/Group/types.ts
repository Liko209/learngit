/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */
import { createContext } from 'react';
import GroupModel from '@/store/models/Group';
import { JuiSizeManager } from 'jui/components/SizeDetector';

type ProfileDialogGroupProps = {
  id: number; // conversation id
  hasSearch?: boolean;
};

type ProfileContextInfo = {
  sizeManager: JuiSizeManager;
  showEmpty: boolean;
  setShowEmpty: (flag: boolean) => void;
};

type ProfileDialogGroupViewProps = ProfileDialogGroupProps & {
  group: GroupModel;
};

const ProfileContext = createContext({} as ProfileContextInfo);

export { ProfileDialogGroupProps, ProfileDialogGroupViewProps, ProfileContext };
