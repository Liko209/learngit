import { buildContainer } from '@/base';
import { UmiView } from './Umi.View';
import { UmiViewModel } from './Umi.ViewModel';
import { UmiProps } from './types';

const Umi = buildContainer<UmiProps>({
  ViewModel: UmiViewModel,
  View: UmiView,
});

export { Umi };
