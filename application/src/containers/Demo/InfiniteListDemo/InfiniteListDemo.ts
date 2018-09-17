import { buildContainer } from '@/base';
import { InfiniteListPlugin } from '@/plugins/InfiniteListPlugin';
import { ErrorHandlerPlugin } from '@/plugins/ErrorHandlerPlugin';
import { InfiniteListDemoView } from './InfiniteListDemo.View';
import { InfiniteListDemoViewModel } from './InfiniteListDemo.ViewModel';
import { InfiniteListDemoProps } from './types';

const InfiniteListDemo = buildContainer<InfiniteListDemoProps>({
  ViewModel: InfiniteListDemoViewModel,
  View: InfiniteListDemoView,
  plugins: [new InfiniteListPlugin(), new ErrorHandlerPlugin()],
});

export { InfiniteListDemo, InfiniteListDemoProps };
