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
  handleClick: (focusIndex?: number) => void;
};

type ViewProps = {
  caller?: Caller;
  icon: string;
  startTime: string;
  isMissedCall: boolean;
  direction: RCMessage['direction'];
  selected?: boolean;
  makeCall: (event: React.MouseEvent) => void;
};

export { Props, ViewProps };
