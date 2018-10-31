/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-29 18:37:31
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { translate, WithNamespaces } from 'react-i18next';
import { JuiLeftNav, JuiLeftNavProps } from 'jui/pattern/LeftNav';
import { Umi } from '../Umi';
import { LeftNavViewProps } from './types';
import { computed } from 'mobx';
import _ from 'lodash';
import { observer } from 'mobx-react';

type LeftNavProps = {
  isLeftNavOpen: boolean;
} & LeftNavViewProps &
  RouteComponentProps &
  WithNamespaces;

@observer
class LeftNav extends Component<LeftNavProps> {
  constructor(props: LeftNavProps) {
    super(props);
    this.onRouteChange = this.onRouteChange.bind(this);
  }

  @computed
  get icons(): JuiLeftNavProps['icons'] {
    const { t, groupIds } = this.props;
    return [
      [
        {
          url: '/dashboard',
          icon: 'dashboard',
          title: t('Dashboard'),
        },
        {
          url: '/messages',
          icon: 'message',
          title: t('Messages'),
          umi: <Umi ids={groupIds} global="UMI.app" />,
        },
        {
          url: '/phone',
          icon: 'phone',
          title: t('Phone'),
        },
        {
          url: '/meetings',
          icon: 'videocam',
          title: t('Meetings'),
        },
      ],
      [
        {
          url: '/contacts',
          icon: 'contacts',
          title: t('Contacts'),
        },
        {
          url: '/calendar',
          icon: 'date_range',
          title: t('Calendar'),
        },
        {
          url: '/tasks',
          icon: 'assignment_turned_in',
          title: t('Tasks'),
        },
        {
          url: '/notes',
          icon: 'library_books',
          title: t('Notes'),
        },
        {
          url: '/files',
          icon: 'file_copy',
          title: t('Files'),
        },
        {
          url: '/settings',
          icon: 'settings',
          title: t('Settings'),
        },
      ],
    ];
  }

  onRouteChange(url: string) {
    const { history, location } = this.props;
    if (url === location.pathname) return;
    history.push(url);
  }

  render() {
    const { isLeftNavOpen, history } = this.props;

    return (
      <JuiLeftNav
        icons={this.icons}
        expand={isLeftNavOpen}
        onRouteChange={this.onRouteChange}
        history={history}
      />
    );
  }
}

const LeftNavView = translate('translations')(withRouter(LeftNav));

export { LeftNavView };
