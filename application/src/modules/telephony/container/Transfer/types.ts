/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-22 03:46:38
 * Copyright © RingCentral. All rights reserved.
 */

type Props = {};

type ViewProps = {
  transferCall: () => void;
  completeTransfer: () => void;
  transferNumber: string;
  isWarmTransferPage: boolean;
};

export { Props, ViewProps };
