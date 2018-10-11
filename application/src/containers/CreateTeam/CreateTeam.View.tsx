/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-30 10:48:43
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'jui/foundation/styled-components';
import { observer } from 'mobx-react';
import { translate } from 'react-i18next';
import { JuiDialog } from 'jui/components/Dialog/Dialog';
import { JuiDialogTitle } from 'jui/components/Dialog/DialogTitle';
import { JuiDialogContent } from 'jui/components/Dialog/DialogContent';
import { JuiDialogActions } from 'jui/components/Dialog/DialogActions';
import { JuiButton } from 'jui/components/Buttons/Button';
import { JuiTextField } from 'jui/components/Forms/TextField';
import { JuiTextarea } from 'jui/components/Forms/Textarea';
import { JuiTextWithLink } from 'jui/components/TextWithLink';
import {
  JuiListToggleButton,
  JuiListToggleItemProps,
} from 'jui/pattern/ListToggleButton';
// import HomePresenter from '../Home/HomePresenter'; need global store
import { ContactSearch } from '@/containers/ContactSearch';
import { errorTips } from './CreateTeam.ViewModel';
import { ViewProps } from './types';

interface IState {
  disabledOkBtn: boolean;
  nameError: boolean;
  emailError: boolean;
  errorMsg: string;
  emailErrorMsg: string;
  teamName: string;
  description: string;
  items: JuiListToggleItemProps[];
  members: (number | string)[];
}

const LeftJuiButton = styled(JuiButton)`
  && {
    margin-right: ${({ theme }) => theme.spacing.unit * 2}px;
  }
`;

@observer
class CreateTeam extends React.Component<ViewProps, IState> {
  // private homePresenter: HomePresenter; need replace global store
  constructor(props: ViewProps) {
    super(props);
    // this.homePresenter = props.homePresenter; need replace global store
    this.state = {
      disabledOkBtn: true,
      nameError: false,
      emailError: false,
      errorMsg: '',
      emailErrorMsg: '',
      teamName: '',
      description: '',
      members: [],
      items: [
        {
          type: 'isPublic',
          text: props.t('Public Team'),
          checked: false,
        },
        {
          type: 'canPost',
          text: props.t('Members may post messages'),
          checked: true,
        },
      ],
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

  handleSearchContactChange = (items: any) => {
    const members = items.map((item: any) => {
      if (item.id) {
        return item.id;
      }
      return item.email;
    });
    this.setState({ members });
  }

  createTeamError(errorTips: errorTips) {
    const { t } = this.props;
    const { type, msg } = errorTips;

    if (type === 'already_taken') {
      this.setState({
        errorMsg: t(msg),
        nameError: true,
      });
    } else if (type === 'invalid_email') {
      this.setState({
        emailErrorMsg: t(msg),
        emailError: true,
      });
    }
  }

  createTeam = async () => {
    const { items, teamName, description, members } = this.state;
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
    } catch (err) {
      console.log(err, '------errr');
      this.createTeamError(err);
    }
  }

  onClose = () => {
    const { updateCreateTeamDialogState } = this.props;
    updateCreateTeamDialogState();
    this.setState({
      errorMsg: '',
      nameError: false,
      disabledOkBtn: true,
    });
  }

  handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      teamName: e.target.value,
      disabledOkBtn: e.target.value === '',
      errorMsg: '',
      nameError: false,
    });
  }

  handleDescChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      description: e.target.value,
    });
  }

  render() {
    const {
      disabledOkBtn,
      nameError,
      emailError,
      emailErrorMsg,
      items,
      errorMsg,
    } = this.state;
    const { t, isOpen } = this.props;

    return (
      <JuiDialog open={isOpen} size={'medium'} scroll="body">
        <JuiDialogTitle>{t('Create Team')}</JuiDialogTitle>
        <JuiDialogContent>
          <JuiTextField
            id={t('Team Name')}
            label={t('Team Name')}
            fullWidth={true}
            error={nameError}
            inputProps={{
              maxLength: 200,
            }}
            helperText={nameError && t(errorMsg)}
            onChange={this.handleNameChange}
          />
          <ContactSearch
            onChange={this.handleSearchContactChange}
            label={t('Members')}
            placeholder={t('Search Contact Placeholder')}
            error={emailError}
            helperText={emailError && t(emailErrorMsg)}
          />
          <JuiTextarea
            placeholder={t('Team Description')}
            fullWidth={true}
            onChange={this.handleDescChange}
          />
          <JuiListToggleButton
            items={items}
            toggleChange={this.handleSwitchChange}
          />
          <JuiTextWithLink
            TypographyProps={{
              align: 'center',
            }}
            text={t('tips')}
            linkText={t('linkTips')}
            href=""
          />
        </JuiDialogContent>

        <JuiDialogActions>
          <LeftJuiButton
            onClick={this.onClose}
            color="primary"
            variant="text"
            autoFocus={true}
          >
            {t('Cancel')}
          </LeftJuiButton>
          <JuiButton
            onClick={this.createTeam}
            color="primary"
            variant="contained"
            autoFocus={true}
            disabled={disabledOkBtn}
          >
            {t('Create')}
          </JuiButton>
        </JuiDialogActions>
      </JuiDialog>
    );
  }
}

const CreateTeamView = translate('team')(withRouter(CreateTeam));

export { CreateTeamView };
