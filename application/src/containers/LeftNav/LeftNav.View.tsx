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
        { url: '/dashboard', icon: 'dashboard', title: t('Dashboard') },
        { url: '/messages', icon: 'message', title: t('Messages') },
        { url: '/phone', icon: 'phone', title: t('Phone') },
        { url: '/meetings', icon: 'videocam', title: t('Meetings') },
      ],
      [
        { url: '/contacts', icon: 'contacts', title: t('Contacts') },
        { url: '/calendar', icon: 'date_range', title: t('Calendar') },
        { url: '/tasks', icon: 'assignment_turned_in', title: t('Tasks') },
        { url: '/notes', icon: 'library_books', title: t('Notes') },
        { url: '/files', icon: 'file_copy', title: t('Files') },
        { url: '/settings', icon: 'settings', title: t('Settings') },
      ],
    ];
  }

  onRouteChange(url: string) {
    const { history } = this.props;
    history.push(url);
  }

  render() {
    const { messageUmi, isLeftNavOpen } = this.props;
    const UMI_COUNT = [[0, messageUmi, 0, 0], [0, 0, 0, 0, 0, 0]];

    return (
      <JuiLeftNav
        icons={this.getIcons()}
        unreadCount={UMI_COUNT}
        expand={isLeftNavOpen}
        onRouteChange={this.onRouteChange}
      />
    );
  }
}

const LeftNavView = translate('translations')(withRouter(LeftNav));

export { LeftNavView };
