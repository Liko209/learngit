/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-29 14:33:44
 * Copyright © RingCentral. All rights reserved.
 */

type LeftNavProps = {
  id: number;
};

type LeftNavViewProps = {
  expanded: boolean;
  id: string;
  umiCount: number[][];
  handleTitle?: Function;
  handleRouterChange?: ((event: React.MouseEvent<HTMLAnchorElement>) => void);
  icons: {
    icon: string;
    title: string;
  }[][];
};

export { LeftNavProps, LeftNavViewProps };
