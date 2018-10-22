/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-30 09:39:47
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import styled from '../../foundation/styled-components';
import { observer } from 'mobx-react';
import { TranslationFunction, i18n } from 'i18next';
import { translate } from 'react-i18next';
import { JuiDialog } from '../../components/Dialog/Dialog';
import { JuiDialogTitle } from '../../components/Dialog/DialogTitle';
import { JuiDialogContent } from '../../components/Dialog/DialogContent';
import { JuiDialogActions } from '../../components/Dialog/DialogActions';
import { JuiButton } from '../../components/Buttons/Button';
import { JuiTextField } from '../../components/Forms/TextField';
import { JuiTextarea } from '../../components/Forms/Textarea';
import { JuiTextWithLink } from '../../components/TextWithLink';
import {
  JuiListToggleButton,
  JuiListToggleItemProps,
} from '../ListToggleButton';
// import HomePresenter from '../Home/HomePresenter';
// import SearchContact from '../SearchContact';
// import CreateTeamVM, { errorTips } from './createTeamVM';

interface IProps extends RouteComponentProps {
  // homePresenter: HomePresenter;
  i18n: i18n;
  t: TranslationFunction;
}
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
class CreateTeam extends React.Component<IProps, IState> {
  // private homePresenter: HomePresenter;
  // private createTeamVM: CreateTeamVM;
  constructor(props: IProps) {
    super(props);
    // this.homePresenter = props.homePresenter;
    // this.createTeamVM = new CreateTeamVM();
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

  createTeamError(errorTips: any) {
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
    // const { items, teamName, description, members } = this.state;
    // const { history } = this.props;
    // const isPublic = items.filter(item => item.type === 'isPublic')[0].checked;
    // const canPost = items.filter(item => item.type === 'canPost')[0].checked;
    // try {
    //   const result = await this.createTeamVM.create(
    //     teamName,
    //     members,
    //     description,
    //     {
    //       isPublic,
    //       canPost,
    //     },
    //   );
    //   history.push(`/messages/${result.id}`);
    //   this.onClose();
    // } catch (err) {
    //   console.log(err, '------errr');
    //   this.createTeamError(err);
    // }
  }

  onClose = () => {
    // this.homePresenter.handleOpenCreateTeam();
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
      // emailError,
      // emailErrorMsg,
      items,
      errorMsg,
    } = this.state;
    const { t } = this.props;

    return (
      <JuiDialog open={true} size={'medium'} scroll="body">
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
          {/* <SearchContact
            onChange={this.handleSearchContactChange}
            label={t('Members')}
            placeholder={t('Search Contact Placeholder')}
            error={emailError}
            helperText={emailError && t(emailErrorMsg)}
          /> */}
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
            onClick={() => {}}
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

const JuiCreateTeam = translate('team')(withRouter(CreateTeam));

export { JuiCreateTeam };
