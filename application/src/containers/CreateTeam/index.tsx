/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-12 15:31:26
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import JuiCreateTeam from 'ui-components/molecules/Dialog/CreateTeam';
import HomePresenter from '../Home/HomePresenter';

interface IProps {
  homePresenter: HomePresenter;
}

class CreateTeam extends React.Component<IProps, {}> {
  private homePresenter: HomePresenter;

  constructor(props: IProps) {
    super(props);
    this.homePresenter = props.homePresenter;
  }

  onCancel = () => {};
  onClose = () => {};
  render() {
    return (
      <JuiCreateTeam
        open={this.homePresenter.openCreateTeam}
        header="New Team"
        onCancel={this.onCancel}
        onClose={this.onClose}
      >
        We are having trouble signing you in. Please try again later.
      </JuiCreateTeam>
    );
  }
}

export default CreateTeam;
