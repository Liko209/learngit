/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:58:35
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

type TabConfig = {
  title: string;
  container: JSX.Element | React.ReactNode;
  automationID: string;
  empty: {
    text: string;
  };
};

const TAB_CONFIG = [
  {
    title: 'globalSearch.Messages',
    container: <div>Messages</div>, // react component
    empty: {
      text: 'item.youHaveNothingPinnedYet',
    },
    automationID: 'globalSearch-messages',
    // offlinePrompt: 'item.networkErrorPinnedPrompt',
  },
  {
    title: 'globalSearch.people',
    container: <div>people</div>, // react component
    empty: {
      text: 'item.youHaveNothingPinnedYet',
    },
    automationID: 'globalSearch-people',
    offlinePrompt: 'item.networkErrorPinnedPrompt',
  },
  {
    title: 'globalSearch.groups',
    container: <div>groups</div>, // react component
    empty: {
      text: 'item.youHaveNothingPinnedYet',
    },
    automationID: 'globalSearch-groups',
    offlinePrompt: 'item.networkErrorPinnedPrompt',
  },
  {
    title: 'globalSearch.team',
    container: <div>team</div>, // react component
    empty: {
      text: 'item.youHaveNothingPinnedYet',
    },
    automationID: 'globalSearch-team',
    offlinePrompt: 'item.networkErrorPinnedPrompt',
  },
];

export { TAB_CONFIG, TabConfig };
