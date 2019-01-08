/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-29 18:37:31
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { translate, WithNamespaces } from 'react-i18next';
import { JuiLeftNav, JuiLeftNavProps } from 'jui/pattern/LeftNav';
import { LeftNavViewProps } from './types';
import { computed, observable } from 'mobx';
import _ from 'lodash';
import { observer } from 'mobx-react';

type LeftNavProps = {
  isLeftNavOpen: boolean;
} & LeftNavViewProps &
  RouteComponentProps &
  WithNamespaces;

@observer
class LeftNav extends Component<LeftNavProps> {
  @observable
  selectedPath: string = window.location.pathname.split('/')[1];

  componentDidMount() {
    const { history } = this.props;
    history.listen(() => {
      const newSelectedPath = window.location.pathname.split('/')[1];
      if (this.selectedPath !== newSelectedPath) {
        this.selectedPath = newSelectedPath;
      }
    });
  }

  @computed
  get icons(): JuiLeftNavProps['icons'] {
    return this.props.icons;
  }

  onRouteChange = (url: string) => {
    const { history, location } = this.props;
    if (url === location.pathname) return;
    history.push(url);
  }

  render() {
    const { isLeftNavOpen } = this.props;

    return (
      <JuiLeftNav
        icons={this.icons}
        expand={isLeftNavOpen}
        onRouteChange={this.onRouteChange}
        selectedPath={this.selectedPath}
      />
    );
  }
}

const LeftNavView = translate(['translations'])(withRouter(LeftNav));

export { LeftNavView };
