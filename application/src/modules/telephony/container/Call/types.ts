/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-04 15:26:33
 * Copyright © RingCentral. All rights reserved.
 */

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
  directCall: () => void;
  showIcon: boolean;
};

export { CallProps, CallViewProps };
