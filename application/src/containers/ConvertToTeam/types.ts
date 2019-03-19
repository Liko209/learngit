/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-13 09:50:58
 * Copyright © RingCentral. All rights reserved.
 */

import GroupModel from '@/store/models/Group';
import { TeamSetting, Group } from 'sdk/module/group';

type ConvertToTeamProps = {
  id: number; // group id
};

type ConvertToTeamViewProps = {
  name: string;
  description: string;
  nameErrorKey: string;
  firstRenderName: boolean;
  saving: boolean;
  disabledOkBtn: boolean;
  group: GroupModel;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  save: (teamSetting: TeamSetting) => Promise<Group | null>;
};

export { ConvertToTeamProps, ConvertToTeamViewProps };
