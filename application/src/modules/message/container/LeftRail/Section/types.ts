/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-02 15:46:13
 * Copyright © RingCentral. All rights reserved.
 */
import { SortEndHandler } from 'react-sortable-hoc';

enum SECTION_TYPE {
  FAVORITE = 'favorites',
  DIRECT_MESSAGE = 'direct_messages',
  TEAM = 'teams',
}

type SectionProps = {
  type: SECTION_TYPE;
  isLast: boolean;
};

type SectionViewProps = {
  groupIds: number[];
  sortable: boolean;
  expanded: boolean;
  iconName: string;
  title: string;
  dataNameForTest: string;
  onSortEnd: SortEndHandler;
  handleCollapse: Function;
  handleExpand: Function;
} & SectionProps;

type SectionConfig = {
  dataNameForTest: string;
  title: string;
  iconName: string;
  sortable?: boolean;
};

type SectionConfigs = { [key in SECTION_TYPE]: SectionConfig };

export {
  SectionProps,
  SectionViewProps,
  SectionConfig,
  SectionConfigs,
  SECTION_TYPE,
};
