/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-06-24 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactNode, ReactElement } from 'react';

interface IJuiEmptyPage {
  (props: IJuiEmptyPageProps): ReactElement;
}

interface IJuiEmptyPageProps {
  height?: number | string;
  image?: string;
  message?: string;
  children?: ReactNode;
}

export { IJuiEmptyPage, IJuiEmptyPageProps };
