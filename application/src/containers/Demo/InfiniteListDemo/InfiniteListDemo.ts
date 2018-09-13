import { buildContainer } from '@/base';
import { InfiniteListPlugin } from '@/plugins/InfiniteListPlugin';
import { InfiniteListDemoView } from './InfiniteListDemo.View';
import { InfiniteListDemoViewModel } from './InfiniteListDemo.ViewModel';
import { InfiniteListDemoProps } from './types';

const InfiniteListDemo = buildContainer<InfiniteListDemoProps>({
  ViewModel: InfiniteListDemoViewModel,
  View: InfiniteListDemoView,
  plugins: [new InfiniteListPlugin()],
});

export { InfiniteListDemo, InfiniteListDemoProps };
