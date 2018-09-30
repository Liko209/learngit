import { buildContainer } from '@/base';
import { UmiView } from './Umi.View';
import { UmiViewModel } from './Umi.ViewModel';

const Umi = buildContainer({
  View: UmiView,
  ViewModel: UmiViewModel,
});

export { Umi };
