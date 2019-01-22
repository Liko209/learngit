/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-15 10:53:15
 * Copyright © RingCentral. All rights reserved.
 */

import { FileProps, FileViewProps } from '../File.types';

type ImageItemProps = FileProps;

type ImageItemViewProps = {
  url: string;
} & FileViewProps;

export { ImageItemProps, ImageItemViewProps };
