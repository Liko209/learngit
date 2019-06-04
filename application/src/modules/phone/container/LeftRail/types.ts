/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 10:17:44
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';
import { PhoneUMIType } from '../PhoneUMI/types';

type TabConfig = {
  title: string;
  path: string;
  automationID: string;
  component: ComponentType;
  UMIType?: PhoneUMIType;
};

type LeftRailProps = { current: string };

type LeftRailViewProps = {
  currentTab: string;
  updateCurrentTab: (path: string) => void;
};

export { TabConfig, LeftRailProps, LeftRailViewProps };
