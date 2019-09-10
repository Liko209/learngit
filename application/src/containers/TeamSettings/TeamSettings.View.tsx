/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-15 15:18:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { withTranslation, WithTranslation, Trans } from 'react-i18next';
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
import { teamActionHandler } from '@/common/handleTeamAction';
import { ViewProps, State } from './types';
import { JuiTextField } from 'jui/components/Forms/TextField';
import { GroupAvatar } from '@/containers/Avatar';
import { toTitleCase } from '@/utils/string';
import { JuiDivider } from 'jui/components/Divider';
import { JuiToggleButton, JuiIconButton } from 'jui/components/Buttons';
import { Dialog, withEscTracking } from '@/containers/Dialog';
import { JuiDialogContentText } from 'jui/components/Dialog/DialogContentText';
import { dataAnalysis } from 'foundation/analysis';

type TeamSettingsProps = WithTranslation & ViewProps;
const Modal = withEscTracking(JuiModal);
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
        allowMemberAtTeamMention,
      },
    } = props;
    this.state = {
      name,
      description,
      allowMemberAddMember,
      allowMemberPost,
      allowMemberPin,
      allowMemberAtTeamMention,
    };
  }

  static NAME_INPUT_PROPS = {
    maxLength: NAME_MAX_LENGTH,
  };

  static DESCRIPTION_INPUT_PROPS = {
    maxLength: DESC_MAX_LENGTH,
  };

  componentDidMount() {
    dataAnalysis.page('Jup_Web/DT_Messaging_Team_Settings');
  }

  handleClose = () => portalManager.dismissLast();
  handleOk = async () => {
    const shouldClose = await this.props.save(this.state);
    if (shouldClose) {
      this.handleClose();
    }
  };

  handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      name: e.target.value,
    });
  };

  handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      description: e.target.value,
    });
  };

  handleAllowMemberAddMemberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    this.setState({
      allowMemberAddMember: checked,
    });
  };

  handleAllowMemberPostChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    if (!checked) {
      this.setState({
        allowMemberAtTeamMention: checked,
      });
    }
    this.setState({
      allowMemberPost: checked,
      allowMemberPin: checked,
    });
  };

  handleAllowMemberAtTeamMention = (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    this.setState({
      allowMemberAtTeamMention: checked,
    });
  };

  handleAllowMemberPinChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    this.setState({
      allowMemberPin: checked,
    });
  };

  handleLeaveTeamClick = () => {
    const { t, groupName } = this.props;
    portalManager.dismissLast();
    Dialog.confirm({
      modalProps: { 'data-test-automation-id': 'leaveTeamConfirmDialog' },
      okBtnProps: { 'data-test-automation-id': 'leaveTeamOkButton' },
      cancelBtnProps: { 'data-test-automation-id': 'leaveTeamCancelButton' },
      size: 'small',
      okType: 'negative',
      title: t('people.team.leaveTeamConfirmTitle'),
      content: (
        <JuiDialogContentText>
          <Trans
            i18nKey="people.team.leaveTeamConfirmContent"
            values={{ teamName: groupName }}
            components={[<strong key="0" />]}
          />
        </JuiDialogContentText>
      ),
      okText: toTitleCase(t('people.team.leaveTeamConfirmOk')),
      cancelText: toTitleCase(t('common.dialog.cancel')),
      onOK: this.leaveTeamOKButtonHandler,
    });
  };

  onTeamDelete = () => teamActionHandler.onTeamDelete(this.props.id);

  onTeamArchive = () => teamActionHandler.onTeamArchive(this.props.id);

  leaveTeamOKButtonHandler = async () => {
    portalManager.dismissLast();
    this.props.leaveTeam();
  };

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
            label={t('people.team.teamName')}
            data-test-automation-id="teamName"
            value={this.state.name}
            fullWidth
            error={!!nameErrorMsg}
            inputProps={TeamSettings.NAME_INPUT_PROPS}
            helperText={t(nameErrorMsg || '')}
            onChange={this.handleNameChange}
          />
          <JuiTextarea
            label={t('people.team.teamDescription')}
            data-test-automation-id="teamDescription"
            value={this.state.description}
            inputProps={TeamSettings.DESCRIPTION_INPUT_PROPS}
            fullWidth
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
            {t('people.team.allowTeamMembersTo')}
          </SubSectionTitle>
          <SubSectionList data-test-automation-id="memberPermissionList">
            <SubSectionListItem
              data-test-automation-id="memberPermissionItem"
              label={t('people.team.addTeamMembers')}
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
              label={t('people.team.postMessages')}
            >
              <JuiToggleButton
                data-test-automation-id="allowPostToggle"
                checked={this.state.allowMemberPost}
                onChange={this.handleAllowMemberPostChange}
              />
            </SubSectionListItem>
            <JuiDivider />
            <SubSectionListItem label={t('people.team.atTeamMention')}>
              <JuiToggleButton
                data-test-automation-id="allowMemberAtTeamMention"
                checked={this.state.allowMemberAtTeamMention}
                disabled={!this.state.allowMemberPost}
                onChange={this.handleAllowMemberAtTeamMention}
              />
            </SubSectionListItem>
            <JuiDivider />
            <SubSectionListItem
              data-test-automation-id="memberPermissionItem"
              label={t('people.team.pinPosts')}
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
    const noLeave = isAdmin || isCompanyTeam;
    const noDelete = !isAdmin || isCompanyTeam;
    return (
      <ButtonList>
        {!noLeave && (
          <ButtonListItem
            data-test-automation-id="leaveTeamButton"
            color="semantic.negative"
            onClick={this.handleLeaveTeamClick}
            hide={noLeave}
          >
            <ButtonListItemText color="semantic.negative">
              {t('people.team.leaveTeam')}
            </ButtonListItemText>
          </ButtonListItem>
        )}
        {noLeave ? null : <JuiDivider />}
        {!noDelete && (
          <ButtonListItem
            data-test-automation-id="archiveTeamButton"
            color="semantic.negative"
            onClick={this.onTeamArchive}
            hide={noDelete}
          >
            <ButtonListItemText color="semantic.negative">
              {t('people.team.archiveTeam')}
            </ButtonListItemText>
            <JuiIconButton
              variant="plain"
              data-test-automation-id="archiveTeamToolTipButton"
              tooltipTitle={t('people.team.archiveTeamToolTip')}
            >
              info
            </JuiIconButton>
          </ButtonListItem>
        )}
        {noDelete ? null : <JuiDivider />}
        {!noDelete && (
          <ButtonListItem
            data-test-automation-id="deleteTeamButton"
            color="semantic.negative"
            onClick={this.onTeamDelete}
            hide={noDelete}
          >
            <ButtonListItemText color="semantic.negative">
              {t('people.team.deleteTeam')}
            </ButtonListItemText>
            <JuiIconButton
              variant="plain"
              data-test-automation-id="deleteTeamToolTipButton"
              tooltipTitle={t('people.team.deleteTeamToolTip')}
            >
              info
            </JuiIconButton>
          </ButtonListItem>
        )}
        {noDelete ? null : <JuiDivider />}
      </ButtonList>
    );
  }

  render() {
    const { isAdmin, saving, t } = this.props;
    const disabledOkBtn =
      !this.state.name || this.state.name.trim().length <= 0;
    return (
      <Modal
        fillContent
        open
        size={'medium'}
        okBtnProps={{ disabled: disabledOkBtn, loading: saving }}
        title={t('setting.teamSettings')}
        onCancel={this.handleClose}
        onOK={this.handleOk}
        okText={toTitleCase(t('common.dialog.save'))}
        cancelText={toTitleCase(t('common.dialog.cancel'))}
        modalProps={{ 'data-test-automation-id': 'team-setting-dialog' }}
      >
        {isAdmin ? this.renderEditSection() : null}
        {isAdmin ? this.renderMemberPermissionSettings() : null}
        <JuiDivider />
        {this.renderButtonList()}
      </Modal>
    );
  }
}

const TeamSettingsView = withTranslation()(TeamSettings);
const TeamSettingsComponent = TeamSettings;

export { TeamSettingsView, TeamSettingsComponent };
