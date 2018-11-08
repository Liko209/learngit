/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-02 15:46:41
 * Copyright © RingCentral. All rights reserved.
 */
import { SECTION_TYPE } from './Section/types';

type LeftRailProps = {};
type LeftRailEntry = {
  title: string;
  icon: string;
  selected: boolean;
  onClick: (evt: any) => void;
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
};

export { LeftRailProps, LeftRailViewProps, LeftRailFilter, LeftRailEntry };
