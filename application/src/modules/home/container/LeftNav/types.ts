/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-29 14:33:44
 * Copyright © RingCentral. All rights reserved.
 */
import { JuiLeftNavProps } from 'jui/pattern/LeftNav';

type LeftNavProps = {
  id: number;
};

type LeftNavViewProps = {
  groupIds: number[];
  expanded: boolean;
  id: string;
  handleTitle?: Function;
  iconGroups: JuiLeftNavProps['icons'];
  onRouteChange?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

export { LeftNavProps, LeftNavViewProps };
