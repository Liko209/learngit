/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 15:43:50
 * Copyright © RingCentral. All rights reserved.
 */

type DialerContainerProps = {};

type DialerContainerViewProps = {
  keypadEntered: boolean;
  dtmf: (digit: string) => void;
};

export { DialerContainerProps, DialerContainerViewProps };
