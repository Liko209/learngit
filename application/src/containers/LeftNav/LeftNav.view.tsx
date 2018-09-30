/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-29 18:37:31
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { TranslationFunction } from 'i18next';
import { translate } from 'react-i18next';
import { JuiLeftNav } from 'jui/pattern/LeftNav';
import { LeftNavViewProps } from './types';

type LeftNavProps = {
  isLeftNavOpen: boolean;
  t: TranslationFunction;
} & LeftNavViewProps;

class LeftNav extends Component<LeftNavProps> {
  constructor(props: LeftNavProps) {
    super(props);
  }

  getIcons() {
    const { t } = this.props;

    return [
      [
        { icon: 'dashboard', title: t('Dashboard') },
        { icon: 'message', title: t('Messages') },
        { icon: 'phone', title: t('Phone') },
        { icon: 'videocam', title: t('Meetings') },
      ],
      [
        { icon: 'contacts', title: t('Contacts') },
        { icon: 'date_range', title: t('Calendar') },
        { icon: 'assignment_turned_in', title: t('Tasks') },
        { icon: 'library_books', title: t('Notes') },
        { icon: 'file_copy', title: t('Files') },
        { icon: 'settings', title: t('Settings') },
      ],
    ];
  }

  render() {
    const { messageUmi, isLeftNavOpen } = this.props;
    const UMI_COUNT = [[0, messageUmi, 0, 0], [0, 0, 0, 0, 0, 0]];

    return (
      <JuiLeftNav
        icons={this.getIcons()}
        unreadCount={UMI_COUNT}
        expand={isLeftNavOpen}
      />
    );
  }
}

const LeftNavView = translate('translations')(LeftNav);

export { LeftNavView };
