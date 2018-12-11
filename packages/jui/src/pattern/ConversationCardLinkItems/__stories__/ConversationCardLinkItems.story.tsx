/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-29 11:21:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiConversationCardLinkItems } from '../ConversationCardLinkItems';
import thumbnail from '../link_img@2x.png';

storiesOf('Pattern', module).add('ConversationCardLinkItems', () => {
  const title =
    'Jupiter Offical WebSite,Jupiter Offical WebSite,Jupiter Offical WebSite,Jupiter Offical WebSite,Jupiter Offical WebSite' +
    'Jupiter Offical WebSite,Jupiter Offical WebSite,Jupiter Offical WebSiteJupiter Offical WebSite';
  const summary =
    "Find new ideas and classic advice on strategy, innovation and leadership, for global leaders from the world's best businessssss asdasdsasda " +
    'Find new ideas and classic advice on strategy, innovation and leadership,Find new ideas and classic advice on strategy, innovation and leadership,' +
    'Find new ideas and classic advice on strategy, innovation and leadership,Find new ideas and classic advice on strategy, innovation and leadership';
  return (
    <React.Fragment>
      <JuiConversationCardLinkItems
        url="http://www.zhihu.com"
        faviconName="Zhihu"
        favicon="https://i.embed.ly/1/image?url=https%3A%2F%2Fstatic.zhihu.com%2Fstatic%2Ffavicon.ico&key=4527f263d6e64d7a8251b007b1ba9972"
        title={title}
        thumbnail={thumbnail}
        summary={summary}
      />
    </React.Fragment>
  );
});
