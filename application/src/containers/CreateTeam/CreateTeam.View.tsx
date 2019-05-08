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
import { withLoading, DefaultLoadingWithDelay } from 'jui/hoc/withLoading';
import { Notification } from '@/containers/Notification';
import {
  JuiListToggleButton,
  JuiListToggleItemProps,
} from 'jui/pattern/ListToggleButton';
import { ContactSearch } from '@/containers/Downshift';
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
        type: 'isPublic',
        text: t('people.team.SetAsPublicTeam'),
        checked: false,
        automationId: 'CreateTeamIsPublic',
      },
      {
        type: 'canAddMember',
        text: t('people.team.MembersMayAddOtherMembers'),
        checked: true,
        automationId: 'CreateTeamCanAddMember',
      },
      {
        type: 'canPost',
        text: t('people.team.MembersMayPostMessages'),
        checked: true,
        automationId: 'CreateTeamCanPost',
      },
      {
        type: 'canPin',
        text: t('people.team.MembersMayPinPosts'),
        checked: true,
        automationId: 'CreateTeamCanPinPost',
      },
    ];
  }

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
      t,
    } = this.props;
    return (
      <JuiModal
        modalProps={{ scroll: 'body' }}
        open={true}
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
        <Loading loading={loading} alwaysComponentShow={true} delay={0}>
          <JuiTextField
            id={t('people.team.teamName')}
            label={t('people.team.teamName')}
            placeholder={t('people.team.teamNamePlaceholder')}
            fullWidth={true}
            error={nameError}
            inputProps={{
              maxLength: 200,
              'data-test-automation-id': 'CreateTeamName',
            }}
            inputRef={this.teamNameRef}
            helperText={nameError && t(errorMsg)}
            onChange={handleNameChange}
          />
          <ContactSearch
            onSelectChange={handleSearchContactChange}
            label={t('people.team.Members')}
            placeholder={t('people.team.SearchContactPlaceholder')}
            error={emailError}
            helperText={emailError ? t(emailErrorMsg) : ''}
            errorEmail={errorEmail}
            isExcludeMe={true}
            multiple={true}
            autoSwitchEmail={true}
          />
          <JuiTextarea
            id={t('people.team.teamDescription')}
            label={t('people.team.teamDescription')}
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

const CreateTeamView = withTranslation('translations')(CreateTeamComponent);

// const CreateTeamComponent = CreateTeamView;

export { CreateTeamView, CreateTeamComponent };
