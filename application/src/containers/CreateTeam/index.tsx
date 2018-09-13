/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-12 15:31:26
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import JuiCreateTeam from 'ui-components/molecules/CreateTeam';
import HomePresenter from '../Home/HomePresenter';

interface IProps {
  homePresenter: HomePresenter;
}
interface IState {
  disabledOkBtn: boolean;
}

@observer
class CreateTeam extends React.Component<IProps, IState> {
  private homePresenter: HomePresenter;

  constructor(props: IProps) {
    super(props);
    this.homePresenter = props.homePresenter;
    this.state = {
      disabledOkBtn: true,
    };
  }

  onCancel = () => {
    this.homePresenter.handleOpenCreateTeam();
  }
  onClose = () => {
    this.homePresenter.handleOpenCreateTeam();
  }
  render() {
    const { disabledOkBtn } = this.state;
    return (
      <JuiCreateTeam
        open={this.homePresenter.openCreateTeam}
        header="New Team"
        onCancel={this.onCancel}
        onClose={this.onClose}
        disabledOk={disabledOkBtn}
      >
        TODO ...
      </JuiCreateTeam>
    );
  }
}

export default CreateTeam;
