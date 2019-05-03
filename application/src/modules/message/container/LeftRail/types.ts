/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-02 15:46:41
 * Copyright © RingCentral. All rights reserved.
 */
import { SECTION_TYPE } from './Section/types';
import { POST_LIST_TYPE } from '@/modules/message/container/PostListPage/types';

type LeftRailProps = {};
type LeftRailEntry = {
  title: string;
  icon: string;
  type: POST_LIST_TYPE;
  testId: string;
};

type LeftRailFilter = {
  label: string;
  value: boolean;
  onChange: (evt: any, checked: boolean) => void;
};

type LeftRailViewProps = {
  sections: SECTION_TYPE[];
  filters: LeftRailFilter[];
  entries: LeftRailEntry[];
  currentPostListType: string;
};

export { LeftRailProps, LeftRailViewProps, LeftRailFilter, LeftRailEntry };
