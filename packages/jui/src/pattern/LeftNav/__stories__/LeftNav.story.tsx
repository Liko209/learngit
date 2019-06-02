/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-8-39 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs';
import { BrowserRouter } from 'react-router-dom';
import { JuiLeftNav } from '../index';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiIconography } from '../../../foundation/Iconography';
import dashboardBorder from '../../../assets/jupiter-icon/icon-dashboard_border.svg';
import dashboard from '../../../assets/jupiter-icon/icon-dashboard.svg';
import messageBorder from '../../../assets/jupiter-icon/icon-bubble_lines_border.svg';
import message from '../../../assets/jupiter-icon/icon-bubble_lines.svg';
import phoneBorder from '../../../assets/jupiter-icon/icon-phone_border.svg';
import phone from '../../../assets/jupiter-icon/icon-phone.svg';
import meetingsBorder from '../../../assets/jupiter-icon/icon-videocam_border.svg';
import meetings from '../../../assets/jupiter-icon/icon-videocam.svg';
import contactsBorder from '../../../assets/jupiter-icon/icon-contacts_border.svg';
import contacts from '../../../assets/jupiter-icon/icon-contacts.svg';
import event from '../../../assets/jupiter-icon/icon-event-new.svg';
import eventBorder from '../../../assets/jupiter-icon/icon-event-new_border.svg';
import task from '../../../assets/jupiter-icon/icon-task-new.svg';
import taskBorder from '../../../assets/jupiter-icon/icon-task-new_border.svg';
import note from '../../../assets/jupiter-icon/icon-note-new.svg';
import noteBorder from '../../../assets/jupiter-icon/icon-note-new_border.svg';
import file from '../../../assets/jupiter-icon/icon-file.svg';
import fileBorder from '../../../assets/jupiter-icon/icon-file_border.svg';
import setting from '../../../assets/jupiter-icon/icon-settings.svg';
import settingBorder from '../../../assets/jupiter-icon/icon-settings_border.svg';

const icons = [
  [
    {
      Icon: (
        <JuiIconography iconColor={['grey', '900']} symbol={dashboardBorder} />
      ),
      IconSelected: <JuiIconography symbol={dashboard} />,
      title: 'Dashboard',
      url: 'path/1',
    },
    {
      Icon: (
        <JuiIconography iconColor={['grey', '900']} symbol={messageBorder} />
      ),
      IconSelected: <JuiIconography symbol={message} />,
      title: 'Messages',
      url: 'path/1',
    },
    {
      Icon: <JuiIconography iconColor={['grey', '900']} symbol={phoneBorder} />,
      IconSelected: <JuiIconography symbol={phone} />,
      title: 'Phone',
      url: 'path/1',
    },
    {
      Icon: (
        <JuiIconography iconColor={['grey', '900']} symbol={meetingsBorder} />
      ),
      IconSelected: <JuiIconography symbol={meetings} />,
      title: 'Meetings',
      url: 'path/1',
    },
  ],
  [
    {
      Icon: <JuiIconography iconSize="medium" symbol={contactsBorder} />,
      IconSelected: <JuiIconography iconSize="medium" symbol={contacts} />,
      title: 'Contacts',
      url: 'path/1',
    },
    {
      Icon: <JuiIconography iconSize="medium" symbol={eventBorder} />,
      IconSelected: <JuiIconography iconSize="medium" symbol={event} />,
      title: 'Calendar',
      url: 'path/1',
    },
    {
      Icon: <JuiIconography iconSize="medium" symbol={taskBorder} />,
      IconSelected: <JuiIconography iconSize="medium" symbol={task} />,
      title: 'Tasks',
      url: 'path/1',
    },
    {
      icon: 'notes',
      Icon: <JuiIconography iconSize="medium" symbol={noteBorder} />,
      IconSelected: <JuiIconography iconSize="medium" symbol={note} />,
      title: 'Notes',
      url: 'path/1',
    },
    {
      Icon: <JuiIconography iconSize="medium" symbol={fileBorder} />,
      IconSelected: <JuiIconography iconSize="medium" symbol={file} />,
      title: 'Files',
      url: 'path/1',
    },
    {
      icon: 'settings',
      Icon: <JuiIconography iconSize="medium" symbol={settingBorder} />,
      IconSelected: <JuiIconography iconSize="medium" symbol={setting} />,
      title: 'Settings',
      url: 'path/1',
    },
  ],
];

storiesOf('Pattern', module)
  .addDecorator(withInfoDecorator(JuiLeftNav, { inline: true }))
  .add('LeftNav', () => {
    const isExpand = boolean('expand', false);
    return (
      <BrowserRouter>
        <JuiLeftNav
          selectedPath={'a'}
          icons={icons}
          expand={isExpand}
          onRouteChange={() => {}}
        />
      </BrowserRouter>
    );
  });
