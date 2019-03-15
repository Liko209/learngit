/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-30 10:48:43
 * Copyright © RingCentral. All rights reserved.
 */

import React, { createRef } from 'react';
import i18next from 'i18next';
import styled from 'jui/foundation/styled-components';
import { spacing } from 'jui/foundation/utils';
import { observer } from 'mobx-react';
import { JuiModal } from 'jui/components/Dialog';
import { JuiTextField } from 'jui/components/Forms/TextField';
import { JuiTextarea } from 'jui/components/Forms/Textarea';
import { JuiSnackbarContent } from 'jui/components/Banners';
import { withLoading, DefaultLoadingWithDelay } from 'jui/hoc/withLoading';
import { Notification } from '@/containers/Notification';
import {
  JuiListToggleButton,
  JuiListToggleItemProps,
} from 'jui/pattern/ListToggleButton';
import { ContactSearch } from '@/containers/ContactSearch';
import { DialogContext } from '@/containers/Dialog';

import { ViewProps } from './types';
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

const createTeamLoading = () => (
  <DefaultLoadingWithDelay backgroundType={'mask'} size={42} />
);
const Loading = withLoading(
  (props: any) => <>{props.children}</>,
  createTeamLoading,
);
@observer
class CreateTeamView extends React.Component<ViewProps, State> {
  static contextType = DialogContext;

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
        text: i18next.t('people.team.SetAsPublicTeam'),
        checked: false,
        automationId: 'CreateTeamIsPublic',
      },
      {
        type: 'canAddMember',
        text: i18next.t('people.team.MembersMayAddOtherMembers'),
        checked: true,
        automationId: 'CreateTeamCanAddMember',
      },
      {
        type: 'canPost',
        text: i18next.t('people.team.MembersMayPostMessages'),
        checked: true,
        automationId: 'CreateTeamCanPost',
      },
      {
        type: 'canPin',
        text: i18next.t('people.team.MembersMayPinPosts'),
        checked: true,
        automationId: 'CreateTeamCanPinPost',
      },
    ];
  }

  static getDerivedStateFromProps(props: any, state: any) {
    let items = CreateTeamView.initItems;

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
    const { create } = this.props;

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
    try {
      const newTeam = await create(members, teamSetting);
      if (newTeam) {
        this.onClose();
        history.push(`/messages/${newTeam.id}`);
      }
    } catch (e) {
      this.renderServerUnknownError();
    }
  }

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
    } = this.props;
    return (
      <JuiModal
        open={true}
        size={'medium'}
        okBtnProps={{ disabled: disabledOkBtn }}
        title={i18next.t('people.team.CreateTeam')}
        onCancel={this.onClose}
        onOK={this.createTeam}
        okText={i18next.t('people.team.Create')}
        contentBefore={
          serverError && (
            <StyledSnackbarsContent type="error">
              {i18next.t('people.prompt.CreateTeamError')}
            </StyledSnackbarsContent>
          )
        }
        cancelText={i18next.t('common.dialog.cancel')}
      >
        <Loading loading={loading} alwaysComponentShow={true} delay={0}>
          <JuiTextField
            id={i18next.t('people.team.teamName')}
            label={i18next.t('people.team.teamName')}
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
            label={i18next.t('people.team.Members')}
            placeholder={i18next.t('people.team.SearchContactPlaceholder')}
            error={emailError}
            helperText={emailError ? i18next.t(emailErrorMsg) : ''}
            errorEmail={errorEmail}
            isExcludeMe={true}
          />
          <JuiTextarea
            id={i18next.t('people.team.teamDescription')}
            label={i18next.t('people.team.teamDescription')}
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
          text={t('people.prompt.YouAreAnAdminToThisTeam')}
          linkText={t('people.prompt.LearnAboutTeamAdministration')}
          href=""
        /> */}
        </Loading>
      </JuiModal>
    );
  }
}

const CreateTeamComponent = CreateTeamView;

export { CreateTeamView, CreateTeamComponent };
