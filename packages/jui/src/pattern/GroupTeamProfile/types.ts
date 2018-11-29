/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 14:40:02
 * Copyright © RingCentral. All rights reserved.
 */

type GroupBodyProps = {
  displayName: string;
  description?: string;
  avatar: any;
  awayStatus?: string;
  jobTitle?: string;
  className?: string;
};
type GroupHeaderProps = {
  title: string;
  dismiss: () => void;
};
export { GroupBodyProps, GroupHeaderProps };
