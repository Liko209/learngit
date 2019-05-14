/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 15:43:50
 * Copyright © RingCentral. All rights reserved.
 */

type DialerHeaderProps = {
  Back?: React.ComponentType<any>;
};

type DialerHeaderViewProps = {
  isExt: boolean;
  name: string;
  phone?: string;
  uid?: number;
} & DialerHeaderProps;

export { DialerHeaderProps, DialerHeaderViewProps };
