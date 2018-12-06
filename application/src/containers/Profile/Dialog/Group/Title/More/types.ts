/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

type MoreProps = {
  id: number;
};

type MoreViewProps = {
  // isTeam: boolean;
  url: string;
  getEmail: () => string;
};

export { MoreProps, MoreViewProps };
