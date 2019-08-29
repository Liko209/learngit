/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-28 02:17:01
 * Copyright © RingCentral. All rights reserved.
 */
import CallModel from '@/store/models/Call';

type Props = {};

type ViewProps = {
  switchCallItems: CallModel[];
  switchCall: (callId: number) => void;
  endCall: () => void;
  currentCallId: number;
};

export { Props, ViewProps };
