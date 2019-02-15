/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-30 10:48:43
 * Copyright © RingCentral. All rights reserved.
 */

import React, { createRef } from 'react';
import i18next from 'i18next';
import styled from 'jui/foundation/styled-components';
import { spacing } from 'jui/foundation/utils';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import { JuiModal } from 'jui/components/Dialog';
import { JuiTextField } from 'jui/components/Forms/TextField';
import { JuiTextarea } from 'jui/components/Forms/Textarea';
import { JuiSnackbarContent } from 'jui/components/Banners';
import { Notification } from '@/containers/Notification';
import {
  JuiListToggleButton,
  JuiListToggleItemProps,
} from 'jui/pattern/ListToggleButton';
import { ContactSearch } from '@/containers/ContactSearch';
import portalManager from '@/common/PortalManager';

import { ViewProps } from './types';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { TeamSetting } from './CreateTeam.ViewModel';

type State = {
  items: JuiListToggleItemProps[];
};

const StyledSnackbarsContent = styled(JuiSnackbarContent)`
  && {
    margin: 0 0 ${spacing(4)} 0;
  }
`;

@observer
class CreateTeam extends React.Component<ViewProps, State> {
  teamNameRef = createRef<HTMLInputElement>();
  focusTimer: NodeJS.Timeout;

  constructor(props: ViewProps) {
    super(props);
    this.state = {
      items: [],
    };
  }

  static get initItems() {
    return [
      {
        type: 'isPublic',
        text: i18next.t('PublicTeam'),
        checked: false,
        automationId: 'CreateTeamIsPublic',
      },
      {
        type: 'canAddMember',
        text: i18next.t('MembersMayAddOtherMembers'),
        checked: true,
      },
      {
        type: 'canPost',
        text: i18next.t('MembersMayPostMessages'),
        checked: true,
        automationId: 'CreateTeamCanPost',
      },
      {
        type: 'canPin',
        text: i18next.t('MembersMayPinPosts'),
        checked: true,
        automationId: 'CreateTeamCanAddMember',
      },
    ];
  }

  static getDerivedStateFromProps(props: any, state: any) {
    let items = CreateTeam.initItems;

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
    this.focusTimer = setTimeout(() => {
      const node = this.teamNameRef.current;
      if (node) {
        node.focus();
      }
    },                           300);
  }

  componentWillUnmount() {
    clearTimeout(this.focusTimer);
  }

  handleSwitchChange = (item: JuiListToggleItemProps, checked: boolean) => {
    const newItems = this.state.items.map((oldItem: JuiListToggleItemProps) => {
      if (oldItem.text === item.text) {
        return {
          ...oldItem,
          checked,
        };
      }
      if (oldItem.type === 'canPin' && item.type === 'canPost') {
        return {
          ...oldItem,
          checked,
          disabled: !checked,
        };
      }
      return oldItem;
    });
    this.setState({
      items: newItems,
    });
  }

  createTeam = async () => {
    const { items } = this.state;
    const { teamName, description, members } = this.props;
    const { history, create } = this.props;

    const uiSetting = items.reduce((options, option) => {
      options[option.type] = option.checked;
      return options;
    },                             {}) as {
      isPublic: boolean;
      canAddMember: boolean;
      canPost: boolean;
      canPin: boolean;
    };

    const teamSetting: TeamSetting = {
      description,
      name: teamName,
      isPublic: uiSetting.isPublic,
      permissionFlags: {
        TEAM_ADD_MEMBER: uiSetting.canAddMember,
        TEAM_POST: uiSetting.canPost,
        TEAM_PIN_POST: uiSetting.canPin,
      },
    };

    const newTeam = await create(members, teamSetting);
    if (newTeam) {
      this.onClose();
      history.push(`/messages/${newTeam.id}`);
    }
  }

  onClose = () => portalManager.dismiss();

  renderServerUnknownError() {
    const message = 'WeWerentAbleToCreateTheTeamTryAgain';
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
      serverUnknownError,
    } = this.props;
    if (serverUnknownError) {
      this.renderServerUnknownError();
    }
    return (
      <JuiModal
        open={true}
        size={'medium'}
        modalProps={{ scroll: 'body' }}
        okBtnProps={{ disabled: disabledOkBtn }}
        title={i18next.t('CreateTeam')}
        onCancel={this.onClose}
        onOK={this.createTeam}
        okText={i18next.t('Create')}
        contentBefore={
          serverError && (
            <StyledSnackbarsContent type="error">
              {i18next.t('Create Team Error')}
            </StyledSnackbarsContent>
          )
        }
        cancelText={i18next.t('Cancel')}
      >
        <JuiTextField
          id={i18next.t('teamName')}
          label={i18next.t('teamName')}
          fullWidth={true}
          error={nameError}
          inputProps={{
            maxLength: 200,
            'data-test-automation-id': 'CreateTeamName',
          }}
          inputRef={this.teamNameRef}
          helperText={nameError && i18next.t(errorMsg)}
          onChange={handleNameChange}
        />
        <ContactSearch
          onSelectChange={handleSearchContactChange}
          label={i18next.t('Members')}
          placeholder={i18next.t('Search Contact Placeholder')}
          error={emailError}
          helperText={emailError ? i18next.t(emailErrorMsg) : ''}
          errorEmail={errorEmail}
          isExcludeMe={true}
        />
        <JuiTextarea
          id={i18next.t('teamDescription')}
          label={i18next.t('teamDescription')}
          inputProps={{
            'data-test-automation-id': 'CreateTeamDescription',
            maxLength: 1000,
          }}
          fullWidth={true}
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
          text={t('YouAreAnAdminToThisTeam')}
          linkText={t('LearnAboutTeamAdministration')}
          href=""
        /> */}
      </JuiModal>
    );
  }
}

const CreateTeamView = withRouter(CreateTeam);
const CreateTeamComponent = CreateTeam;

export { CreateTeamView, CreateTeamComponent };
