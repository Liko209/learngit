/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-05-30 13:55:51
 * Copyright © RingCentral. All rights reserved.
 */

type Props = {};

type ViewProps = {
  quitForward: () => void;
  forward: (val: string) => void;
  makeForwardCall: () => void;
};

export { Props, ViewProps };
