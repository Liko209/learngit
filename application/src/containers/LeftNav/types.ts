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
  handleTitle?: Function;
  onRouteChange?: ((event: React.MouseEvent<HTMLAnchorElement>) => void);
  icons: {
    url: string;
    icon: string;
    title: string;
    umi: React.Component;
  }[][];
};

export { LeftNavProps, LeftNavViewProps };
