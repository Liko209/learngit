/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-15 15:18:00
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { observer } from 'mobx-react';
import { JuiModal } from 'jui/components/Dialog';
import { JuiTextarea } from 'jui/components/Forms/Textarea';
import {
  JuiTeamSettingEditSection,
  JuiTeamSettingEditSectionLeft,
  JuiTeamSettingEditSectionRight,
} from 'jui/pattern/TeamSetting';
import { CreateTeam } from '@/containers/CreateTeam';
import portalManager from '@/common/PortalManager';
import { ViewProps } from './types';
import { JuiTextField } from 'jui/components/Forms/TextField';
import { GroupAvatar } from '@/containers/Avatar';

type State = {
  name: string;
  description: string;
};

type TeamSettingsProps = WithNamespaces & ViewProps;

const NAME_MAX_LENGTH = 200;
const DESC_MAX_LENGTH = 1000;

@observer
class TeamSettings extends React.Component<TeamSettingsProps, State> {
  constructor(props: TeamSettingsProps) {
    super(props);
    this.state = {
      name: props.initialData.name,
      description: props.initialData.description,
    };
  }

  onClose = () => portalManager.dismiss();
  onOk = () => {
    this.props.save({
      name: this.state.name,
      description: this.state.description,
    });
  }

  openCreateTeam = () => {
    this.onClose();
    CreateTeam.show();
  }

  handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      name: e.target.value,
    });
  }

  handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      description: e.target.value,
    });
  }

  renderEditSection() {
    const { t, id, nameError, nameErrorMsg } = this.props;

    return (
      <JuiTeamSettingEditSection>
        <JuiTeamSettingEditSectionLeft>
          <GroupAvatar cid={id} size="xlarge" />
        </JuiTeamSettingEditSectionLeft>
        <JuiTeamSettingEditSectionRight>
          <JuiTextField
            id="names"
            label="Team Names"
            value={this.state.name}
            fullWidth={true}
            error={nameError}
            inputProps={{
              maxLength: NAME_MAX_LENGTH,
            }}
            helperText={t(nameErrorMsg || '')}
            onChange={this.handleNameChange}
          />
          <JuiTextarea
            id="Description"
            label="Description"
            value={this.state.description}
            inputProps={{
              maxLength: DESC_MAX_LENGTH,
            }}
            fullWidth={true}
            onChange={this.handleDescriptionChange}
          />
        </JuiTeamSettingEditSectionRight>
      </JuiTeamSettingEditSection>
    );
  }

  render() {
    const { isAdmin } = this.props;
    const disabledOkBtn =
      !this.state.name || this.state.name.trim().length <= 0;
    return (
      <JuiModal
        open={true}
        size={'medium'}
        modalProps={{ scroll: 'body' }}
        okBtnProps={{ disabled: disabledOkBtn }}
        title="Settings"
        onCancel={this.onClose}
        onOK={this.onOk}
        okText="Save"
        cancelText="Cancel"
      >
        {isAdmin ? this.renderEditSection() : null}
      </JuiModal>
    );
  }
}

const TeamSettingsView = translate()(TeamSettings);
const TeamSettingsComponent = TeamSettings;

export { TeamSettingsView, TeamSettingsComponent };
