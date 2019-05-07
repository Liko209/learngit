/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:50:19
 * Copyright © RingCentral. All rights reserved.
 */
import { PromisedComputedValue } from 'computed-async-mobx';
import GroupModel from '@/store/models/Group';
import { ISearchItemModel } from '../types';
import { SEARCH_SCOPE, SEARCH_VIEW, TAB_TYPE } from '../../../types';

type ContentProps = {
  displayName: string;
  searchScope: SEARCH_SCOPE;
};

type ViewProps = {
  title: string;
  displayName: string;
  terms?: string[];
  onMouseEnter: () => void;
  onMouseLeave: (event: React.MouseEvent<HTMLElement>) => void;
  onClick: () => void;
  hovered: boolean;
  addRecentRecord: () => void;
  contentText: PromisedComputedValue<string>;
};

export {
  ContentProps,
  ViewProps,
  GroupModel,
  ISearchItemModel,
  SEARCH_SCOPE,
  SEARCH_VIEW,
  TAB_TYPE,
};
