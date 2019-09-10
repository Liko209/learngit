/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-30 10:48:43
 * Copyright © RingCentral. All rights reserved.
 */

import React, { createRef } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import styled from 'jui/foundation/styled-components';
import { spacing } from 'jui/foundation/utils';
import { observer } from 'mobx-react';
import { JuiModal } from 'jui/components/Dialog';
import { JuiTextField } from 'jui/components/Forms/TextField';
import { JuiTextarea } from 'jui/components/Forms/Textarea';
import { JuiSnackbarContent } from 'jui/components/Banners';
import { Loading } from 'jui/hoc/withLoading';
import { Notification } from '@/containers/Notification';
import {
  JuiListToggleButton,
  JuiListToggleItemProps,
} from 'jui/pattern/ListToggleButton';
import { ContactAndGroupSearch, ContactSearch } from '@/containers/Downshift';
import { DialogContext, withEscTracking } from '@/containers/Dialog';
import { dataAnalysis } from 'foundation/analysis';
import { ViewProps, INIT_ITEMS } from './types';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { TeamSetting } from './CreateTeam.ViewModel';
import history from '@/history';

type State = {
  items: JuiListToggleItemProps[];
};

const StyledSnackbarsContent = styled(JuiSnackbarContent)`
  && {
    margin: 0 0 ${spacing(4)} 0;
  }
`;
const Modal = withEscTracking(JuiModal);

type Props = ViewProps & WithTranslation;

@observer
class CreateTeamComponent extends React.Component<Props, State> {
  static contextType = DialogContext;

