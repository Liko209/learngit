/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-19 15:04:30
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { SectionView } from './Section.View';
import { SectionViewModel } from './Section.ViewModel';
import { SectionProps } from './types';

const Section = buildContainer<SectionProps>({
  ViewModel: SectionViewModel,
  View: SectionView,
});

export { Section, SectionProps };
