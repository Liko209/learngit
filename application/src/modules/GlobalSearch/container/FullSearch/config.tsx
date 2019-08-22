/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:58:35
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { ContentSearchResult } from '../ContentSearchResult';
import { ListSearchResult } from '../ListSearchResult';
import { TAB_TYPE } from './types';
import { analyticsCollector } from '@/AnalyticsCollector';

type TabProps = {
  isShow: boolean;
};

type TabConfig = {
  title: string;
  container: React.ComponentType<TabProps>;
  automationID: string;
  empty: {
    text: string;
  };
};

const TAB_CONFIG = [
  {
    title: 'globalSearch.Messages',
    container: (props: TabProps) => (
      <ContentSearchResult
        {...props}
        pageDataTracking={analyticsCollector.showFullMessageSearch}
      />
    ),
    empty: {
      text: 'item.youHaveNothingPinnedYet',
    },
    automationID: 'globalSearch-messages',
    // offlinePrompt: 'item.networkErrorPinnedPrompt',
  },
  {
    title: 'globalSearch.People',
    container: (props: TabProps) => (
      <ListSearchResult
        type={TAB_TYPE.PEOPLE}
        pageDataTracking={analyticsCollector.showFullPeopleSearch}
        {...props}
      />
    ),
    empty: {
      text: 'item.youHaveNothingPinnedYet',
    },
    automationID: 'globalSearch-people',
  },
  {
    title: 'globalSearch.Groups',
    container: (props: TabProps) => (
      <ListSearchResult
        type={TAB_TYPE.GROUPS}
        pageDataTracking={analyticsCollector.showFullGroupSearch}
        {...props}
      />
    ),
    empty: {
      text: 'item.youHaveNothingPinnedYet',
    },
    automationID: 'globalSearch-groups',
  },
  {
    title: 'globalSearch.Teams',
    container: (props: TabProps) => (
      <ListSearchResult
        type={TAB_TYPE.TEAM}
        pageDataTracking={analyticsCollector.showFullTeamSearch}
        {...props}
      />
    ),
    empty: {
      text: 'item.youHaveNothingPinnedYet',
    },
    automationID: 'globalSearch-team',
  },
];

export { TAB_CONFIG, TabConfig };
