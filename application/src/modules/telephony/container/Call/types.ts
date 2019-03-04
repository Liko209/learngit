/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-04 15:26:33
 * Copyright © RingCentral. All rights reserved.
 */

type CallProps = {
  phone: string;
};

type CallViewProps = {
  makeCall: () => void;
};

export { CallProps, CallViewProps };
