/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-13 09:53:17
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable } from 'mobx';
import { AbstractViewModel } from '@/base';
import { ConvertToTeamProps, ConvertToTeamViewProps } from './types';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { ENTITY_NAME } from '@/store';
import GroupService, { TeamSetting, Group } from 'sdk/module/group';

class ConvertToTeamViewModel extends AbstractViewModel<ConvertToTeamProps>
  implements ConvertToTeamViewProps {
  @observable
  name: string = '';
  @observable
  description: string = '';
  @observable
  disabledOkBtn: boolean = true;
  @observable
  nameErrorKey: string = '';
  @observable
  saving: boolean = false;

  @computed
  get group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.props.id);
  }

  handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value.trim();
    this.name = name;
    this.disabledOkBtn = name === '';
    this.nameErrorKey = '';
  }

  handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.description = e.target.value.trim();
  }

  save = async (teamSetting: TeamSetting): Promise<Group | null> => {
    const groupService: GroupService = GroupService.getInstance();
    this.saving = true;
    const result = await groupService.createTeam(1, [1], teamSetting);
    this.saving = false;
    return result;
  }
}

export { ConvertToTeamViewModel };
