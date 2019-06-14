/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:29:47
 * Copyright © RingCentral. All rights reserved.
 */

type Props = {};

type ViewProps = {
  showMinimized: boolean;
  name?: string;
  maximize: () => void;
  timing: string | { key: string };
  id: string;
  canUseTelephony: boolean;
  startMinimizeAnimation: boolean;
};

export { Props, ViewProps };
