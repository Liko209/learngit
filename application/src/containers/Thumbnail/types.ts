/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-21 13:31:38
 * Copyright © RingCentral. All rights reserved.
 */

type Props = {
  id: number;
  width?: number;
  height?: number;
  type?: 'image' | 'file';
};

type ViewProps = {
  fileTypeOrUrl: {
    icon: string;
    url: string;
  };
  type?: 'image' | 'file';
};

export { Props, ViewProps };
