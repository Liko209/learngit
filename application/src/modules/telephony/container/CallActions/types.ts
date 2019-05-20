/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:56:52
 * Copyright © RingCentral. All rights reserved.
 */
type CallActionsProps = {
  showLabel?: boolean;
  shouldPersistBg?: boolean;
};

type CallAction = {
  label: string;
  handleClick: () => void;
  disabled: boolean;
};

type CallActionsViewProps = {
  showLabel?: boolean;
  shouldPersistBg?: boolean;
  callActions: CallAction[];
  shouldDisableCallActions: boolean;
};

export { CallActionsProps, CallActionsViewProps };
