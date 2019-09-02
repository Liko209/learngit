/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-23 19:52:37
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';
import { WithTranslation } from 'react-i18next';
import { FetchSortableDataListHandler } from '@/store/base';
import { ListInjectProps, Tab, ListComponentProps, CellProps } from '../types';
import {
  HoverControllerBaseProps,
  HoverControllerBaseViewProps,
} from '../HoverController';

type ListMainProps = {
  filter: Tab['filter'];
  title: Tab['title'];
  automationID: Tab['automationID'];
  empty: Tab['empty'];
  minRowHeight: Tab['minRowHeight'];
  Cell: ComponentType<CellProps & HoverControllerBaseViewProps>;
  List?: ComponentType<ListInjectProps & ListComponentProps>;
  onShowDataTrackingKey?: Tab['onShowDataTrackingKey'];
  createHandler: (
    searchKey: string,
  ) =>
    | Promise<FetchSortableDataListHandler<any>>
    | FetchSortableDataListHandler<any>;
};

type ListMainViewProps = WithTranslation &
  ListMainProps &
  HoverControllerBaseProps & {
    isError: boolean;
    onErrorReload: () => void;
    listHandler: FetchSortableDataListHandler<any>;
    setSearchKey: () => void;
    searchKey: string;
  };

export { ListMainViewProps, ListMainProps };
