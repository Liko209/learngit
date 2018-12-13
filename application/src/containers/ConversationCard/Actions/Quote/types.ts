/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-10 16:17:36
 * Copyright © RingCentral. All rights reserved.
 */

type Props = {
  id: number;
  disabled?: boolean;
};

type ViewProps = {
  quote: () => void;
  disabled?: boolean;
};

export { Props, ViewProps };
