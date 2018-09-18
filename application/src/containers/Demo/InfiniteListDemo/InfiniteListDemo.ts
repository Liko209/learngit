/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:08:52
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { InfiniteListPlugin } from '@/plugins/InfiniteListPlugin';
import { ErrorHandlerPlugin } from '@/plugins/ErrorHandlerPlugin';
import { InfiniteListDemoView } from './InfiniteListDemo.View';
import { InfiniteListDemoViewModel } from './InfiniteListDemo.ViewModel';
import { InfiniteListDemoProps } from './types';

const InfiniteListDemo = buildContainer<InfiniteListDemoProps>({
  ViewModel: InfiniteListDemoViewModel,
  View: InfiniteListDemoView,
  plugins: [
    new InfiniteListPlugin({
      stickTo: 'bottom',
    }),
    new ErrorHandlerPlugin(),
  ],
});

export { InfiniteListDemo, InfiniteListDemoProps };
