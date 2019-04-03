/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-04 15:26:33
 * Copyright © RingCentral. All rights reserved.
 */
import { PromisedComputedValue } from 'computed-async-mobx';

type CallProps = {
  phone?: string;
  variant?: 'round' | 'plain';
  id?: number;
  groupId?: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  onClick?: () => void;
};

type CallViewProps = {
  phoneNumber: string;
  directCall: () => void;
  showIcon: PromisedComputedValue<boolean>;
};

export { CallProps, CallViewProps };
