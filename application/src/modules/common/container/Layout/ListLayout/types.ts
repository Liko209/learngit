/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-21 19:19:20
 * Copyright © RingCentral. All rights reserved.
 */
import { RouteComponentProps } from 'react-router-dom';
import { PageConfig } from '../types';

type LayoutViewProps = RouteComponentProps<{ subPath?: string }> & {
  config: PageConfig;
  updateCurrentUrl: (path: string) => void;
};

export { LayoutViewProps };
