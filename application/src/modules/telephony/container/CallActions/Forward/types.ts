/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-05-29 09:31:47
 * Copyright © RingCentral. All rights reserved.
 */
import { PromisedComputedValue } from 'computed-async-mobx';

type Props = {};

type ForwardCall = {
  phoneNumber: string;
  label: string;
};

type ViewProps = {
  forwardCalls: PromisedComputedValue<ForwardCall[]>;
  // getForwardCalls: () => Promise<ForwardCall[]>;
  forward: (phoneNumber: string) => void;
  shouldDisableForwardButton: PromisedComputedValue<boolean>;
};

export { Props, ViewProps, ForwardCall };
