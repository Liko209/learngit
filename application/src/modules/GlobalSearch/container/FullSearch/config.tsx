/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:58:35
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { ContentSearchResult } from '../ContentSearchResult';
import { ListSearchResult } from '../ListSearchResult';
import { TAB_TYPE } from './types';

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
    title: 'globalSearch.People',
    container: () => <ListSearchResult type={TAB_TYPE.PEOPLE} />,
    empty: {
      text: 'item.youHaveNothingPinnedYet',
    },
    automationID: 'globalSearch-people',
  },
  {
    title: 'globalSearch.Groups',
    container: () => <ListSearchResult type={TAB_TYPE.GROUPS} />,
    empty: {
      text: 'item.youHaveNothingPinnedYet',
    },
    automationID: 'globalSearch-groups',
  },
  {
    title: 'globalSearch.Teams',
    container: () => <ListSearchResult type={TAB_TYPE.TEAM} />,
    empty: {
      text: 'item.youHaveNothingPinnedYet',
    },
    automationID: 'globalSearch-team',
  },
];

export { TAB_CONFIG, TabConfig };