  teamNameRef = createRef<HTMLInputElement>();
  focusTimer: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = {
      items: [],
    };
  }

  static initItems = (props: any) => {
    const { t } = props;

    return [
      {
        type: INIT_ITEMS.IS_PUBLIC,
        text: t('people.team.SetAsPublicTeam'),
        checked: false,
        automationId: 'CreateTeamIsPublic',
      },
      {
        type: INIT_ITEMS.CAN_ADD_MEMBER,
        text: t('people.team.MembersMayAddOtherMembers'),
        checked: true,
        automationId: 'CreateTeamCanAddMember',
      },
      {
        type: INIT_ITEMS.CAN_POST,
        text: t('people.team.MembersMayPostMessages'),
        checked: true,
        automationId: 'CreateTeamCanPost',
      },
      {
        type: INIT_ITEMS.CAN_AT_TEAM_MENTION,
        text: t('people.team.MembersCanAtTeamMention'),
        checked: false,
        automationId: 'CreateTeamCanAtTeamMention',
      },
      {
        type: INIT_ITEMS.CAN_PIN,
        text: t('people.team.MembersMayPinPosts'),
        checked: true,
        automationId: 'CreateTeamCanPinPost',
      },
    ];
  };

  static getDerivedStateFromProps(props: any, state: any) {
    let items = CreateTeamComponent.initItems(props);

    if (state.items.length) {
      items = state.items;
    }

    return {
      items,
    };
  }

  componentDidMount() {
    // because of modal is dynamic append body
    // so must be delay focus
    dataAnalysis.page('Jup_Web/DT_Messaging_Team_createTeam');
    this.focusTimer = setTimeout(() => {
      const node = this.teamNameRef.current;
      if (node) {
        node.focus();
      }
    }, 300);
  }

  componentWillUnmount() {
    clearTimeout(this.focusTimer);
  }
  /* eslint-disable */
  handleSwitchChange = (item: JuiListToggleItemProps, checked: boolean) => {
    const newItems = this.state.items.map((oldItem: JuiListToggleItemProps) => {
      if (oldItem.text === item.text) {
        return {
          ...oldItem,
          checked,
        };
      }
      if (
        oldItem.type === INIT_ITEMS.CAN_PIN &&
        item.type === INIT_ITEMS.CAN_POST
      ) {
        return {
          ...oldItem,
          checked,
          disabled: !checked,
        };
      }
      if (
        oldItem.type === INIT_ITEMS.CAN_AT_TEAM_MENTION &&
        item.type === INIT_ITEMS.CAN_POST
      ) {
        return {
          ...oldItem,
          checked: false,
          disabled: !checked,
        };
      }
      return oldItem;
    });
    this.setState({
      items: newItems,
    });
  };

  createTeam = async () => {
    const { items } = this.state;
    const { teamName, description, members } = this.props;
    const { create } = this.props;

    const uiSetting = items.reduce((options, option) => {
      options[option.type] = option.checked;
      return options;
    }, {}) as {
      isPublic: boolean;
      canAddMember: boolean;
      canPost: boolean;
      canPin: boolean;
      canAtTeamMention: boolean;
    };

    const teamSetting: TeamSetting = {
      description,
      name: teamName,
      isPublic: uiSetting.isPublic,
      permissionFlags: {
        TEAM_ADD_MEMBER: uiSetting.canAddMember,
        TEAM_POST: uiSetting.canPost,
        TEAM_PIN_POST: uiSetting.canPin,
        TEAM_MENTION: uiSetting.canAtTeamMention,
      },
    };
    try {
      const newTeam = await create(members, teamSetting);
      if (newTeam) {
        this.onClose();
        history.push(`/messages/${newTeam.id}`);
      }
    } catch (e) {
      this.renderServerUnknownError();
    }
  };

  onClose = () => this.context();

  renderServerUnknownError() {
    const message = 'people.prompt.WeWerentAbleToCreateTheTeamTryAgain';
    Notification.flashToast({
      message,
      type: ToastType.ERROR,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });
  }

  render() {
    const { items } = this.state;
    const {
      nameError,
      emailError,
      emailErrorMsg,
      disabledOkBtn,
      errorMsg,
      handleNameChange,
      handleDescChange,
      handleSearchContactChange,
      serverError,
      errorEmail,
      loading,
      canMentionTeam,
      t,
    } = this.props;
    return (
      <Modal
        disableEscapeKeyDown={loading}
        modalProps={{ scroll: 'body' }}
        open
        size={'medium'}
        title={t('people.team.CreateTeam')}
        onCancel={this.onClose}
        onOK={this.createTeam}
        okText={t('people.team.Create')}
        contentBefore={
          serverError && (
            <StyledSnackbarsContent type="error">
              {t('people.prompt.CreateTeamError')}
            </StyledSnackbarsContent>
          )
        }
        cancelText={t('common.dialog.cancel')}
        okBtnProps={{
          disabled: disabledOkBtn,
          'data-test-automation-id': 'createTeamOkButton',
        }}
        cancelBtnProps={{
          'data-test-automation-id': 'createToTeamCancelButton',
        }}
      >
        <Loading loading={loading} alwaysComponentShow delay={0}>
          <JuiTextField
            id={t('people.team.teamName')}
            label={t('people.team.teamName')}
            placeholder={t('people.team.teamNamePlaceholder')}
            fullWidth
            error={nameError}
            inputProps={{
              maxLength: 200,
              'data-test-automation-id': 'CreateTeamName',
            }}
            inputRef={this.teamNameRef}
            helperText={nameError && t(errorMsg)}
            onChange={handleNameChange}
          />

          {// temporary: ContactAndGroupSearch contain group and person
          canMentionTeam ? (
            <ContactAndGroupSearch
              onSelectChange={handleSearchContactChange}
              label={t('people.team.Members')}
              placeholder={t('people.team.SearchContactPlaceholder')}
              error={emailError}
              helperText={emailError ? t(emailErrorMsg) : ''}
              errorEmail={errorEmail}
              isExcludeMe
              multiple
              autoSwitchEmail
            />
          ) : (
            <ContactSearch
              onSelectChange={handleSearchContactChange}
              label={t('people.team.Members')}
              placeholder={t('people.team.SearchContactPlaceholder')}
              error={emailError}
              helperText={emailError ? t(emailErrorMsg) : ''}
              errorEmail={errorEmail}
              isExcludeMe
              multiple
              autoSwitchEmail
            />
          )}
          <JuiTextarea
            id={t('people.team.teamDescription')}
            label={t('people.team.teamDescription')}
            inputProps={{
              'data-test-automation-id': 'CreateTeamDescription',
              maxLength: 1000,
            }}
            fullWidth
            onChange={handleDescChange}
          />
          <JuiListToggleButton
            data-test-automation-id="CreateTeamToggleList"
            items={items}
            onChange={this.handleSwitchChange}
          />
          {/* <JuiTextWithLink
          TypographyProps={{
            align: 'center',
          }}
          text={t('people.prompt.YouAreAnAdminToThisTeam')}
          linkText={t('people.prompt.LearnAboutTeamAdministration')}
          href=""
        /> */}
        </Loading>
      </Modal>
    );
  }
}

const CreateTeamView = withTranslation('translations')(CreateTeamComponent);

// const CreateTeamComponent = CreateTeamView;

export { CreateTeamView, CreateTeamComponent };
