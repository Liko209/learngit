/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-02-27 10:46:49
 * Copyright © RingCentral. All rights reserved.
 */

type PinProps = {
  postId: number;
  groupId: number;
};

type PinViewProps = {
  isPin: boolean;
  pin: (pin: boolean) => Promise<void>;
  shouldShowPinOption: boolean;
  shouldDisablePinOption: boolean;
};

export { PinProps, PinViewProps };
