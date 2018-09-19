/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-12 14:46:51
 * Copyright © RingCentral. All rights reserved.
 */

import React, { MouseEvent } from 'react';

import JuiDialog, { IDialogProps } from '../../atoms/Dialog';
import JuiDialogTitle from '../../atoms/DialogTitle';
import JuiDialogContent from '../../atoms/DialogContent';
import JuiDialogActions from '../../atoms/DialogActions';
import JuiButton from '../../atoms/Button';
import JuiLink from '../../atoms/Link';
import JuiToggleButton from '../ToggleButton';
import * as CreateTeam from './style';

interface IProps extends IDialogProps {
  open: boolean;
  onClose(event: MouseEvent<HTMLElement>): void;
  onCancel(event: MouseEvent<HTMLElement>): void;
  header: JSX.Element | string;
  disabledOk?: boolean;
  okText?: string;
  cancelText?: string;
}
interface IState {
  teamName: string;
  teamDesc: string;
  nameError: boolean;
}

class JuiCreateTeam extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      teamName: '',
      nameError: false,
      teamDesc: '',
    };
  }
  handleNameChange = () => {};
  render() {
    const {
      open,
      header,
      okText,
      cancelText,
      onClose,
      onCancel,
      disabledOk,
    } = this.props;

    const { nameError } = this.state;
    return (
      <JuiDialog open={open} size={'medium'} scroll="paper">
        <JuiDialogTitle>{header}</JuiDialogTitle>
        <JuiDialogContent>
          <CreateTeam.TextField
            id="Team name"
            label="Team name"
            fullWidth={true}
            error={nameError}
            inputProps={{
              maxlength: 200,
            }}
            InputProps={{
              classes: {
                underline: 'underline',
              },
            }}
            helperText={nameError && 'Team name required'}
            onChange={this.handleNameChange}
          />

          <CreateTeam.TextField
            id="Team Description"
            label="Team Description"
            fullWidth={true}
            InputProps={{
              classes: {
                underline: 'underline',
              },
            }}
            onChange={this.handleNameChange}
          />

          <CreateTeam.List dense={true}>
            <CreateTeam.ListItem dense={true}>
              <CreateTeam.ListItemText>123123123</CreateTeam.ListItemText>
              <CreateTeam.ListItemSecondaryAction>
                <JuiToggleButton />
              </CreateTeam.ListItemSecondaryAction>
            </CreateTeam.ListItem>
            <CreateTeam.ListItem dense={true}>
              <CreateTeam.ListItemText>sdfsdf</CreateTeam.ListItemText>
              <CreateTeam.ListItemSecondaryAction>
                <JuiToggleButton />
              </CreateTeam.ListItemSecondaryAction>
            </CreateTeam.ListItem>
          </CreateTeam.List>
          <CreateTeam.ListTips align="center">
            You are an admin to this team.
            <JuiLink>Learn about team administration</JuiLink>
          </CreateTeam.ListTips>
        </JuiDialogContent>

        <JuiDialogActions>
          <JuiButton
            onClick={onCancel}
            color="primary"
            variant="text"
            autoFocus={true}
          >
            {cancelText || 'Cancel'}
          </JuiButton>
          <JuiButton
            onClick={onClose}
            color="primary"
            variant="contained"
            autoFocus={true}
            disabled={disabledOk}
          >
            {okText || 'Ok'}
          </JuiButton>
        </JuiDialogActions>
      </JuiDialog>
    );
  }
}

export default JuiCreateTeam;
