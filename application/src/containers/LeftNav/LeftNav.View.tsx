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
import { computed, observable } from 'mobx';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';

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
    const { t, groupIds } = this.props;
    const currentConversationId =
      getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID) || '';
    return [
      [
        {
          url: '/dashboard',
          icon: 'dashboard',
          title: t('Dashboard'),
        },
        {
          url: `/messages/${currentConversationId}`,
          icon: 'messages',
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
          icon: 'meetings',
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
          icon: 'calendar',
          title: t('Calendar'),
        },
        {
          url: '/tasks',
          icon: 'tasks',
          title: t('Tasks'),
        },
        {
          url: '/notes',
          icon: 'notes',
          title: t('Notes'),
        },
        {
          url: '/files',
          icon: 'files',
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

const LeftNavView = translate('translations')(withRouter(LeftNav));

export { LeftNavView };
