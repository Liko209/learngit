import { AbstractViewModel } from '@/base';
import { InfiniteListDemoViewProps } from './types';

class InfiniteListDemoViewModel extends AbstractViewModel
  implements InfiniteListDemoViewProps {
  onScrollTop = () => {
    console.log('Hit top');
  }
  onScrollBottom = () => {
    console.log('Hit bottom');
  }
}

export { InfiniteListDemoViewModel };
