/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-29 18:37:31
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiLeftNav } from 'jui/pattern/LeftNav';
import { LeftNavViewProps } from './types';
import { observable } from 'mobx';
import _ from 'lodash';
import { observer } from 'mobx-react';

type LeftNavProps = {
  isLeftNavOpen: boolean;
} & LeftNavViewProps &
  RouteComponentProps &
  WithTranslation;

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

  onRouteChange = (url: string) => {
    const { history, location } = this.props;
    if (url === location.pathname) return;
    if (location.pathname.includes(url)) {
      // FIJI-3794
      return;
    }
    history.push(url);
  }

  render() {
    const { isLeftNavOpen } = this.props;
    const icons = this.props.icons.get();
    return (
      <JuiLeftNav
        icons={icons}
        expand={isLeftNavOpen}
        onRouteChange={this.onRouteChange}
        selectedPath={this.selectedPath}
      />
    );
  }
}

const LeftNavView = withTranslation('translations')(withRouter(LeftNav));

export { LeftNavView };
