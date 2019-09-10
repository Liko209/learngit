/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-21 14:39:41
 * Copyright © RingCentral. All rights reserved.
 */

import { Tab } from '../types';

type SectionProps = {
  selectedPath: string;
  title: string;
  tabs: Tab[];
  rootPath: string;
  updateCurrentUrl: (path: string) => void;
};

type SectionViewProps = SectionProps;

export { SectionProps, SectionViewProps };
