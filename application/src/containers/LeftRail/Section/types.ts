/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-02 15:46:13
 * Copyright © RingCentral. All rights reserved.
 */

import { SortEndHandler } from 'react-sortable-hoc';
import { GROUP_QUERY_TYPE } from 'sdk/service';
import { ENTITY_NAME } from '@/store';

import { IMatchFunc, ITransformFunc } from '@/store/base/fetch';
import { Group } from 'sdk/src/models';

enum SECTION_TYPE {
  FAVORITE = 'favorites',
  DIRECT_MESSAGE = 'direct_messages',
  TEAM = 'teams',
}

type SectionProps = {
  type: SECTION_TYPE;
};

type SectionViewProps = {
  groupIds: number[];
  sortable: boolean;
  expanded: boolean;
  iconName: string;
  title: string;
  onSortEnd: SortEndHandler;
};

type SectionConfig = {
  title: string;
  iconName: string;
  eventName?: string;
  entityName?: ENTITY_NAME;
  queryType: GROUP_QUERY_TYPE;
  transformFun: ITransformFunc<Group>;
  isMatchFun: IMatchFunc<Group>;
};

type SectionConfigs = { [key in SECTION_TYPE]: SectionConfig };

export {
  SectionProps,
  SectionViewProps,
  SectionConfig,
  SectionConfigs,
  SECTION_TYPE,
};
