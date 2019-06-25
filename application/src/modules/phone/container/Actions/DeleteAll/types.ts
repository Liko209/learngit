/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-24 13:31:52
 * Copyright © RingCentral. All rights reserved.
 */

type DeleteProps = {};

type DeleteViewProps = {
  clearCallLog: () => Promise<boolean | undefined>;
  totalCount: () => Promise<number>;
};

export { DeleteProps, DeleteViewProps };
