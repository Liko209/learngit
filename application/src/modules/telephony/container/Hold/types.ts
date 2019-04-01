/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:56:52
 * Copyright © RingCentral. All rights reserved.
 */
type HoldProps = {};

type HoldViewProps = {
  handleClick: () => void;
  disabled: boolean;
  awake: boolean;
};

export { HoldProps, HoldViewProps };
