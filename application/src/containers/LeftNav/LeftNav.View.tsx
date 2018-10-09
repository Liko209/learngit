/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-29 18:37:31
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { TranslationFunction } from 'i18next';
import { translate } from 'react-i18next';
import { JuiLeftNav } from 'jui/pattern/LeftNav';
import { Umi } from '../Umi';
import { LeftNavViewProps } from './types';

type LeftNavProps = {
  isLeftNavOpen: boolean;
  t: TranslationFunction;
} & LeftNavViewProps &
  RouteComponentProps;

class LeftNav extends Component<LeftNavProps> {
  constructor(props: LeftNavProps) {
    super(props);
    this.onRouteChange = this.onRouteChange.bind(this);
  }

  getIcons() {
    const { t } = this.props;

    return [
      [
        {
          url: '/dashboard',
          icon: 'dashboard',
          title: t('Dashboard'),
          umi: <Umi ids={[1, 2]} />,
        },
        {
          url: '/messages',
          icon: 'message',
          title: t('Messages'),
          umi: <Umi ids={[1, 2]} />,
        },
        {
          url: '/phone',
          icon: 'phone',
          title: t('Phone'),
          umi: <Umi ids={[1, 2]} />,
        },
        {
          url: '/meetings',
          icon: 'videocam',
          title: t('Meetings'),
          umi: <Umi ids={[1, 2]} />,
        },
      ],
      [
        {
          url: '/contacts',
          icon: 'contacts',
          title: t('Contacts'),
          umi: <Umi ids={[1, 2]} />,
        },
        {
          url: '/calendar',
          icon: 'date_range',
          title: t('Calendar'),
          umi: <Umi ids={[1, 2]} />,
        },
        {
          url: '/tasks',
          icon: 'assignment_turned_in',
          title: t('Tasks'),
          umi: <Umi ids={[1, 2]} />,
        },
        {
          url: '/notes',
          icon: 'library_books',
          title: t('Notes'),
          umi: <Umi ids={[1, 2]} />,
        },
        {
          url: '/files',
          icon: 'file_copy',
          title: t('Files'),
          umi: <Umi ids={[1, 2]} />,
        },
        {
          url: '/settings',
          icon: 'settings',
          title: t('Settings'),
          umi: <Umi ids={[1, 2]} />,
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
    const { isLeftNavOpen } = this.props;

    return (
      <JuiLeftNav
        icons={this.getIcons()}
        expand={isLeftNavOpen}
        onRouteChange={this.onRouteChange}
      />
    );
  }
}

const LeftNavView = translate('translations')(withRouter(LeftNav));

export { LeftNavView };
