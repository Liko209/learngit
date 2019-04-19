/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:56:52
 * Copyright © RingCentral. All rights reserved.
 */

type CallActionsProps = {
  showLabel?: boolean;
};

type CallActionsViewProps = {
  callActions: () => void;
  showLabel?: boolean;
};

export { CallActionsProps, CallActionsViewProps };
