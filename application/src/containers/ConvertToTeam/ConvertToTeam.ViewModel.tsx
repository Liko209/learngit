/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-13 09:53:17
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action, Reaction } from 'mobx';
import { AbstractViewModel } from '@/base';
import { ConvertToTeamProps, ConvertToTeamViewProps } from './types';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { ENTITY_NAME } from '@/store';
import GroupService, { TeamSetting, Group } from 'sdk/module/group';
import { JError, ERROR_TYPES, ERROR_CODES_SERVER } from 'sdk/error';

class ConvertToTeamViewModel extends AbstractViewModel<ConvertToTeamProps>
  implements ConvertToTeamViewProps {
  @observable
  name: string = '';
  @observable
  description: string = '';
  @observable
  nameErrorKey: string = '';
  @observable
  saving: boolean = false;
  @observable
  firstRenderName: boolean = false;

  constructor(props: ConvertToTeamProps) {
    super(props);
    this.reaction(
      () => this.group.displayName,
      (displayName: string, reaction: Reaction) => {
        this.name = displayName;
        this.firstRenderName = true;
        reaction.dispose();
      },
      {
        fireImmediately: true,
      },
    );
  }

  @computed
  get disabledOkBtn() {
    return this.name === '';
  }

  @computed
  get group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.props.id);
  }

  @action
  handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.name = e.target.value;
    this.firstRenderName = false;
    this.nameErrorKey = '';
  }

  @action
  handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.description = e.target.value;
  }

  save = async (teamSetting: TeamSetting): Promise<Group | null> => {
    try {
      const { id } = this.props;
      const groupService: GroupService = GroupService.getInstance();
      this.saving = true;
      const result = await groupService.convertToTeam(
        id,
        this.group.members,
        teamSetting,
      );
      this.saving = false;
      return result;
    } catch (error) {
      this.saving = false;
      const unknownError = this._createErrorHandler(error);
      if (unknownError) {
        throw new Error(error.message);
      }
      return null;
    }
  }

  private _createErrorHandler(error: JError) {
    let serverUnknownError = false;
    if (
      error.isMatch({
        type: ERROR_TYPES.SERVER,
        codes: [ERROR_CODES_SERVER.ALREADY_TAKEN],
      })
    ) {
      this.nameErrorKey = 'people.prompt.alreadyTaken';
    } else {
      serverUnknownError = true;
    }
    return serverUnknownError;
  }
}

export { ConvertToTeamViewModel };
