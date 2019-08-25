/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-21 16:48:22
 * Copyright © RingCentral. All rights reserved.
 */
import { LeftNav } from '../types';

type LeftRailProps = {
  updateCurrentUrl: (path: string) => void;
  config: LeftNav;
};

type LeftRailViewProps = LeftRailProps;

export { LeftRailProps, LeftRailViewProps };
