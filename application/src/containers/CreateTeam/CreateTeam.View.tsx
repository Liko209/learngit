/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-30 10:48:43
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { t } from 'i18next';
import styled from 'jui/foundation/styled-components';
import { spacing } from 'jui/foundation/utils';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import { translate } from 'react-i18next';
import { JuiModal } from 'jui/components/Dialog';
import { JuiTextField } from 'jui/components/Forms/TextField';
import { JuiTextarea } from 'jui/components/Forms/Textarea';
// import { JuiTextWithLink } from 'jui/components/TextWithLink';
import { JuiSnackbarContent } from 'jui/components/Snackbars';
import {
  JuiListToggleButton,
  JuiListToggleItemProps,
} from 'jui/pattern/ListToggleButton';
import { ContactSearch } from '@/containers/ContactSearch';
import { ViewProps } from './types';

interface IState {
  items: JuiListToggleItemProps[];
}

const StyledSnackbarsContent = styled(JuiSnackbarContent)`
  && {
    margin: 0 0 ${spacing(4)} 0;
  }
`;

@observer
class CreateTeam extends React.Component<ViewProps, IState> {
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
        text: t('PublicTeam'),
        checked: false,
      },
      {
        type: 'canPost',
        text: t('MembersMayPostMessages'),
        checked: true,
      },
    ];
  }

  static getDerivedStateFromProps(props: any, state: any) {
    let items = [];

    if (props.isOpen) {
      items = CreateTeam.initItems;
    }
    if (state.items.length) {
      items = state.items;
    }

    return {
      items,
    };
  }

  handleSwitchChange = (item: JuiListToggleItemProps, checked: boolean) => {
    const newItems = this.state.items.map((oldItem: JuiListToggleItemProps) => {
      if (oldItem.text === item.text) {
        return {
          ...oldItem,
          checked,
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
    const isPublic = items.filter(item => item.type === 'isPublic')[0].checked;
    const canPost = items.filter(item => item.type === 'canPost')[0].checked;
    try {
      const result = await create(teamName, members, description, {
        isPublic,
        canPost,
      });
      history.push(`/messages/${result.id}`);
      this.onClose();
    } catch (err) {}
  }

  onClose = () => {
    const { updateCreateTeamDialogState, inputReset } = this.props;
    updateCreateTeamDialogState();
    inputReset();
    this.setState({
      items: CreateTeam.initItems,
    });
  }

  render() {
    const { items } = this.state;
    const {
      t,
      isOpen,
      nameError,
      emailError,
      emailErrorMsg,
      disabledOkBtn,
      errorMsg,
      handleNameChange,
      handleDescChange,
      handleSearchContactChange,
      isOffline,
      serverError,
    } = this.props;
    return (
      <JuiModal
        open={isOpen}
        size={'medium'}
        modalProps={{ scroll: 'body' }}
        okBtnProps={{ disabled: isOffline || disabledOkBtn }}
        title={t('Create Team')}
        onCancel={this.onClose}
        onOK={this.createTeam}
        okText={t('Create')}
        contentBefore={
          serverError && (
            <StyledSnackbarsContent type="error">
              We are having trouble creating this team. Please try again later.
            </StyledSnackbarsContent>
          )
        }
        cancelText={t('Cancel')}
      >
        <JuiTextField
          id={t('Team Name')}
          label={t('Team Name')}
          fullWidth={true}
          error={nameError}
          inputProps={{
            maxLength: 200,
          }}
          helperText={nameError && t(errorMsg)}
          onChange={handleNameChange}
        />
        <ContactSearch
          onChange={handleSearchContactChange}
          label={t('Members')}
          placeholder={t('Search Contact Placeholder')}
          error={emailError}
          helperText={emailError && t(emailErrorMsg)}
        />
        <JuiTextarea
          placeholder={t('Team Description')}
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
          text={t('tips')}
          linkText={t('linkTips')}
          href=""
        /> */}
      </JuiModal>
    );
  }
}

const CreateTeamView = translate('team')(withRouter(CreateTeam));

export { CreateTeamView };
