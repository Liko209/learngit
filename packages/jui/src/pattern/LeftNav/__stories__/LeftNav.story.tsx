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
const icons = [
  [
    {
      Icon: (
        <JuiIconography iconColor={['grey', '900']}>
          dashboard_border
        </JuiIconography>
      ),
      IconSelected: <JuiIconography>dashboard</JuiIconography>,
      title: 'Dashboard',
      url: 'path/1',
    },
    {
      Icon: (
        <JuiIconography iconColor={['grey', '900']}>
          messages_border
        </JuiIconography>
      ),
      IconSelected: <JuiIconography>messages</JuiIconography>,
      title: 'Messages',
      url: 'path/1',
    },
    {
      Icon: (
        <JuiIconography iconColor={['grey', '900']}>
          leftNavPhone_border
        </JuiIconography>
      ),
      IconSelected: <JuiIconography>leftNavPhone</JuiIconography>,
      title: 'Phone',
      url: 'path/1',
    },
    {
      Icon: (
        <JuiIconography iconColor={['grey', '900']}>
          meetings_border
        </JuiIconography>
      ),
      IconSelected: <JuiIconography>meetings</JuiIconography>,
      title: 'Meetings',
      url: 'path/1',
    },
  ],
  [
    {
      Icon: <JuiIconography iconSize="medium">contacts_border</JuiIconography>,
      IconSelected: <JuiIconography iconSize="medium">contacts</JuiIconography>,
      title: 'Contacts',
      url: 'path/1',
    },
    {
      Icon: (
        <JuiIconography iconSize="medium">leftNavEvent_border</JuiIconography>
      ),
      IconSelected: (
        <JuiIconography iconSize="medium">leftNavEvent</JuiIconography>
      ),
      title: 'Calendar',
      url: 'path/1',
    },
    {
      Icon: (
        <JuiIconography iconSize="medium">leftNavTask_border</JuiIconography>
      ),
      IconSelected: (
        <JuiIconography iconSize="medium">leftNavTask</JuiIconography>
      ),
      title: 'Tasks',
      url: 'path/1',
    },
    {
      icon: 'notes',
      Icon: (
        <JuiIconography iconSize="medium">leftNavNote_border</JuiIconography>
      ),
      IconSelected: (
        <JuiIconography iconSize="medium">leftNavNote</JuiIconography>
      ),
      title: 'Notes',
      url: 'path/1',
    },
    {
      Icon: (
        <JuiIconography iconSize="medium">leftNavFile_border</JuiIconography>
      ),
      IconSelected: (
        <JuiIconography iconSize="medium">leftNavFile</JuiIconography>
      ),
      title: 'Files',
      url: 'path/1',
    },
    {
      icon: 'settings',
      Icon: <JuiIconography iconSize="medium">settings_border</JuiIconography>,
      IconSelected: <JuiIconography iconSize="medium">settings</JuiIconography>,
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
