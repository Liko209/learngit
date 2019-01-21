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
import portalManager from '@/common/PortalManager';
import { ViewProps } from './types';
import { JuiTextField } from 'jui/components/Forms/TextField';
import { GroupAvatar } from '@/containers/Avatar';
import { toTitleCase } from '@/utils/string';

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

  static NAME_INPUT_PROPS = {
    maxLength: NAME_MAX_LENGTH,
  };

  static DESCRIPTION_INPUT_PROPS = {
    maxLength: DESC_MAX_LENGTH,
  };

  handleClose = () => portalManager.dismiss();
  handleOk = async () => {
    const shouldClose = await this.props.save({
      name: this.state.name,
      description: this.state.description,
    });
    if (shouldClose) {
      portalManager.dismiss();
    }
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
    const { t, id, nameErrorMsg } = this.props;

    return (
      <JuiTeamSettingEditSection>
        <JuiTeamSettingEditSectionLeft>
          <GroupAvatar
            cid={id}
            size="xlarge"
            data-test-automation-id="teamAvatar"
          />
        </JuiTeamSettingEditSectionLeft>
        <JuiTeamSettingEditSectionRight>
          <JuiTextField
            label={t('teamName')}
            data-test-automation-id="teamName"
            value={this.state.name}
            fullWidth={true}
            error={!!nameErrorMsg}
            inputProps={TeamSettings.NAME_INPUT_PROPS}
            helperText={t(nameErrorMsg || '')}
            onChange={this.handleNameChange}
          />
          <JuiTextarea
            label={t('teamDescription')}
            data-test-automation-id="teamDescription"
            value={this.state.description}
            inputProps={TeamSettings.DESCRIPTION_INPUT_PROPS}
            fullWidth={true}
            onChange={this.handleDescriptionChange}
          />
        </JuiTeamSettingEditSectionRight>
      </JuiTeamSettingEditSection>
    );
  }

  render() {
    const { isAdmin, t } = this.props;
    const disabledOkBtn =
      !this.state.name || this.state.name.trim().length <= 0;
    return (
      <JuiModal
        open={true}
        size={'medium'}
        modalProps={{ scroll: 'body' }}
        okBtnProps={{ disabled: disabledOkBtn }}
        title={t('Settings')}
        onCancel={this.handleClose}
        onOK={this.handleOk}
        okText={toTitleCase(t('save'))}
        cancelText={toTitleCase(t('cancel'))}
      >
        {isAdmin ? this.renderEditSection() : null}
      </JuiModal>
    );
  }
}

const TeamSettingsView = translate()(TeamSettings);
const TeamSettingsComponent = TeamSettings;

export { TeamSettingsView, TeamSettingsComponent };
