/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-21 19:16:08
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';
import { JuiInfiniteListProps } from 'jui/components/VirtualizedList';
import { FetchSortableDataListHandler } from '@/store/base';
import { HoverControllerBaseViewProps } from './HoverController';

type DefaultListProps = Pick<
  JuiInfiniteListProps,
  | 'initialScrollToIndex'
  | 'height'
  | 'minRowHeight'
  | 'overscan'
  | 'loadingRenderer'
  | 'loadingMoreRenderer'
  | 'noRowsRenderer'
  | 'loadMoreStrategy'
  | 'stickToLastPosition'
>;

type CellProps = HoverControllerBaseViewProps & {
  id: number;
  automationID: string;
};

type ListInjectProps = {
  automationID: string;
  Cell: ComponentType<CellProps>;
  empty: {
    noResultTip: string;
    noResultImage: string;
    noMatchesFoundTip?: string;
    noMatchesFoundImage?: string;
  };
};

type ListComponentProps = {
  height: number;
  getDefaultListProps: (minRowHeight: number) => DefaultListProps;
  searchKey: string;
};

type Tab = ListInjectProps & {
  title: string;
  path: string;
  minRowHeight: number;
  Component?: ComponentType<any>;
  icon?: string;
  createHandler: (
    searchKey: string,
  ) =>
    | Promise<FetchSortableDataListHandler<any>>
    | FetchSortableDataListHandler<any>;
  filter?: {
    placeholder: string;
  };
  onShowDataTrackingKey?: string;
};

type Section = {
  title: string; // section name
  tabs: Tab[];
};

type SectionTabs = {
  rootPath: string;
  sections: Section[];
};

type SingleTabs = {
  rootPath: string;
  tabs: Tab[];
};

// alternative sections or SingleTabs
type PageConfig = SectionTabs | SingleTabs;

export {
  PageConfig,
  SingleTabs,
  Tab,
  SectionTabs,
  Section,
  ListComponentProps,
  ListInjectProps,
  CellProps,
};
