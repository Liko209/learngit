/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-12 15:31:26
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import JuiDialog from 'ui-components/atoms/Dialog';
import JuiDialogTitle from 'ui-components/atoms/DialogTitle';
import JuiDialogContent from 'ui-components/atoms/DialogContent';
import JuiDialogActions from 'ui-components/atoms/DialogActions';
import JuiButton from 'ui-components/atoms/Button';
import JuiTextField from 'ui-components/molecules/Form/TextField';
import TextWithLink from 'ui-components/molecules/TextWithLink/TextWithLink';
import ListToggleButton, {
  IListToggleItemProps,
} from 'ui-components/molecules/Lists/ListToggleButton';
import HomePresenter from '../Home/HomePresenter';

interface IProps {
  homePresenter: HomePresenter;
}
interface IState {
  disabledOkBtn: boolean;
  nameError: boolean;
  items: IListToggleItemProps[];
}

@observer
class CreateTeam extends React.Component<IProps, IState> {
  private homePresenter: HomePresenter;

  constructor(props: IProps) {
    super(props);
    this.homePresenter = props.homePresenter;
    this.state = {
      disabledOkBtn: true,
      nameError: false,
      items: [
        {
          text: '123123123',
          checked: false,
        },
        {
          text: '22222222222',
          checked: true,
        },
      ],
    };
  }

  handleChange = (item: IListToggleItemProps, checked: boolean) => {
    const items = [...this.state.items];
    const oldIndex = items.findIndex(oldItem => oldItem.text === item.text);
    items[oldIndex].checked = checked;
    this.setState({
      items,
    });
  }

  onCancel = () => {
    this.homePresenter.handleOpenCreateTeam();
  }
  onClose = () => {
    this.homePresenter.handleOpenCreateTeam();
  }
  handleNameChange = () => {};
  render() {
    const { disabledOkBtn, nameError, items } = this.state;

    return (
      <JuiDialog
        open={this.homePresenter.openCreateTeam}
        size={'medium'}
        scroll="paper"
      >
        <JuiDialogTitle>New Team</JuiDialogTitle>
        <JuiDialogContent>
          <JuiTextField
            id="Team name"
            label="Team name"
            fullWidth={true}
            error={nameError}
            inputProps={{
              maxLength: 200,
            }}
            helperText={nameError && 'Team name required'}
            onChange={this.handleNameChange}
          />
          <JuiTextField
            id="Team Description"
            label="Team Description"
            fullWidth={true}
            onChange={this.handleNameChange}
          />
          <ListToggleButton items={items} toggleChange={this.handleChange} />
          <TextWithLink
            TypographyProps={{
              align: 'center',
            }}
            text="You are an admin to this team."
            linkText="Learn about team administration"
            href=""
          />
        </JuiDialogContent>

        <JuiDialogActions>
          <JuiButton
            onClick={this.onCancel}
            color="primary"
            variant="text"
            autoFocus={true}
          >
            {'Cancel'}
          </JuiButton>
          <JuiButton
            onClick={this.onClose}
            color="primary"
            variant="contained"
            autoFocus={true}
            disabled={disabledOkBtn}
          >
            {'Ok'}
          </JuiButton>
        </JuiDialogActions>
      </JuiDialog>
    );
  }
}

export default CreateTeam;
