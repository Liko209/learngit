/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-02 15:46:41
 * Copyright © RingCentral. All rights reserved.
 */
import { SECTION_TYPE } from './Section/types';

type LeftRailProps = {
  currentGroupId?: number;
};

type LeftRailViewProps = {
  currentGroupId?: number;
  sections: SECTION_TYPE[];
};

export { LeftRailProps, LeftRailViewProps };
