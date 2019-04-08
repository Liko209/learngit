/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:58:35
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { ContentSearchResult } from '../ContentSearchResult';

type TabConfig = {
  title: string;
  container: React.ComponentType;
  automationID: string;
  empty: {
    text: string;
  };
};

const TAB_CONFIG = [
  {
    title: 'globalSearch.Messages',
    container: () => <ContentSearchResult />,
    empty: {
      text: 'item.youHaveNothingPinnedYet',
    },
    automationID: 'globalSearch-messages',
    // offlinePrompt: 'item.networkErrorPinnedPrompt',
  },
  {
    title: 'globalSearch.people',
    container: () => <div>people</div>,
    empty: {
      text: 'item.youHaveNothingPinnedYet',
    },
    automationID: 'globalSearch-people',
  },
  {
    title: 'globalSearch.groups',
    container: () => <div>groups</div>,
    empty: {
      text: 'item.youHaveNothingPinnedYet',
    },
    automationID: 'globalSearch-groups',
  },
  {
    title: 'globalSearch.team',
    container: () => <div>team</div>,
    empty: {
      text: 'item.youHaveNothingPinnedYet',
    },
    automationID: 'globalSearch-team',
  },
];

export { TAB_CONFIG, TabConfig };
