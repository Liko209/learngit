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
  JuiTeamSettingEditSection as EditSection,
  JuiTeamSettingEditSectionLeft as EditSectionLeft,
  JuiTeamSettingEditSectionRight as EditSectionRight,
  JuiTeamSettingSubSection as SubSection,
  JuiTeamSettingSubSectionTitle as SubSectionTitle,
  JuiTeamSettingSubSectionList as SubSectionList,
  JuiTeamSettingSubSectionListItem as SubSectionListItem,
  JuiTeamSettingButtonList as ButtonList,
  JuiTeamSettingButtonListItem as ButtonListItem,
  JuiTeamSettingButtonListItemText as ButtonListItemText,
} from 'jui/pattern/TeamSetting';
import portalManager from '@/common/PortalManager';
import { ViewProps } from './types';
import { JuiTextField } from 'jui/components/Forms/TextField';
import { GroupAvatar } from '@/containers/Avatar';
import { toTitleCase } from '@/utils/string';
import { JuiDivider } from 'jui/components/Divider';
import { JuiToggleButton, JuiIconButton } from 'jui/components/Buttons';
import { Dialog } from '@/containers/Dialog';

type State = {
  name: string;
  description: string;
  allowMemberAddMember: boolean;
  allowMemberPost: boolean;
  allowMemberPin: boolean;
};

type TeamSettingsProps = WithNamespaces & ViewProps;

const NAME_MAX_LENGTH = 200;
const DESC_MAX_LENGTH = 1000;

@observer
class TeamSettings extends React.Component<TeamSettingsProps, State> {
  constructor(props: TeamSettingsProps) {
    super(props);
    const {
      initialData: {
        name,
        description,
        allowMemberAddMember,
        allowMemberPost,
        allowMemberPin,
      },
    } = props;
    this.state = {
      name,
      description,
      allowMemberAddMember,
      allowMemberPost,
      allowMemberPin,
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
    const shouldClose = await this.props.save(this.state);
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

  handleAllowMemberAddMemberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    this.setState({
      allowMemberAddMember: checked,
    });
  }

  handleAllowMemberPostChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    this.setState({
      allowMemberPost: checked,
      allowMemberPin: checked,
    });
  }

  handleAllowMemberPinChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    this.setState({
      allowMemberPin: checked,
    });
  }

  handleLeaveTeamClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const { t, groupName } = this.props;
    portalManager.dismiss();
    Dialog.confirm({
      modalProps: { 'data-test-automation-id': 'leaveTeamConfirmDialog' },
      okBtnProps: { 'data-test-automation-id': 'leaveTeamOkButton' },
      cancelBtnProps: { 'data-test-automation-id': 'leaveTeamCancelButton' },
      size: 'small',
      okType: 'negative',
      title: t('leaveTeamConfirmTitle'),
      content: t('leaveTeamConfirmContent', {
        teamName: groupName,
      }),
      okText: toTitleCase(t('leaveTeamConfirmOk')),
      cancelText: toTitleCase(t('cancel')),
      onOK: this.leaveTeamOKButtonHandler,
    });
  }

  handleDeleteTeamClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const { t, groupName, deleteTeam } = this.props;
    const dialog = Dialog.confirm({
      modalProps: { 'data-test-automation-id': 'deleteTeamConfirmDialog' },
      okBtnProps: { 'data-test-automation-id': 'deleteTeamOkButton' },
      cancelBtnProps: { 'data-test-automation-id': 'deleteTeamCancelButton' },
      size: 'small',
      okType: 'negative',
      title: t('deleteTeamConfirmTitle'),
      content: t('deleteTeamConfirmContent', {
        teamName: groupName,
      }),
      okText: toTitleCase(t('deleteTeamConfirmOk')),
      cancelText: toTitleCase(t('cancel')),
      onOK: async () => {
        dialog.startLoading();
        await deleteTeam();
        dialog.stopLoading();
        dialog.dismiss();
        portalManager.dismiss();
      },
    });
  }

  leaveTeamOKButtonHandler = async () => {
    portalManager.dismiss();
    this.props.leaveTeam();
  }

  renderEditSection() {
    const { t, id, nameErrorMsg } = this.props;

    return (
      <EditSection>
        <EditSectionLeft>
          <GroupAvatar
            cid={id}
            size="xlarge"
            data-test-automation-id="teamAvatar"
          />
        </EditSectionLeft>
        <EditSectionRight>
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
        </EditSectionRight>
      </EditSection>
    );
  }

  renderMemberPermissionSettings() {
    const { t } = this.props;
    return (
      <>
        <JuiDivider />
        <SubSection data-test-automation-id="memberPermission">
          <SubSectionTitle data-test-automation-id="memberPermissionTitle">
            {t('allowTeamMembersTo')}
          </SubSectionTitle>
          <SubSectionList data-test-automation-id="memberPermissionList">
            <SubSectionListItem
              data-test-automation-id="memberPermissionItem"
              label={t('addTeamMembers')}
            >
              <JuiToggleButton
                data-test-automation-id="allowAddTeamMemberToggle"
                checked={this.state.allowMemberAddMember}
                onChange={this.handleAllowMemberAddMemberChange}
              />
            </SubSectionListItem>
            <JuiDivider />
            <SubSectionListItem
              data-test-automation-id="memberPermissionItem"
              label={t('postMessages')}
            >
              <JuiToggleButton
                data-test-automation-id="allowPostToggle"
                checked={this.state.allowMemberPost}
                onChange={this.handleAllowMemberPostChange}
              />
            </SubSectionListItem>
            <JuiDivider />
            <SubSectionListItem
              data-test-automation-id="memberPermissionItem"
              label={t('pinPosts')}
            >
              <JuiToggleButton
                data-test-automation-id="allowPinToggle"
                checked={this.state.allowMemberPin}
                disabled={!this.state.allowMemberPost}
                onChange={this.handleAllowMemberPinChange}
              />
            </SubSectionListItem>
          </SubSectionList>
        </SubSection>
      </>
    );
  }

  renderButtonList() {
    const { t, isAdmin, isCompanyTeam } = this.props;
    return (
      <ButtonList>
        <ButtonListItem
          data-test-automation-id="leaveTeamButton"
          color="semantic.negative"
          onClick={this.handleLeaveTeamClick}
          hide={isAdmin || isCompanyTeam}
        >
          <ButtonListItemText color="semantic.negative">
            {t('leaveTeam')}
          </ButtonListItemText>
        </ButtonListItem>
        {isAdmin || isCompanyTeam ? null : <JuiDivider />}
        <ButtonListItem
          data-test-automation-id="deleteTeamButton"
          color="semantic.negative"
          onClick={this.handleDeleteTeamClick}
          hide={!isAdmin || isCompanyTeam}
        >
          <ButtonListItemText color="semantic.negative">
            {t('deleteTeam')}
          </ButtonListItemText>
          <JuiIconButton variant="plain" tooltipTitle={t('deleteTeamToolTip')}>
            info
          </JuiIconButton>
        </ButtonListItem>
        {!isAdmin || isCompanyTeam ? null : <JuiDivider />}
      </ButtonList>
    );
  }

  render() {
    const { isAdmin, saving, t } = this.props;
    const disabledOkBtn =
      !this.state.name || this.state.name.trim().length <= 0;
    return (
      <JuiModal
        fillContent={true}
        open={true}
        size={'medium'}
        modalProps={{ scroll: 'body' }}
        okBtnProps={{ disabled: disabledOkBtn, loading: saving }}
        title={t('Settings')}
        onCancel={this.handleClose}
        onOK={this.handleOk}
        okText={toTitleCase(t('save'))}
        cancelText={toTitleCase(t('cancel'))}
      >
        {isAdmin ? this.renderEditSection() : null}
        {isAdmin ? this.renderMemberPermissionSettings() : null}
        <JuiDivider />
        {this.renderButtonList()}
      </JuiModal>
    );
  }
}

const TeamSettingsView = translate()(TeamSettings);
const TeamSettingsComponent = TeamSettings;

export { TeamSettingsView, TeamSettingsComponent };
