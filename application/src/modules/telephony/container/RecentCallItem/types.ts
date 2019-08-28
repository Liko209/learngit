/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-27 14:16:31
 * Copyright © RingCentral. All rights reserved.
 */
import { Caller } from 'sdk/module/RCItems/types';
import { RCMessage } from 'sdk/module/RCItems';

type Props = {
  id: string;
  selected: boolean;
  onClick: (focusIndex?: number) => void;
  itemIndex: number;
};

type ViewProps = {
  caller?: Caller;
  icon: string;
  startTime: string;
  isMissedCall: boolean;
  direction: RCMessage['direction'];
  selected?: boolean;
  handleClick: (event: React.MouseEvent) => void;
  isTransferPage: boolean;
  selectedCallItemIndex: number;
  itemIndex: number;
};

export { Props, ViewProps };
