/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-05-29 09:31:47
 * Copyright © RingCentral. All rights reserved.
 */
type Props = {};

type ForwardCall = {
  phoneNumber: string;
  label: string;
};

type ViewProps = {
  forwardCalls: ForwardCall[];
  // getForwardCalls: () => Promise<ForwardCall[]>;
  forward: (phoneNumber: string) => void;
  directForward: () => void;
  shouldDisableForwardButton: boolean;
};

export { Props, ViewProps, ForwardCall };
