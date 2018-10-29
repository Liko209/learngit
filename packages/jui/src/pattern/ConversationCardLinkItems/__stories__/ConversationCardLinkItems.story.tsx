/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-29 11:21:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiConversationCardLinkItems } from '../ConversationCardLinkItems';
import thumbnail from './summary.png';

storiesOf('Pattern', module)
  .add('ConversationCardLinkItems', () => {
    const title = 'Jupiter Offical WebSite,Jupiter Offical WebSite,Jupiter Offical WebSite,Jupiter Offical WebSite,Jupiter Offical WebSite' +
      'Jupiter Offical WebSite,Jupiter Offical WebSite,Jupiter Offical WebSiteJupiter Offical WebSite';
    const summary = 'Find new ideas and classic advice on strategy, innovation and leadership, for global leaders from the world\'s best businessssss asdasdsasda ' +
      'Find new ideas and classic advice on strategy, innovation and leadership,Find new ideas and classic advice on strategy, innovation and leadership,' +
      'Find new ideas and classic advice on strategy, innovation and leadership,Find new ideas and classic advice on strategy, innovation and leadership';
    return (
      <JuiConversationCardLinkItems title={title} thumbnail={thumbnail} summary={summary} />
    );
  });
